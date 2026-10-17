# site_conductor

Conductor shell of `evinvest.ltd` — Next.js 16 (App Router) + React 19, FSD,
Tailwind v4. The public landing moved to its own host (`INVEST_ORIGIN`, default
`https://invest.evinvest.ltd`, repo EV-Fund/landing). This origin serves the
coming-soon page at `/` (`views/coming-soon`), 301s every retired landing path
there with path and locale kept (`next.config.ts` `redirects()`), and keeps the
auth/KYC rewrites, the REA zone and the cabinet's asset/API/MFE rewrites.
The dev port comes from the `ports` attrset in the repo's `flake.nix`.

## Layout

```
app/          routing + root layout (Server Components by default)
views/        page composition (HomeView), agnostic of A/B
features/     behaviour slices: analytics, ab-variant, error-monitoring, contact-message, job-application, publication-search
entities/     domain data (team, …)
shared/       app-agnostic ui/, lib/, config/, hooks/, mfe/ (microfrontend host)
application/  styles/globals.css → imports @evinvest/uikit/styles/tokens.css
public/       static assets
tests/        per-section Playwright visual baselines
mfe-registry.json  microfrontend registry (name → tag/scriptUrl/kind)
```

FSD import order `app → views → features → entities → shared`; import from a
slice's `index.ts`, never deep paths. Conventions live in [`PATTERNS.md`](./PATTERNS.md).

## Run only the frontend

```sh
nix run .#frontend           # port from flake.nix `ports`
```
This first runs `populate-docs`: it builds `main` of the private
`ev-main/{whitepaper,blog,real_estate_allocation}` flakes over ssh and copies their
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

> Not served on this origin since the move: `/publications`, `/whitepaper` and
> `/apps/*` 301 to the invest host (`next.config.ts` `redirects()`); the code
> under `app/[locale]` stays until removed.

Per-section Playwright screenshots in [`tests/`](./tests) — one baseline per
addressable section (`#hero`, `#portfolio`, `#calculator`, `#research`, `#team`,
plus header/footer). Browsers come from nixpkgs, pinned to the `@playwright/test`
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
[`PATTERNS.md` §8](./PATTERNS.md)). Two transports from `@/shared/mfe`:

| Remote ships… | Use | Mount |
| --- | --- | --- |
| a self-registering custom-element ESM bundle (React, Rust/WASM) | `RemoteElement` | light DOM; inline or `/apps/<name>` |
| a self-contained static HTML document (typst whitepaper/blog) | `RemoteDocument` | light DOM (`prose`) or, if self-styled, a shadow root |

### Element remotes — `RemoteElement`

Inline widgets or whole pages, JS bundles (React, …) or Rust/WASM (Dioxus, Leptos).

**Universal contract — a custom element.** Every microfrontend ships one
self-registering ESM bundle that calls `customElements.define("mfe-<service>-<name>", …)`.
The host mounts it with [`<RemoteElement>`](./shared/mfe/remote-element.tsx): load
the bundle by URL → `customElements.whenDefined(tag)` → render `<tag>`, mapping
props to attributes and CustomEvents to callbacks. The boundary is identical for
every framework. **Light DOM only** — Tailwind v4 `@property` tokens break inside
shadow roots, and the global uikit tokens must cascade in.

- **Registry.** A logical name resolves to `{tag, scriptUrl, kind}` from
  [`mfe-registry.json`](./mfe-registry.json) (served to the browser at
  `/api/mfe-registry`). Remotes deploy independently — add an entry, don't rebuild
  site_conductor. Tags are globally unique and versioned. Registry reads
  (`shared/mfe/registry.ts`) use `node:fs` and are **server-only**; the client-safe
  `RemoteElement` is the public API from `@/shared/mfe`. `scriptUrl`s are
  operator-controlled and served openly at `/api/mfe-registry` — **treat registry
  edits as code** (they execute third-party JS in the site_conductor origin); gate them
  against an origin allowlist if the registry ever becomes user-/dynamically-sourced.

  ```jsonc
  // mfe-registry.json — kind:"page" names must be a single URL segment (no dots)
  [{ "name": "calculator.yield", "tag": "mfe-calculator-yield",
     "scriptUrl": "https://cdn.example.com/yield.js", "kind": "component" }]
  ```

- **Inline widget** — render `<RemoteElement>` anywhere (resolve the entry server-side
  with `findMfe` from `@/shared/mfe/registry`, or pass `tag`/`scriptUrl` directly):

  ```tsx
  <RemoteElement tag="mfe-calculator-yield" scriptUrl="…"
    fallback={<p>loading…</p>} />
  ```

- **Whole page** — register an entry with `"kind": "page"`; it mounts at
  `/apps/<name>/…` ([`app/[locale]/apps/[service]/[[...slug]]`](<./app/[locale]/apps>)) and owns the
  content region while site_conductor keeps its chrome. Scoped under `/apps` (not a root
  catch-all) so it never shadows the marketing routes or the real 404.

  > Not served on this origin since the move: `/publications`, `/whitepaper` and
  > `/apps/*` 301 to the invest host (`next.config.ts` `redirects()`); the code
  > under `app/[locale]` stays until removed.

**Producing a microfrontend** (other repos — site_conductor ships no producer SDK). The
canonical, fuller recipe lives in the hub's
[`docs/ARCHITECTURE.md` § Microfrontends](https://github.com/EV-Main/banking/blob/main/docs/ARCHITECTURE.md#microfrontends); the
contract is shared with `cabinet`, so keep this in sync with it.

- **React** — wrap a component as a custom element with
  [`@r2wc/react-to-web-component`](https://github.com/bitovi/react-to-web-component);
  ship it as one ESM bundle that self-registers. _Optional_ for React-to-React
  widgets: Module Federation 2.0 **runtime** (`@module-federation/runtime` +
  `bridge-react`) to share one React instance — never `@module-federation/nextjs-mf`.
- **Rust/WASM** — Dioxus 0.7 mounts via `dioxus-web` `Config::rootelement(Element)`
  into the custom element; Leptos via `mount_to(HtmlElement, …)`. CSR-only, light
  DOM, `wasm-bindgen =0.2.125`. Don't use `dioxus-web-component` yet (it pins Dioxus
  0.6). _Open item:_ prove multiple independent Dioxus instances per page before
  relying on it.

### Document remotes — `RemoteDocument`

> Not served on this origin since the move: `/publications`, `/whitepaper` and
> `/apps/*` 301 to the invest host (`next.config.ts` `redirects()`); the code
> under `app/[locale]` stays until removed.

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
