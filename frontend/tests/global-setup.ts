import { existsSync } from "node:fs";
import { chromium } from "@playwright/test";

// Fail fast on a missing browser binary. Without this, every spec launches
// the browser independently and dies with the opaque "Target page, context or
// browser has been closed" — 7 cryptic failures instead of one clear cause.
export default function globalSetup() {
  const exe = chromium.executablePath();
  if (existsSync(exe)) return;
  throw new Error(
    `Playwright chromium not found at:\n  ${exe}\n` +
      `PLAYWRIGHT_BROWSERS_PATH=${process.env.PLAYWRIGHT_BROWSERS_PATH ?? "(unset)"}\n\n` +
      `Run via the nix env: \`nix run .#test\` (wires PLAYWRIGHT_BROWSERS_PATH to ` +
      `nixpkgs' playwright-driver.browsers). If that path no longer exists, the ` +
      `@playwright/test version and nixpkgs playwright-driver have drifted — realign them.`,
  );
}
