// Finds Tailwind class conflicts in `cn()` calls without having to render them.
//
// `cn` already panics on a conflict (shared/lib/utils.ts), but only in dev and
// only once the offending *combination of branches* is actually rendered — so a
// conflict hiding behind `empty &&` waits for the day a filter chip has zero
// results and then takes the page down. This walks every `cn()` call, enumerates
// what each argument can contribute, and runs the same `twMerge` diff over every
// reachable combination. What dev catches by luck, this catches by construction.
//
// Syntactic only: `ts.createSourceFile`, no type checker. An argument that isn't
// a literal (a `className` prop, a `cva` result, a variable) contributes nothing
// and is skipped — a base conflicting with a caller's override still needs dev
// to surface it.
//
// ponytail: cartesian over branches, capped at MAX_COMBINATIONS. A `cn()` with
// more independent conditions than that is reported as unchecked rather than
// silently sampled; split the call if you ever see one.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import ts from "typescript";
import { twMerge } from "tailwind-merge";

const ROOT = new URL("..", import.meta.url).pathname;
const SOURCE_DIRS = ["app", "views", "application", "shared", "features", "entities"];
const MAX_COMBINATIONS = 512;

function* sourceFiles(dir: string): Generator<string> {
  for (const item of readdirSync(join(ROOT, dir), { withFileTypes: true })) {
    const path = join(dir, item.name);
    if (item.isDirectory()) yield* sourceFiles(path);
    else if (/\.tsx?$/.test(item.name)) yield path;
  }
}

/**
 * Every class string one `cn()` argument can evaluate to. `""` stands for "this
 * argument contributes nothing" — which is both what a falsy `&&` does and the
 * honest answer for an expression that cannot be read statically.
 */
function alternatives(node: ts.Node): string[] {
  if (ts.isParenthesizedExpression(node)) return alternatives(node.expression);
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node))
    return [node.text];
  if (ts.isConditionalExpression(node))
    return [
      ...alternatives(node.whenTrue),
      ...alternatives(node.whenFalse),
    ];
  if (ts.isBinaryExpression(node)) {
    const kind = node.operatorToken.kind;
    if (kind === ts.SyntaxKind.AmpersandAmpersandToken)
      return ["", ...alternatives(node.right)];
    if (
      kind === ts.SyntaxKind.BarBarToken ||
      kind === ts.SyntaxKind.QuestionQuestionToken
    )
      return [...alternatives(node.left), ...alternatives(node.right)];
  }
  return [""];
}

/** The dropped tokens, mirroring the runtime guard in shared/lib/utils.ts. */
function conflictIn(classes: string): string[] {
  const raw = classes.trim();
  if (!raw) return [];
  const kept = new Set(twMerge(raw).split(/\s+/).filter(Boolean));
  return raw.split(/\s+/).filter(token => token && !kept.has(token));
}

const problems: string[] = [];

for (const dir of SOURCE_DIRS) {
  for (const path of sourceFiles(dir)) {
    const text = readFileSync(join(ROOT, path), "utf8");
    if (!text.includes("cn(")) continue;
    const source = ts.createSourceFile(
      path,
      text,
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TSX
    );

    const visit = (node: ts.Node) => {
      if (
        ts.isCallExpression(node) &&
        ts.isIdentifier(node.expression) &&
        node.expression.text === "cn"
      ) {
        const { line } = source.getLineAndCharacterOfPosition(node.getStart());
        const where = `${path}:${line + 1}`;
        const perArgument = node.arguments.map(alternatives);
        const total = perArgument.reduce((n, a) => n * a.length, 1);

        if (total > MAX_COMBINATIONS) {
          problems.push(
            `${where}: ${total} branch combinations exceeds the ${MAX_COMBINATIONS} cap — split this cn() so it can be checked`
          );
        } else {
          // Every reachable combination, built one argument at a time.
          let combinations: string[] = [""];
          for (const choices of perArgument)
            combinations = combinations.flatMap(prefix =>
              choices.map(choice => `${prefix} ${choice}`)
            );
          const seen = new Set<string>();
          for (const combination of combinations) {
            const dropped = conflictIn(combination);
            if (dropped.length === 0) continue;
            const signature = dropped.join(" ");
            if (seen.has(signature)) continue;
            seen.add(signature);
            problems.push(
              `${where}: ${dropped.join(", ")} silently dropped when the branches resolve to\n      "${combination.trim()}"`
            );
          }
        }
      }
      ts.forEachChild(node, visit);
    };
    visit(source);
  }
}

if (problems.length > 0) {
  console.error(
    `${problems.length} Tailwind class conflict${problems.length === 1 ? "" : "s"}:\n`
  );
  for (const problem of problems) console.error(`  ${problem}`);
  console.error(
    "\nThe later utility wins and the earlier one vanishes. Withhold the losing" +
      " utility on the branch that should not have it rather than overriding it."
  );
  process.exit(1);
}

console.log("css: no Tailwind class conflicts reachable through any cn() branch");
