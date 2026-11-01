# site_conductor

Umbrella site of `evinvest.ltd` — Next.js 16 (App Router) + React 19, FSD,
Tailwind v4. It serves the coming-soon page at `/` (`views/coming-soon`), linking
out to each EV project, answers 404 for every retired landing page, with or
without a locale prefix (`next.config.ts` `rewrites()`), and 308s the analytics
dashboard's old paths to `https://estate.evinvest.ltd/analytics`.
The dev port comes from the `ports` attrset in the repo's `flake.nix`.

## Layout

```
app/          routing + root layout (Server Components by default)
views/        page composition (ComingSoonView, …), agnostic of A/B
features/     behaviour slices: analytics, ab-variant, error-monitoring, contact-message, job-application, publication-search
entities/     domain data (team, …)
shared/       app-agnostic ui/, lib/, config/, hooks/, mfe/ (microfrontend host)
application/  styles/globals.css → imports @evinvest/uikit/styles/tokens.css
public/       static assets
tests/        per-section Playwright visual baselines
```

FSD import order `app → views → features → entities → shared`; import from a
slice's `index.ts`, never deep paths. Conventions live in [`PATTERNS.md`](./PATTERNS.md).

## Run only the frontend

```sh
nix run .#frontend           # port from flake.nix `ports`
```
This first runs `populate-docs`: it builds `main` of the private
`EV-Estate/whitepaper` and `EV-Main/blog` flakes over ssh and copies their
output into `public/`. A failed build only warns — the dev server still boots and the
doc pages degrade to a PDF link.

Or inside the dev shell (`.envrc` + direnv), which runs `populate-docs` on entry:
```sh
cd site_conductor/frontend && npm install && npm run dev
```
Tailwind builds automatically inside Next via the `@tailwindcss/postcss` plugin —
no separate step. It imports the shared tokens from
`@evinvest/uikit/styles/tokens.css` through `application/styles/globals.css`;
tokens are owned by [`EV-Main/lib`](https://github.com/EV-Main/lib) and
reach this repo through a `@evinvest/uikit` bump, never a local edit.

## Checks

```sh
npm run lint                 # eslint
npm run check                # tsc --noEmit
```

## Visual-regression tests

> Not served on this origin since the move: `/publications` and `/whitepaper`
> answer 404 (`next.config.ts` `rewrites()`); the code under
> `app/[locale]` stays until removed.

Playwright screenshots of the coming-soon page in [`tests/`](./tests) — one
baseline per viewport. Browsers come from nixpkgs, pinned to the `@playwright/test`
revision via the flake, so screenshots are reproducible.
```sh
npm run test:visual          # compare against committed baselines
npm run test:visual:update   # regenerate baselines after an intentional UI change
```
> Linux-only via nix; skip locally on macOS.

> The site calls only its own backend (vacancies / applications / contact)
> through the generated client in `shared/api` — there is no hub API client here.

## Microfrontends

site_conductor composes other EV surfaces at runtime — **never via `<iframe>`** (see
[`PATTERNS.md` §8](./PATTERNS.md)) — through `RemoteDocument` from `@/shared/mfe`:
a self-contained static HTML document (typst whitepaper/blog), mounted in light DOM
(`prose`) or, if self-styled, a shadow root.

### Document remotes — `RemoteDocument`

> Not served on this origin since the move: `/publications` and `/whitepaper`
> answer 404 (`next.config.ts` `rewrites()`); the code under
> `app/[locale]` stays until removed.

For remotes that are a self-contained **static HTML document** (the typst-built
[whitepaper](<./app/[locale]/publications/whitepaper>) and
[publications](<./app/[locale]/publications>)) rather than a custom-element
bundle. The document is addressed by URL (site-relative → read from `public/`;
absolute → fetched, so a doc service can move to its own origin) and composed into
the page natively, keeping the host chrome and scroll.

```tsx
// research article — no styles of its own: light DOM + host typography (prose),
// rendered server-side (SSR'd, indexable)
<RemoteDocument src={`/publications/${slug}.dark.html`} className="prose prose-invert …" />

// whitepaper — ships its own complete styles targeting bare tags: isolate it in a
// shadow root (a small client island; see PATTERNS.md for the React-19/DSD caveat)
<RemoteDocument src="/whitepaper.dark.html" isolate fallback={…PDF link…} />
```

`isolate={false}` (default) is a pure Server Component; `isolate` mounts a client
shadow island. A source that can't be loaded renders the `fallback`, so a missing
doc build degrades gracefully. The docs are produced by the sibling `whitepaper`/
`blog` repos and copied into `public/` by the flake's `populate-docs` (see
[`../flake.nix`](../flake.nix)).

## Design system (Figma)

The visual language is mirrored in a Figma file
([`Main`](https://www.figma.com/design/e0V2P1cQpEFRuXTeNtEMh6/Main)), kept
**code-first**: [`application/styles/globals.css`](./application/styles/globals.css)
plus the shared `@evinvest/uikit/styles/tokens.css` (from
[`EV-Main/lib`](https://github.com/EV-Main/lib)) are the source of truth;
the Figma side is conformed to them, never the reverse.

- **Tokens → Figma Variables.** Three collections mirror the CSS tokens 1:1, each
  with `var(--token)` code syntax so Dev Mode round-trips cleanly: `ev/color`
  (the kit's roles and surfaces from `@evinvest/uikit/styles/tokens.css`:
  surfaces background / card / popover / muted, ink / ink-mid / ink-soft, lines
  border / input / ring, filled roles brand / primary + primary-ink / secondary /
  positive, and the accent ladder trace → debug → info → warn → error),
  `ev/semantic` (shadcn roles aliased onto `ev/color`), `ev/radius` (the
  `--radius` scale).
- **Components.** The shadcn `bricks` are rebuilt as Figma variant-sets bound to
  those Variables (Button, Badge, Input/Field, Checkbox, Switch, Card, Select,
  Tabs, Accordion, Tooltip), on a dark navy surface. Fonts: Inter (sans) +
  Playfair (display).

> Code Connect (the design↔code mapping) is intentionally **not** wired up: it
> requires a Figma Organization/Enterprise plan and the file is on Pro. Tokens and
> variant-sets work regardless.
