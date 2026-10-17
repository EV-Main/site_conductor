import { expect, test, type Page } from "@playwright/test";

// Visual-regression baseline of the one page this origin renders: the
// coming-soon stub at `/` (views/coming-soon). The landing moved to its own
// host, so there are no sections, no site chrome and no A/B experiments here
// any more — one baseline per viewport (playwright.config.ts projects, matched
// by tag) of the whole surface, footer caption included.
//
// The terrain canvas animates on every frame; under reduced motion it paints
// one still frame per layout and never animates (lib/terrain/scene.ts), which
// is what makes the canvas comparable at all.
test.use({ contextOptions: { reducedMotion: "reduce" } });

// The E[V] caption is placed by the terrain scene and only gets `data-on`
// once the scene has drawn a frame; before that it sits at opacity 0 in the
// corner. Its node is `aria-hidden` (pure decoration over the canvas), so it
// has no role or name to locate it by — the attribute is the scene's own
// "drawn" signal.
const SURFACE = '[data-surface="coming-soon"]';
const DRAWN_LABEL = `${SURFACE} [data-on]`;

// Web fonts shift glyph metrics, the headline refits itself and the scene
// relayouts once `document.fonts.ready` resolves — a baseline is only
// comparable after that.
async function gotoComingSoon(page: Page) {
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  await page.waitForLoadState("networkidle");
}

// The label fades in through a CSS transition, which surfaces through the Web
// Animations API — wait until nothing one-shot is running. Playwright's own
// `animations: "disabled"` only fast-forwards what is running at capture time.
async function waitForMotionToSettle(page: Page) {
  await page.waitForFunction(
    () =>
      document
        .getAnimations()
        .every(
          animation =>
            animation.playState !== "running" ||
            animation.effect?.getComputedTiming().iterations === Infinity
        ),
    undefined,
    { timeout: 15_000 }
  );
}

test(
  "- mismatch on: coming-soon",
  { tag: ["@desktop", "@mobile"] },
  async ({ page }) => {
    await gotoComingSoon(page);

    const surface = page.locator(SURFACE);
    await expect(surface).toBeVisible();
    await expect(page.getByRole("link", { name: "Admin" })).toHaveAttribute(
      "href",
      "/admin"
    );
    // A dead client bundle leaves the canvas blank and the label hidden — a
    // structurally valid but empty capture. Fail loud instead.
    await expect(page.locator(DRAWN_LABEL)).toBeVisible({ timeout: 15_000 });
    await waitForMotionToSettle(page);

    // Dev-only chrome fixed over the surface: Next's dev indicator and the A/B
    // dev panel (@evinvest/experiments, the only node at max z-index). Neither
    // ships to production. Hidden rather than masked: a mask still records
    // where they were.
    await page.addStyleTag({
      content:
        "nextjs-portal, div[style*='2147483647'] { visibility: hidden !important; }",
    });
    await expect(surface).toHaveScreenshot("coming-soon.png");
  }
);
