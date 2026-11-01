# Deployment

Production runs on k3s, rolled out by Flux from the `gitops` repo; hosts,
failover and cluster setup live in
[EV-Main/devops](https://github.com/EV-Main/devops). On `evinvest.ltd` this app
serves the coming-soon page (frontend at `/`, backend at `/api/v1`), 404s for the
retired landing pages and 308s the dashboard's old paths to the estate host.

## Deploy

```sh
nix run .#publish -- major|minor|patch
```

That bumps the latest remote `vX.Y.Z` tag and pushes it. The tag triggers the
release workflow (`containerRelease` in `flake.nix`): CI builds the `frontend`
and `backend` OCI images — re-resolving the private inputs (blog, whitepaper)
to fresh `main` — pushes them to `ghcr.io/ev-main`, and Flux
rolls them out (see the `gitops` repo). Frontend and backend are separate
images, so each rolls out independently.
