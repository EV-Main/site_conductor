// Shared form-control class — the dark "dispatch letter" input/textarea look,
// used by both the application and contact forms.
//
// `text-base sm:text-sm`: iOS Safari auto-zooms the viewport when a focused
// control's text is under 16px, and the old fix for that was a viewport-wide
// `maximum-scale=1` — which also took pinch-zoom away from every reader and
// failed the Lighthouse a11y audit. 16px on phones removes the cause instead;
// from `sm` up (where the behaviour doesn't exist) the original 14px stands, so
// the desktop design is unchanged.
export const INPUT_CLASS =
  "w-full rounded-md border border-white/10 bg-background/30 px-3.5 py-2.5 text-base sm:text-sm text-ink placeholder:text-ink/30 transition-colors outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring";
