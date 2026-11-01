import { defineConfig, devices } from "@playwright/test";

// Visual-regression config. Browsers come from nixpkgs (see flake.nix:
// PLAYWRIGHT_BROWSERS_PATH), pinned to the same revision as @playwright/test,
// so screenshots render identically across every machine on this flake.
// Env fallbacks live in flake.nix only — run via `nix run .#test`.
const PORT = process.env.SITE_CONDUCTOR_FRONTEND_PORT;
if (!PORT)
  throw new Error(
    "missing SITE_CONDUCTOR_FRONTEND_PORT — run via the flake: nix run .#test"
  );

export default defineConfig({
  testDir: "./tests",
  // Bail with a clear error if the browser binary is missing (see global-setup).
  globalSetup: "./tests/global-setup.ts",
  // Baselines live beside the test file: tests/sections.spec.ts-snapshots/.
  snapshotPathTemplate: "{testDir}/__screenshots__/{arg}{ext}",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  // One retry in CI: the reveal wait is timing-bound (IntersectionObserver +
  // once-only motion) and a rare miss is not a regression; locally it stays
  // strict so a real hang is seen.
  retries: process.env.CI ? 1 : 0,
  // Locally, two reporters compose: a minimal one (tests/visual-reporter.ts)
  // that on failure prints only the expected/actual/diff image paths — no step
  // trace or code-frame, since a visual failure is an image mismatch, not a
  // code bug — plus the HTML reporter, which auto-opens on failure with the
  // side-by-side Expected/Actual/Diff slider (magenta pixel-diff). Reopen the
  // last one with `playwright show-report`.
  reporter: process.env.CI
    ? "github"
    : [["./tests/visual-reporter.ts"], ["html", { open: "on-failure" }]],

  // A pixel diff above this fraction fails the test. Small allowance absorbs
  // sub-pixel font rasterisation jitter without masking real layout changes.
  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.01,
      animations: "disabled",
    },
  },

  use: {
    baseURL: `http://localhost:${PORT}`,
    viewport: { width: 1280, height: 720 },
    deviceScaleFactor: 1,
    // Animations off + fixed colour scheme keep every run deterministic.
    colorScheme: "dark",
  },

  // Two viewports, one browser. Projects pick their tests by tag (`@desktop`
  // / `@mobile` on each test in sections.spec.ts), so a section that only
  // exists at one width is declared once, next to the test, not here.
  projects: [
    {
      name: "chromium",
      grep: /@desktop/,
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 720 },
      },
    },
    {
      // A phone-class viewport (iPhone 13 logical size) on the same Chromium
      // the desktop project renders with: the nixpkgs browser pin ships one
      // engine, and mobile Safari's WebKit would give a second, unpinned set of
      // glyph metrics to chase. Explicit `isMobile`/`hasTouch` rather than the
      // `devices["iPhone 13"]` descriptor for that reason — the descriptor
      // defaults to WebKit and carries its Safari user agent.
      name: "mobile",
      grep: /@mobile/,
      // Own subdirectory so `hero.png` here never shadows the desktop
      // `hero.png` — the desktop baselines keep their names and history.
      snapshotPathTemplate: "{testDir}/__screenshots__/mobile/{arg}{ext}",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 390, height: 844 },
        // 1×, not the phone's 3×: same pixel budget as desktop, no 9× PNGs,
        // and the diffs stay comparable across the two projects.
        deviceScaleFactor: 1,
        isMobile: true,
        hasTouch: true,
      },
    },
  ],

  webServer: {
    command: "npm run dev -- --port " + PORT,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
