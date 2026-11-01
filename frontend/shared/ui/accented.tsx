import type { ReactNode } from "react";

/**
 * Renders a translated string whose accent words are marked with `*asterisks*`,
 * and whose line breaks are written as `\n`.
 *
 * The display headings on this site set one word apart in italic serif — "Let's
 * *talk*.", "Invest in *China+1*". Splitting that into two catalogue keys (lead
 * + accent) would hard-code English word order: Russian puts the verb elsewhere,
 * German pushes it to the end, and a translator handed `{lead} <em>{accent}</em>`
 * cannot move it. One key with an inline marker lets the sentence be rearranged
 * freely and keeps the typography. The same argument applies to the line break —
 * where it falls depends on how long the words are in the target language.
 *
 * ## Why this returns a FLAT list
 *
 * It is rendered inside `SplitText`, whose `tokenize` walks `Children.toArray`
 * and understands exactly two things: bare strings (split into animatable words,
 * remembering which had a trailing space) and `<br>` elements (turned into line
 * breaks). Anything else is taken whole as a single word token.
 *
 * So wrapping text in `<Fragment>` — the obvious way to key a mapped list —
 * breaks both features at once: the fragment becomes one opaque token with no
 * trailing space, so "Invest in" runs into the accent word; and a `<br>` hidden
 * inside it is never recognised, so it renders *within* an `inline-block` and
 * turns that span into a two-line box with a large vertical gap. Both of those
 * shipped in #157 and were visible on the production hero.
 *
 * Strings therefore stay strings and `<br>`s stay siblings. React requires keys
 * only for elements in an array, not for strings, so nothing is lost.
 *
 * ## Inside `SplitText`, call {@link accented} instead
 *
 * `SplitText` inspects its children. A *server* `<Accented>` is already rendered
 * by the time it gets there, so it sees the flat list — but from a **client**
 * component the element is still unrendered, so it becomes one opaque token
 * (no per-word motion) and `flattenText` finds no `children` to recurse into,
 * leaving the screen-reader label EMPTY. The heading then announces as nothing.
 *
 * Calling the function inlines the nodes as real children either way, so
 * `SplitText` call sites use `{accented(...)}` and nothing else has to know
 * whether it is running on the server.
 *
 * Deliberately not Markdown, and deliberately not `dangerouslySetInnerHTML`: the
 * only things that need expressing are "this word is the accent" and "break
 * here", and a two-character convention keeps translator-authored strings inert.
 *
 * @example
 * ```tsx
 * <Accented text={t("contact.title")} />   // "Let's *talk*." → Let's <em>talk</em>.
 *
 * // Two accents in different tones — the hero's China+1 / Vietnam pair.
 * <Accented
 *   text={t("home.hero.headline.a")}
 *   classNames={["… text-primary-ink", "… text-positive"]}
 * />
 * ```
 */
export interface AccentedProps {
  text: string;
  className?: string;
  /**
   * One class per accent, in order, for headings that tint their accents
   * differently. Cycles if the string carries more accents than entries — a
   * translation with an extra accent renders in a real tone rather than
   * unstyled.
   */
  classNames?: readonly string[];
}

/** The nodes themselves — use this inside `SplitText`. See the note above. */
export function accented({
  text,
  className = "font-serif italic text-primary-ink",
  classNames,
}: AccentedProps): ReactNode[] {
  const tones = classNames?.length ? classNames : [className];
  const out: ReactNode[] = [];

  // Odd indices are the marked segments: "a *b* c" → ["a ", "b", " c"].
  text.split("*").forEach((part, i) => {
    if (i % 2 === 1) {
      // i is 1, 3, 5… for the 1st, 2nd, 3rd accent.
      const tone = tones[((i - 1) / 2) % tones.length];
      out.push(
        <span key={`a${i}`} className={tone}>
          {part}
        </span>
      );
      return;
    }
    // Plain run: emit each line as its own string with real <br>s between, so
    // `tokenize` sees both. An empty segment contributes nothing — which is what
    // makes "*Accent* first" and a trailing "*Accent*" both come out right.
    part.split("\n").forEach((line, j) => {
      if (j > 0) out.push(<br key={`b${i}-${j}`} />);
      if (line !== "") out.push(line);
    });
  });

  return out;
}

/** JSX wrapper over {@link accented}, for headings that are not split. */
export function Accented(props: AccentedProps): ReactNode {
  return accented(props);
}
