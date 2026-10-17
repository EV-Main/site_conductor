# Deployment

Production runs on k3s, rolled out by Flux from the `gitops` repo; hosts,
failover and cluster setup live in
[EV-Main/devops](https://github.com/EV-Main/devops). On `evinvest.ltd` this app
serves the coming-soon page, the 301s to `invest.evinvest.ltd` and the
auth/KYC/zone rewrites; the landing itself is EV-Fund/landing.

## Deploy

```sh
nix run .#publish -- major|minor|patch
```

That bumps the latest remote `vX.Y.Z` tag and pushes it. The tag triggers the
release workflow (`containerRelease` in `flake.nix`): CI builds the `frontend`
and `backend` OCI images — re-resolving the private inputs (REA embeds, blog,
whitepaper) to fresh `main` — pushes them to `ghcr.io/ev-main`, and Flux
rolls them out (see the `gitops` repo). Frontend and backend are separate
images, so each rolls out independently.
