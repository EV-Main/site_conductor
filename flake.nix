{
  inputs = {
    v_flakes.url = "github:valeratrades/v_flakes?ref=v1.6";
    ev_assets = { url = "github:ev-main/assets"; flake = false; };
  };
  outputs = { self, v_flakes, ev_assets }:
    let
      inherit (v_flakes) flake-utils pre-commit-hooks;
      # Private canonical sources baked into the frontend image. Deliberately NOT
      # flake inputs: as impure getFlake refs they carry no flake.lock entry and no
      # narHash, so they can never drift or fail a hash check — every build just
      # takes latest `main`. Costs `--impure`. Fetched over ssh (your key locally;
      # per-repo deploy keys on the release runner — see github.containerRelease).
      # The owner spelling must match `deployKeys` below byte for byte: the CI
      # key routing is a case-sensitive git `insteadOf` prefix on these URLs.
      privateSrc = {
        blog = "git+ssh://git@github.com/EV-Main/blog?ref=refs/heads/main";
        whitepaper = "git+ssh://git@github.com/EV-Estate/whitepaper?ref=refs/heads/main";
      };
      private = builtins.mapAttrs (_: builtins.getFlake) privateSrc;
    in
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = import v_flakes.default_nixpkgs {
          inherit system;
          config.allowUnfree = true;
        };
        # Canonical toolchain pinned in v_flakes — byte-identical across repos, so
        # the nix store dedups it and sccache cross-references compilations.
        rust = v_flakes.rs.default_nightly system;
        rustBuild = v_flakes.rs.build_nightly system;
        # v_flakes ships the treefmt hook; we extend it with the same `.#test`
        # derivation (typecheck + Playwright visual regression). Kept on pre-push,
        # not pre-commit — a full visual run per commit is too slow; flip `stages`
        # to ["pre-commit"] if you want it on every commit.
        preCommitBase = v_flakes.files.preCommit {
          inherit pkgs;
          # next/image decodes the source on every cache miss on the weak pod (#236)
          webAssets = {
            allow = [ "frontend/app/apple-icon.png" "frontend/app/favicon.ico" "frontend/public/opengraph-image.png" "frontend/tests/__screenshots__/" ];
          };
        };
        pre-commit-check = pre-commit-hooks.lib.${system}.run (preCommitBase // {
          hooks = preCommitBase.hooks // {
            test = {
              enable = true;
              name = "nix run .#test (typecheck + visual regression)";
              entry = "${runTestHook}/bin/run-test-hook";
              pass_filenames = false;
              stages = [ "pre-push" ];
            };
            # `messages/en/common.json` is generated out of the `t(key, english)`
            # call sites, so a push where the two disagree ships a catalogue that
            # describes copy nothing renders — and every drift check for the other
            # four locales is then measured against that phantom source.
            #
            # Deliberately NOT folded into the `test` hook above, which skips
            # unprotected refs and unchanged trees: this is a repo invariant, so it
            # runs on every push with no exemptions. It costs ~1.5s (an AST walk,
            # no type checker), which is what makes that affordable. `nix run
            # .#test` and `prebuild` run it too; this is the one that cannot be
            # bypassed, since the container build calls `next build` directly.
            i18n = {
              enable = true;
              name = "i18n catalogue matches code (translation policy 1.1/1.2)";
              entry = "${runI18nCheck}/bin/run-i18n-check";
              pass_filenames = false;
              stages = [ "pre-push" ];
            };
          };
        });
        pname = "main-site-conductor";
        # ── ev_invest dev topology (single source of truth for ports) ───────
        # ONE shared postgres serves every sibling repo (banking/concierge mirror
        # these values). Postgres database name == app name. Web UIs cluster on
        # 5006x.
        ports = {
          POSTGRES_PORT = "5432";
          SITE_CONDUCTOR_FRONTEND_PORT = "58843";
          SITE_CONDUCTOR_BACKEND_PORT = "58844";
        };
        # The one public origin: the site at `/`, the backend under `/api/v1`.
        siteUrl = "https://evinvest.ltd";
        # DEFAULTS, not overrides: anything already set in the environment (or a
        # sourced `.env`) wins — machines with non-standard ports stay working.
        portEnv = pkgs.lib.concatStrings (pkgs.lib.mapAttrsToList (n: v: "export ${n}=\"\${${n}:-${v}}\"\n") ports);
        backendCargo = (builtins.fromTOML (builtins.readFile ./backend/Cargo.toml)).package;
        # PostHog project key (phc_…). A browser value by construction: it is
        # inlined into the client bundle and shipped to every visitor, so it is
        # not a secret and lives here as a literal, not in sops (rpi5.nix README:
        # "The browser values are not here, by construction"). One project for
        # the site AND the cabinet so the funnel is continuous — banking bakes
        # the same key (PostHog Cloud US, project 614067). Empty ⇒
        # @evinvest/analytics mounts a no-op sink.
        posthogKey = "phc_sBwWEgdgockVmfyucBRkTTo6iZ4Y2eApSGorD22WLzj3";
        posthogHost = "https://us.i.posthog.com";

        logoSrc = "${ev_assets}/logo/logo.svg";

        rs = v_flakes.rs { inherit pkgs rust; };
        github = v_flakes.github {
          inherit pkgs pname rs;
          enable = true;
          # Public repo → public Cachix (`ev-invest`); pull deps + push built paths.
          # Pushing needs the CACHIX_AUTH_TOKEN secret. See v_flakes cache.nix.
          cache = { cachix = "ev-invest"; };
          lastSupportedVersion = "nightly-2026-05-12";
          # The frontend image bakes private inputs (blog, whitepaper),
          # so the release runner needs read access to each — one read-only deploy key
          # per repo (provision: `git_ops init-deploy-key <owner>/<repo>`).
          # `ev-main/blog` is listed twice on purpose: whitepaper's own blog input is
          # spelled lowercase, and the insteadOf prefix is case-sensitive, so each
          # spelling needs its own rewrite.
          # refresh: private sources are getFlake "?ref=main" refs (off flake.lock); refresh
          # implies --impure AND --refresh so each release re-resolves them fresh (a warm nix
          # cache would otherwise bake a stale main). buildTiming: per-component build bar chart.
          containerRelease = { registry = "ghcr.io/ev-main"; deployKeys = [ "EV-Main/blog" "ev-main/blog" "EV-Estate/whitepaper" ]; refresh = true; buildTiming = true; };
          gitignore.extra = ''
            ## generated by populate-docs; source imagery lives in frontend/assets/
            frontend/public/
            ## Node / Next.js
            node_modules/
            .next/
            .turbo/
            out/
            *.tsbuildinfo
            ## Env
            .env
            .env.local
            ## Playwright
            test-results/
            playwright-report/
            ## Local DB (nix run .#db / .#dev)
            .pg/
            ## LLMs
            AGENTS.md
            CLAUDE.md
            .claude/
          '';
          jobs = {
            warnings.augment = [ "tokei" "code-duplication" ];
            other.augment = [ "loc-badge" ];
          };
          lfs = true;
          visualBaselines = { dir = "frontend/tests/__screenshots__"; render = "accept-test"; gate = "test"; paths = [ "frontend/**" "flake.nix" "flake.lock" ]; };
        };
        readme = v_flakes.readme-fw {
          inherit pkgs pname;
          defaults = true;
          lastSupportedVersion = "nightly-1.92";
          rootDir = ./.;
          # No crate is published yet (the backend is a placeholder), so keep only the badge that always resolves.
          badges = [ "msrv" ];
        };
        combined = v_flakes.utils.combine { inherit rust; modules = [ rs github readme ]; };

        # ── production backend: binary + OCI image ──────────────────────────
        rustPlatform = pkgs.makeRustPlatform { cargo = rustBuild; rustc = rustBuild; };
        backendSrc = pkgs.lib.cleanSourceWith {
          src = ./.;
          # .cargo holds dev-only accelerators (sccache rustc-wrapper, cranelift) that
          # the hermetic sandbox lacks — let nix's vendor config drive the build instead.
          filter = path: _type:
            ! builtins.elem (baseNameOf path) [ "target" "node_modules" ".pg" ".direnv" ".next" ".git" ".cargo" "frontend" "tmp" "docs" "result" ];
        };
        backendBin = rustPlatform.buildRustPackage {
          pname = backendCargo.name;
          version = backendCargo.version;
          src = backendSrc;
          cargoLock = {
            lockFile = ./Cargo.lock;
            # ev_lib is a rev-pinned public git dep — builtin fetchGit needs no hash.
            allowBuiltinFetchGit = true;
          };
          cargoBuildFlags = [ "-p" "backend" "--bin" "backend" ];
          # swagger feature fetches its UI bundle over the network, which the sandbox forbids.
          buildNoDefaultFeatures = true;
          # cmake/perl/bindgen → aws-lc-sys; openssl/pkg-config → sentry's native-tls.
          nativeBuildInputs = with pkgs; [ pkg-config cmake perl mold pkgs.rustPlatform.bindgenHook ];
          buildInputs = with pkgs; [ openssl ];
          doCheck = false;
        };
        # ── frontend production image (Next.js standalone) ──────────────────
        frontendApp = pkgs.buildNpmPackage {
          pname = "main-site-conductor-frontend";
          version = "1.0.0";
          src = ./frontend;
          # build node_modules straight from package-lock.json — no FOD hash to drift on release builds.
          npmDeps = pkgs.importNpmLock { npmRoot = ./frontend; };
          npmConfigHook = pkgs.importNpmLock.npmConfigHook;
          env = {
            NEXT_TELEMETRY_DISABLED = "1";
            NEXT_PUBLIC_SITE_URL = siteUrl;
            NEXT_PUBLIC_API_URL = siteUrl;
            # NEXT_PUBLIC_* are inlined at `next build`; the runtime copies in the
            # container contract below cover dynamic renders.
            NEXT_PUBLIC_POSTHOG_KEY = posthogKey;
            NEXT_PUBLIC_POSTHOG_HOST = posthogHost;
          };
          # call next build directly (npm run build chains stylelint, a CI gate that shouldn't fail the image).
          buildPhase = ''
            runHook preBuild
            mkdir -p public/assets public/publications
            cp -rL --no-preserve=mode assets/. public/assets/
            cp -f --no-preserve=mode ${logoSrc} public/assets/logo.svg
            # Raster twin of the same mark for transactional email: mail clients
            # broadly refuse SVG in <img>, so the backend's shell links this. 2x
            # the 37x32 the design lays out, for retina.
            ${pkgs.librsvg}/bin/rsvg-convert --width=74 --height=64 --format=png -o public/assets/email-logo.png ${logoSrc}
            wp=${private.whitepaper.packages.${system}.default}
            cp -f --no-preserve=mode "$wp/whitepaper.pdf" "$wp/whitepaper.light.html" "$wp/whitepaper.dark.html" public/
            for dir in ${private.blog.packages.${system}.default}/*/; do
              slug="$(basename "$dir")"
              # Guarded: the blog build can legitimately emit a directory with
              # no documents in it, and an unguarded cp would fail the image.
              [ -e "$dir/main.pdf" ]        && cp -f --no-preserve=mode "$dir/main.pdf"        "public/publications/$slug.pdf"
              [ -e "$dir/main.light.html" ] && cp -f --no-preserve=mode "$dir/main.light.html" "public/publications/$slug.light.html"
              [ -e "$dir/main.dark.html" ]  && cp -f --no-preserve=mode "$dir/main.dark.html"  "public/publications/$slug.dark.html"
              # Cover art and self-hosted footage, when the article ships any.
              # Sibling of the documents so `data-src="/publications/<slug>/…"`
              # resolves straight out of public/ with no rewrite.
              if [ -d "$dir/media" ]; then
                mkdir -p "public/publications/$slug"
                cp -rf --no-preserve=mode "$dir"/media/. "public/publications/$slug/"
              fi
            done
            # The catalogue. It is a source file (entities/publication) rather
            # than a public/ artefact because public/ is gitignored and the seed
            # has to be committed for a flake-less `npm run dev` to work — so the
            # build overwrites the seed in place, right before next build reads it.
            if [ -f "${private.blog.packages.${system}.default}/index.json" ]; then
              cp -f --no-preserve=mode "${private.blog.packages.${system}.default}/index.json" entities/publication/model/catalogue.json
            fi
            # The social card is re-rendered from SITE copy here; the committed
            # public/opengraph-image.png only exists so a bare checkout serves one.
            node_modules/.bin/tsx scripts/build-og.tsx
            node_modules/.bin/next build
            runHook postBuild
          '';
          installPhase = ''
            runHook preInstall
            mkdir -p $out
            cp -r .next/standalone/. $out/
            cp -r .next/static $out/.next/static
            # merge, don't nest: standalone already traced its own copy of public/,
            # so `cp -r public $out/public` landed a second one at $out/public/public.
            mkdir -p $out/public
            cp -rf --no-preserve=mode public/. $out/public/
            # Next writes its image and ISR caches under the (read-only) store path. `/tmp` is the
            # pod's emptyDir: a cache is scoped to the release, since Next's image cache key ignores
            # the source file's content. Not a subdir: Next's recursive mkdir fails through a dangling link.
            ln -sT /tmp $out/.next/cache
            ln -sT /tmp $out/.next/server/route-cache
            runHook postInstall
          '';
          dontNpmInstall = true;
        };

        # Separate containers so each rolls out independently — a frontend deploy never touches the API. DATABASE_URL comes from the k8s Secret, not baked in.
        containerStd = v_flakes.container.implement {
          inherit pkgs pname;
          containers.backend = {
            port = 58844;
            healthPath = "/api/v1/health";
            criticality = "high";
            entrypoint = [ "/bin/backend" ];
            contents = [ backendBin ];
            imageEnv = [ "BIND_ADDR=0.0.0.0:58844" "APP_ENV=production" ];
            # Transactional email. The code's defaults still say evinvest.vn, so
            # these are not optional: unset ⇒ mail would be sent from — and link
            # to — the wrong domain. SMTP_PASSWORD is the only real secret and
            # arrives via the k8s Secret (`kubernetes-site-conductor-backend`);
            # without it config.rs yields `smtp: None` and every send is a
            # logged no-op, so mail silently stops rather than erroring.
            env = {
              SMTP_HOST = "smtp.gmail.com";
              SMTP_PORT = "587";
              SMTP_USERNAME = "admin@evinvest.ltd";
              MAIL_FROM = "EV Investment <admin@evinvest.ltd>";
              MAIL_TEAM = "admin@evinvest.ltd";
              SITE_URL = siteUrl;
            };
          };
          containers.frontend = {
            port = 58843;
            healthPath = "/";
            criticality = "high";
            # V8 sizes its heap without regard to the pod's 256Mi limit, so at low
            # traffic it defers major GC until the cgroup OOM-kills the pod (#236).
            # Retained heap plateaus at ~80 MB under load; 128 leaves the rest of
            # the limit to Node's off-heap memory.
            entrypoint = [ "${pkgs.nodejs}/bin/node" "--max-old-space-size=128" "${frontendApp}/server.js" ];
            contents = [ pkgs.nodejs frontendApp ];
            workingDir = "${frontendApp}";
            # glibc's per-thread arenas keep sharp/libvips' freed decode buffers resident, so each
            # image optimization ratchets RSS until the OOM kill (#236).
            imageEnv = [ "PORT=58843" "HOSTNAME=0.0.0.0" "NODE_ENV=production" "MALLOC_ARENA_MAX=2" ];
            env = {
              # config.ts reads env dynamically (process.env[name]), so nothing is
              # inlined server-side: every dynamic render (ISR revalidate, RSC nav,
              # cookied request) needs these at RUNTIME too — build-time env only
              # covers the prerender. Missing ⇒ module-eval throw ⇒ 500.
              NEXT_PUBLIC_API_URL = siteUrl;
              NEXT_PUBLIC_SITE_URL = siteUrl;
              NEXT_PUBLIC_POSTHOG_KEY = posthogKey;
              NEXT_PUBLIC_POSTHOG_HOST = posthogHost;
              # Server Component fetches stay in-cluster instead of hairpinning
              # through the Cloudflare tunnel.
              API_URL_INTERNAL = "http://main-site-conductor-backend:58844";
            };
          };
        };

        # ── shared shims ────────────────────────────────────────────────────
        # macOS rust-lld looks for libLLVM.dylib in bin/../lib/; Nix puts it in lib/. FALLBACK only kicks in when normal resolution fails.
        dyldFallback = ''export DYLD_FALLBACK_LIBRARY_PATH="${rust}/lib''${DYLD_FALLBACK_LIBRARY_PATH:+:$DYLD_FALLBACK_LIBRARY_PATH}"'';
        protocEnv = ''export PROTOC="${pkgs.protobuf}/bin/protoc"'';

        # ── populate frontend/public/ from the private sources (best-effort, idempotent) ──
        populateDocs = pkgs.writeShellApplication {
          name = "populate-docs";
          runtimeInputs = with pkgs; [ git coreutils flock ];
          text = ''
            repo="$(git rev-parse --show-toplevel)"
            # shellHook, run-frontend and run-test all invoke this; two instances
            # racing in public/ mid rm/cp swap fail with EEXIST/EACCES — serialize.
            exec 9>"$repo/.git/populate-docs.lock"
            flock 9
            pub="$repo/frontend/public"
            # Sources live in the read-only nix store; a prior copy leaves 0444 files
            # and 0555 dirs behind. Heal write bits before touching anything so rm/cp
            # can overwrite — otherwise cp fails with "Permission denied"/"File exists".
            chmod -R u+w "$pub" 2>/dev/null || true
            mkdir -p "$pub/assets" "$pub/publications"
            cp -rL --no-preserve=mode "$repo/frontend/assets/." "$pub/assets/"
            cp -f --no-preserve=mode ${logoSrc} "$pub/assets/logo.svg"

            wp="$(nix build "${privateSrc.whitepaper}" --no-link --print-out-paths || true)"
            [ -n "$wp" ] || echo "warn: whitepaper build failed — /whitepaper will degrade" >&2
            if [ -n "$wp" ]; then
              [ -e "$wp/whitepaper.pdf" ]        && cp -f --no-preserve=mode "$wp/whitepaper.pdf"        "$pub/whitepaper.pdf"
              [ -e "$wp/whitepaper.light.html" ] && cp -f --no-preserve=mode "$wp/whitepaper.light.html" "$pub/whitepaper.light.html"
              [ -e "$wp/whitepaper.dark.html" ]  && cp -f --no-preserve=mode "$wp/whitepaper.dark.html"  "$pub/whitepaper.dark.html"
            fi

            bl="$(nix build "${privateSrc.blog}" --no-link --print-out-paths || true)"
            [ -n "$bl" ] || echo "warn: blog build failed — /publications will degrade" >&2
            if [ -n "$bl" ]; then
              for dir in "$bl"/*/; do
                [ -d "$dir" ] || continue
                slug="$(basename "$dir")"
                [ -e "$dir/main.pdf" ]        && cp -f --no-preserve=mode "$dir/main.pdf"        "$pub/publications/''${slug}.pdf"
                [ -e "$dir/main.light.html" ] && cp -f --no-preserve=mode "$dir/main.light.html" "$pub/publications/''${slug}.light.html"
                [ -e "$dir/main.dark.html" ]  && cp -f --no-preserve=mode "$dir/main.dark.html"  "$pub/publications/''${slug}.dark.html"
                if [ -d "$dir/media" ]; then
                  mkdir -p "$pub/publications/''${slug}"
                  cp -rf --no-preserve=mode "$dir"/media/. "$pub/publications/''${slug}/"
                fi
              done
              # Deliberately NOT copied here. entities/publication/model/catalogue.json
              # is a tracked source file; rewriting it from the dev shell would
              # leave every checkout dirty and get the seed clobbered into a
              # commit by accident. Only the image build (which works on a
              # sandboxed copy) overwrites it. Run `nix build` to see real
              # catalogue data locally.
            fi
          '';
        };

        # ── frontend (Next.js marketing site) ───────────────────────────────
        runFrontend = pkgs.writeShellApplication {
          name = "run-frontend";
          runtimeInputs = with pkgs; [ nodejs git ];
          text = ''
            ${populateDocs}/bin/populate-docs || true
            repo="$(git rev-parse --show-toplevel)"
            cd "$repo/frontend"
            [ -d node_modules/next ] || npm install
            ${portEnv}
            export NEXT_PUBLIC_API_URL="''${NEXT_PUBLIC_API_URL:-http://localhost:$SITE_CONDUCTOR_BACKEND_PORT}"
            exec npm run dev -- --port "$SITE_CONDUCTOR_FRONTEND_PORT"
          '';
        };

        # ── backend (Axum API) ──────────────────────────────────────────────
        # Ensures the shared Postgres is up, then boots. Topology defaults come
        # from the flake; anything already set in the environment or backend/.env wins.
        runBackend = pkgs.writeShellApplication {
          name = "run-backend";
          runtimeInputs = with pkgs; [ rust git ];
          text = ''
            ${dyldFallback}
            ${runPostgres}/bin/run-postgres
            repo="$(git rev-parse --show-toplevel)"
            cd "$repo"

            set -a
            if [ -f backend/.env ]; then
              # shellcheck disable=SC1091
              . backend/.env
            fi
            set +a

            ${portEnv}
            export DATABASE_URL="''${DATABASE_URL:-postgres://postgres@localhost:$POSTGRES_PORT/site_conductor}"
            export BIND_ADDR="''${BIND_ADDR:-0.0.0.0:$SITE_CONDUCTOR_BACKEND_PORT}"
            export RUST_LOG="''${RUST_LOG:-info,backend=debug}"
            export APP_ENV="''${APP_ENV:-development}"
            exec cargo run -p backend
          '';
        };

        # ── shared Postgres (ensure-running) ────────────────────────────────
        # ONE trust-auth cluster for all ev_invest repos, under the user state dir —
        # NOT the repo. Started detached so no repo's dev-stack exit yanks it out from
        # under the siblings; each repo's runner only ensures its own databases exist
        # (database name == app name). Stop: pg_ctl -D ~/.local/state/ev_invest/pg/data stop
        runPostgres = pkgs.writeShellApplication {
          name = "run-postgres";
          runtimeInputs = with pkgs; [ postgresql coreutils gnugrep util-linux ];
          text = ''
            ${portEnv}
            state="''${XDG_STATE_HOME:-$HOME/.local/state}/ev_invest"
            export PGDATA="$state/pg/data"
            sockets="$state/pg/sockets"
            dbs="''${PGDATABASES:-site_conductor}"
            mkdir -p "$sockets"

            # Serialize sibling repos racing to first-boot the shared cluster.
            exec 9>"$state/pg.lock"
            flock 9

            if ! pg_isready --host="$sockets" --port="$POSTGRES_PORT" --quiet; then
              # TCP answering while our socket is silent = some OTHER cluster owns
              # the port — refuse rather than silently use the wrong database.
              if pg_isready --host=127.0.0.1 --port="$POSTGRES_PORT" --quiet; then
                echo "error: 127.0.0.1:$POSTGRES_PORT serves a postgres that is not the shared ev_invest cluster" >&2
                exit 1
              fi
              if [ ! -s "$PGDATA/PG_VERSION" ]; then
                echo "initialising shared postgres cluster in $PGDATA"
                initdb --username=postgres --auth=trust --pgdata="$PGDATA" >/dev/null
              fi
              chmod 0700 "$PGDATA"
              # 9>&- : the daemon must NOT inherit the lock fd, or it holds the
              # flock for its lifetime and every later ensure-run blocks forever.
              pg_ctl -D "$PGDATA" -l "$state/pg/log" -o "-k $sockets -h 127.0.0.1 -p $POSTGRES_PORT" start 9>&-
            fi
            exec 9>&-

            for db in $dbs; do
              if ! psql --host="$sockets" --port="$POSTGRES_PORT" --username=postgres --dbname=postgres \
                     --tuples-only --no-align \
                     --command "SELECT 1 FROM pg_database WHERE datname='$db'" | grep -q 1; then
                createdb --host="$sockets" --port="$POSTGRES_PORT" --username=postgres "$db"
                echo "created database '$db'"
              fi
            done
            echo "postgres ready on 127.0.0.1:$POSTGRES_PORT (databases ensured: $dbs)"
          '';
        };

        # ── dev refresh from prod ───────────────────────────────────────────
        # `nix run .#pull-prod-db` → replace the local site_conductor database
        # with prod's (the `evinvest` db on the prod host's Postgres, reached over
        # tailscale — `RPI5_SSH=admin@<tailnet-ip>`, the default alias is the Pi).
        # Prod is authoritative; dev only pulls. No passwords on either end: the
        # remote dump goes through the unix socket as the `postgres` OS user
        # (peer auth; TCP loopback trusts only `banking_backup` since
        # rpi5.nix#19), the local restore is trust. Local pg_restore (17.10) ≥
        # remote pg_dump (17.9) keeps the custom-format stream compatible.
        runPullProdDb = pkgs.writeShellApplication {
          name = "pull-prod-db";
          runtimeInputs = with pkgs; [ postgresql openssh ];
          text = ''
            ${portEnv}
            ${runPostgres}/bin/run-postgres
            rpi5="''${RPI5_SSH:-rpi5-ts}"
            echo "▶ pg_dump on $rpi5 → pg_restore into local site_conductor"
            ssh "$rpi5" "sudo -u postgres pg_dump -Fc evinvest" \
              | pg_restore --clean --if-exists --no-owner --no-privileges \
                  -h 127.0.0.1 -p "$POSTGRES_PORT" -U postgres -d site_conductor
            echo "✓ local site_conductor now mirrors prod"
          '';
        };

        # ── contract codegen: openapi.json + TS client. Run after any DTO/handler change; commit both. ──
        runGenApi = pkgs.writeShellApplication {
          name = "run-gen-api";
          runtimeInputs = with pkgs; [ rust nodejs git ];
          text = ''
            ${dyldFallback}
            repo="$(git rev-parse --show-toplevel)"
            cd "$repo"
            echo "▶ dumping OpenAPI spec → backend/openapi.json"
            cargo run --quiet --bin gen_openapi > backend/openapi.json
            echo "▶ generating TS client → frontend/shared/api/generated"
            cd frontend
            [ -d node_modules/.bin ] || npm install
            npm run gen:api
          '';
        };

        # ── dev orchestrator ────────────────────────────────────────────────
        # Ensures the SHARED postgres (detached, survives this stack), then owns
        # backend + frontend; a single trap tears the owned tree down on exit.
        runDev = pkgs.writeShellApplication {
          name = "run-dev";
          runtimeInputs = with pkgs; [ coreutils ];
          text = ''
            ${portEnv}
            pids=()
            cleanup() {
              echo; echo "shutting down dev stack…"
              [ ''${#pids[@]} -gt 0 ] && kill "''${pids[@]}" 2>/dev/null || true
              wait 2>/dev/null || true
            }
            trap cleanup EXIT INT TERM

            echo "▶ postgres (shared)"
            ${runPostgres}/bin/run-postgres

            echo "▶ backend  (:$SITE_CONDUCTOR_BACKEND_PORT)"
            ${runBackend}/bin/run-backend & pids+=($!)
            echo "▶ frontend (:$SITE_CONDUCTOR_FRONTEND_PORT)"
            ${runFrontend}/bin/run-frontend & pids+=($!)

            wait
          '';
        };

        # ── i18n gate: the pre-push hook above, standalone ──────────────────
        # Its own derivation rather than a line in `runTest` because the hook has
        # to run it without dragging in Playwright and its browser closure.
        runI18nCheck = pkgs.writeShellApplication {
          name = "run-i18n-check";
          runtimeInputs = with pkgs; [ nodejs git ];
          text = ''
            repo="$(git rev-parse --show-toplevel)"
            cd "$repo/frontend"
            [ -d node_modules/.bin ] || npm ci
            exec npm run i18n:check
          '';
        };

        # ── test suite: frontend typecheck + static gates + visual regression ──
        # No Rust tests exist yet; add `cargo test --workspace` here when they do.
        runTest = pkgs.writeShellApplication {
          name = "run-test";
          runtimeInputs = with pkgs; [ nodejs git ];
          text = ''
            repo="$(git rev-parse --show-toplevel)"
            ${populateDocs}/bin/populate-docs || true
            cd "$repo/frontend"
            [ -d node_modules/.bin ] || npm ci

            echo "▶ typecheck (tsc --noEmit)"
            npm run check

            echo "▶ i18n drift (translation policy 1.1/1.2)"
            npm run i18n:check

            # `cn` panics on a conflict only in dev, and only once the offending
            # combination of branches is rendered. This reaches all of them.
            echo "▶ tailwind class conflicts (every cn() branch)"
            npm run css:check

            # The /en/* collapse + English afterFiles rewrite: a wrong locale list
            # 404s a locale, a wrong carve-out loops 307 (next.config.ts).
            echo "▶ redirect/rewrite rules (next.config.ts)"
            npm run redirects:check

            echo "▶ visual regression (playwright)"
            ${portEnv}
            export NEXT_PUBLIC_API_URL="''${NEXT_PUBLIC_API_URL:-http://localhost:$SITE_CONDUCTOR_BACKEND_PORT}"
            # The nixpkgs browsers — npm-downloaded ones link libs absent on NixOS.
            export PLAYWRIGHT_BROWSERS_PATH="${pkgs.playwright-driver.browsers}"
            export PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD="1"
            export PLAYWRIGHT_HOST_PLATFORM_OVERRIDE="nixos"
            # The html reporter auto-opens the Expected/Actual/Diff view only when
            # stdin is a TTY; under the pre-commit hook it is /dev/null, so hand the
            # terminal back when there is one.
            if (: < /dev/tty) 2>/dev/null; then
              exec npm run test:visual < /dev/tty
            fi
            exec npm run test:visual
          '';
        };

        # pre-push wrapper: run the (slow) visual suite only when pushing a protected
        # ref / tag, and skip even then if the pushed tip's tree matches the remote's
        # (a squash/reword that leaves content identical can't change a screenshot).
        # pre-commit sets REMOTE_BRANCH/FROM_REF/TO_REF on pre-push.
        runTestHook = pkgs.writeShellApplication {
          name = "run-test-hook";
          runtimeInputs = with pkgs; [ git ];
          text = ''
            # Only gate the protected refs / releases; feature-branch pushes run nothing.
            case "''${PRE_COMMIT_REMOTE_BRANCH:-}" in
              refs/heads/main|refs/heads/dev|refs/heads/release|refs/tags/*) ;;
              *) echo "not a protected ref / tag — skipping visual regression"; exit 0 ;;
            esac

            from="''${PRE_COMMIT_FROM_REF:-}"
            to="''${PRE_COMMIT_TO_REF:-}"
            # Missing refs (new branch / refs unavailable) → don't skip; run the suite.
            if [ -n "$from" ] && [ -n "$to" ] && git rev-parse -q --verify "$from^{tree}" >/dev/null 2>&1; then
              if [ "$(git rev-parse "$from^{tree}")" = "$(git rev-parse "$to^{tree}")" ]; then
                echo "tip tree unchanged since remote — skipping visual regression"
                exit 0
              fi
            fi
            exec ${runTest}/bin/run-test
          '';
        };

        # ── accept new screenshots: `.#accept-test` (all) or with -- <names> ──
        runAcceptTest = pkgs.writeShellApplication {
          name = "accept-test";
          runtimeInputs = with pkgs; [ nodejs git ];
          text = ''
            repo="$(git rev-parse --show-toplevel)"
            cd "$repo/frontend"
            [ -d node_modules/.bin ] || npm ci
            ${portEnv}
            export NEXT_PUBLIC_API_URL="''${NEXT_PUBLIC_API_URL:-http://localhost:$SITE_CONDUCTOR_BACKEND_PORT}"
            export PLAYWRIGHT_BROWSERS_PATH="${pkgs.playwright-driver.browsers}"
            export PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD="1"
            export PLAYWRIGHT_HOST_PLATFORM_OVERRIDE="nixos"
            if [ "$#" -eq 0 ]; then
              exec npm run test:visual:update
            fi
            # playwright -g takes one regex; alternate the names so multiple match.
            exec npm run test:visual:update -- -g "$(IFS='|'; echo "$*")"
          '';
        };

        # ── bump latest remote vX.Y.Z tag and push: `.#publish major|minor|patch [note]` ──
        runPublish = pkgs.writeShellApplication {
          name = "publish";
          runtimeInputs = with pkgs; [ git ];
          text = ''
                        part="''${1:-}"
                        case "$part" in major|minor|patch) ;; *) echo "usage: nix run .#publish -- major|minor|patch [release note]" >&2; exit 1 ;; esac
                        [ -z "$(git status --porcelain)" ] || { echo "uncommitted changes — commit or stash first" >&2; exit 1; }
                        # Everything after the bump part is the release note, so
                        # `.#publish patch "fixed the thing"` needs no quoting gymnastics.
                        shift
                        note="$*"

                        git fetch --tags --force origin >/dev/null 2>&1
                        last="$(git tag -l 'v*' --sort=-v:refname | head -n1)"
                        ver="''${last#v}"; [ -n "$ver" ] || ver="0.0.0"
                        IFS=. read -r ma mi pa <<EOF
            $ver
            EOF
                        case "$part" in
                          major) ma=$((ma+1)); mi=0; pa=0 ;;
                          minor) mi=$((mi+1)); pa=0 ;;
                          patch) pa=$((pa+1)) ;;
                        esac
                        next="v$ma.$mi.$pa"
                        echo "$last → $next"
                        # Annotated (-a), never lightweight. Every tag this repo carries is
                        # an annotated object with a tagger and a message; `git describe`
                        # — which the footer build version reads — prefers annotated tags
                        # and only falls back to lightweight ones under --tags; and a
                        # lightweight tag has nowhere to put a release note at all.
                        #
                        # Plain `git tag` quietly produced the wrong kind for 31 releases.
                        # It went unnoticed because the push below names the tag
                        # explicitly, so it did reach the remote — unlike the sibling bug
                        # in lib, where `push --follow-tags` silently refused to send
                        # lightweight tags and the releases simply never appeared.
                        if [ -n "$note" ]; then
                          printf '%s\n\n%s\n' "$next" "$note" | git tag -a "$next" -F -
                        else
                          git tag -a "$next" -m "$next"
                        fi
                        git push origin "$next"
          '';
        };
        packagesOut = {
          default = backendBin;
          backend = backendBin;
        } // containerStd.packages;

        # The whole `nix run` surface, described exactly once — `.#help` prints it,
        # so there is no comment block above `apps` left to go stale.
        runnable =
          let
            pad = n: builtins.substring 0 14 (n + "              ");
            runHelp = pkgs.writeShellScriptBin "help" ''
              cat <<'EOF'
              nix run .#<target>
              ${pkgs.lib.concatStringsSep "\n" (
                pkgs.lib.mapAttrsToList (n: c: "  ${pad n}${c.about}") runnable
              )}

              nix build .#<package>
                ${pkgs.lib.concatStringsSep ", " (builtins.attrNames packagesOut)}
              EOF
            '';
          in
          {
            dev = { program = "${runDev}/bin/run-dev"; about = "ensure the shared Postgres, then backend + frontend"; };
            frontend = { program = "${runFrontend}/bin/run-frontend"; about = "Next.js marketing site (:$SITE_CONDUCTOR_FRONTEND_PORT)"; };
            backend = { program = "${runBackend}/bin/run-backend"; about = "Axum API only (:$SITE_CONDUCTOR_BACKEND_PORT; ensures the shared DB)"; };
            db = { program = "${runPostgres}/bin/run-postgres"; about = "ensure the SHARED ev_invest Postgres is up (+ this repo's databases)"; };
            pull-prod-db = { program = "${runPullProdDb}/bin/pull-prod-db"; about = "replace the local site_conductor db with prod's (rpi5)"; };
            gen-api = { program = "${runGenApi}/bin/run-gen-api"; about = "regenerate openapi.json + the TS client"; };
            test = { program = "${runTest}/bin/run-test"; about = "frontend typecheck + Playwright visual regression"; };
            accept-test = { program = "${runAcceptTest}/bin/accept-test"; about = "accept new screenshots (all, or `-- <names>`)"; };
            publish = { program = "${runPublish}/bin/publish"; about = "bump latest remote vX.Y.Z tag (major|minor|patch [note]) + push"; };
            help = { program = "${runHelp}/bin/help"; about = "print this list"; };
          };
      in
      {
        apps = pkgs.lib.mapAttrs (_: c: { type = "app"; program = c.program; }) runnable;

        packages = packagesOut;

        containers = containerStd.containers;

        devShells.default =
          with pkgs;
          mkShell {
            shellHook =
              ''
                if [ "$(nix config show lazy-trees 2>/dev/null)" != true ]; then
                  printf '%s\n' \
                    "✘ This repo requires Determinate Nix with lazy-trees=true." \
                    "  Stock nix produces flake.lock NAR hashes that diverge from CI (private inputs fail to verify)." \
                    "  Install: https://determinate.systems/nix   NixOS: nix.settings.lazy-trees = true" >&2
                  exit 1
                fi
              ''
              + pre-commit-check.shellHook
              + combined.shellHook
              + ''
                cp -f ${(v_flakes.files.treefmt) { inherit pkgs; }} ./.treefmt.toml
                ${populateDocs}/bin/populate-docs || true

                ${dyldFallback}
                ${protocEnv}
              '';

            packages = [
              nodejs
              openssl
              pkg-config
              protobuf
              clang-tools
              rust
              mold
              postgresql
              playwright-driver.browsers
            ] ++ pre-commit-check.enabledPackages ++ combined.enabledPackages;

            env.RUST_BACKTRACE = 1;
            env.RUST_LIB_BACKTRACE = 0;

            # Drive the nixpkgs browsers (npm-downloaded ones link libs absent on NixOS). @playwright/test version MUST match playwright-driver's.
            env.PLAYWRIGHT_BROWSERS_PATH = "${pkgs.playwright-driver.browsers}";
            env.PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD = "1";
            env.PLAYWRIGHT_HOST_PLATFORM_OVERRIDE = "nixos";
          };
      }
    );
}
