# site_conductor
![Minimum Supported Rust Version](https://img.shields.io/badge/nightly-1.92+-ab6000.svg)

`site_conductor` is the umbrella site of **EV Investment** at `evinvest.ltd`: a
"coming soon" page at `/` linking out to each EV project —
[EV Estate](https://estate.evinvest.ltd) (the real-estate fund's landing,
EV-Estate/landing), [Service-Arb](https://sa.evinvest.ltd) and the
[EV-Main](https://github.com/EV-Main) GitHub org. It answers 404 for every
retired landing page — `/whitepaper`, `/blogs/*`, `/publications/*`, `/team`,
`/hiring`, … — with or without a locale prefix, and 308s the analytics
dashboard's old paths (`/analytics`, `/data`, `/rea*`) to
`https://estate.evinvest.ltd/analytics`. A Next.js 16 (App Router) front end in
[`frontend/`](frontend) lives alongside an axum API in [`backend/`](backend). The
shared design system ships as the published `@evinvest/uikit`.
<!-- markdownlint-disable -->
<details>
<summary>
<h2>Installation</h2>
</summary>

## Deployment

Production runs on k3s, rolled out by Flux from the `gitops` repo; hosts,
failover and cluster setup live in
[EV-Main/devops](https://github.com/EV-Main/devops). On `evinvest.ltd` this app
serves the coming-soon page (frontend at `/`, backend at `/api/v1`), 404s for the
retired landing pages and 308s the dashboard's old paths to the estate host.

### Deploy

```sh
nix run .#publish -- major|minor|patch
```

That bumps the latest remote `vX.Y.Z` tag and pushes it. The tag triggers the
release workflow (`containerRelease` in `flake.nix`): CI builds the `frontend`
and `backend` OCI images — re-resolving the private inputs (blog, whitepaper)
to fresh `main` — pushes them to `ghcr.io/ev-main`, and Flux
rolls them out (see the `gitops` repo). Frontend and backend are separate
images, so each rolls out independently.

</details>
<!-- markdownlint-restore -->

## Usage
### Local development

Everything runs via Nix, token-free:

Ports live in one place — the `ports` attrset in `flake.nix`; the runners
export them, so nothing here hardcodes a number.

| Command | What |
| --- | --- |
| `nix run .#dev` | full stack: shared postgres + backend + frontend |
| `nix run .#frontend` | Next.js site only |
| `nix run .#backend` | axum API only (ensures the shared postgres) |
| `nix run .#db` | ensure the shared ev_invest postgres is up (+ this repo's `site_conductor` db) |
| `nix run .#gen-api` | regenerate `backend/openapi.json` + the TS client (run after any DTO/handler change; commit both) |
| `nix run .#test` | frontend typecheck + Playwright visual regression |
| `nix run .#accept-test` | accept new screenshots (all, or `-- <names>`) |
| `nix run .#publish` | bump latest remote `vX.Y.Z` tag (`-- major\|minor\|patch`) + push |

Frontend runs build docs from `main` of the private `EV-Estate/whitepaper` and
`EV-Main/blog` repos (over ssh). A failed build just warns: docs degrade to a PDF
link.

### Microfrontends — no iframes

Other EV surfaces compose at runtime through `frontend/shared/mfe`, never via
`<iframe>`. Full reference: [`frontend/PATTERNS.md` §8](./frontend/PATTERNS.md)
and [`frontend/README.md`](./frontend/README.md).

- **Document remotes (`RemoteDocument`)** — `/whitepaper` and `/blogs/[slug]`
  are static HTML from the sibling typst repos. Blog injects into light DOM
  (SSR'd, host-styled); whitepaper mounts in a shadow root (ships its own CSS).
  Unloadable doc → PDF-link fallback.



<br>

<sup>
	This repository follows <a href="https://github.com/valeratrades/.github/tree/master/best_practices">my best practices</a> and <a href="https://github.com/tigerbeetle/tigerbeetle/blob/main/docs/TIGER_STYLE.md">Tiger Style</a> (except "proper capitalization for acronyms": (VsrState, not VSRState) and formatting). For project's architecture, see <a href="./docs/ARCHITECTURE.md">ARCHITECTURE.md</a>.
</sup>

#### License

<sup>
	Licensed under <a href="LICENSE">Blue Oak 1.0.0</a>
</sup>

<br>

<sub>
	Unless you explicitly state otherwise, any contribution intentionally submitted
for inclusion in this crate by you, as defined in the Apache-2.0 license, shall
be licensed as above, without any additional terms or conditions.
</sub>

