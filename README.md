# site_conductor
![Minimum Supported Rust Version](https://img.shields.io/badge/nightly-1.92+-ab6000.svg)

`site_conductor` is the conductor shell of `evinvest.ltd` for **EV Investment** — a
real-estate advisory and investment fund specializing in premium coastal
developments in Quy Nhon, Vietnam. The public landing moved to its own host,
`invest.evinvest.ltd` (repo EV-Fund/landing); this origin now serves a
"coming soon" page at `/` and 301s every retired landing path — `/whitepaper`,
`/blogs/*`, `/publications/*`, `/team`, `/hiring`, … — there with path and locale
kept. It still carries sign-in and KYC (rewrites to the concierge plane), the
REA zone and the cabinet's asset/API/MFE rewrites. A Next.js 16 (App Router)
front end in [`frontend/`](frontend) lives alongside an axum API in
[`backend/`](backend). The shared design system ships as the published
`@evinvest/uikit`.
<!-- markdownlint-disable -->
<details>
<summary>
<h2>Installation</h2>
</summary>

## Deployment

Production runs on k3s, rolled out by Flux from the `gitops` repo; hosts,
failover and cluster setup live in
[EV-Main/devops](https://github.com/EV-Main/devops). On `evinvest.ltd` this app
serves the coming-soon page, the 301s to `invest.evinvest.ltd` and the
auth/KYC/zone rewrites; the landing itself is EV-Fund/landing.

### Deploy

```sh
nix run .#publish -- major|minor|patch
```

That bumps the latest remote `vX.Y.Z` tag and pushes it. The tag triggers the
release workflow (`containerRelease` in `flake.nix`): CI builds the `frontend`
and `backend` OCI images — re-resolving the private inputs (REA embeds, blog,
whitepaper) to fresh `main` — pushes them to `ghcr.io/ev-main`, and Flux
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

Frontend runs build docs and the REA bundle from `main` of the private
`ev-main/{whitepaper,blog,real_estate_allocation}` repos (over ssh). A failed
build just warns: docs degrade to a PDF link, the portfolio section falls back
to the in-repo render. For a live REA remote instead of the baked bundle: run
`nix run .#dev` in a `real_estate_allocation` checkout (→ :59079, verify with
`nix run .#healthcheck` there).

### Microfrontends — no iframes

Other EV surfaces compose at runtime through `frontend/shared/mfe`, never via
`<iframe>`. Full reference: [`frontend/PATTERNS.md` §8](./frontend/PATTERNS.md)
and [`frontend/README.md`](./frontend/README.md).

- **Element remotes (`RemoteElement`)** — the home "Premium Asset Portfolio"
  section is `real_estate_allocation`'s self-registering custom element
  `<mfe-real-estate-overview>`, mounted in light DOM and resolved from
  `frontend/mfe-registry.json`. `scriptUrl`s run third-party JS in our origin —
  treat the registry as code.
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

