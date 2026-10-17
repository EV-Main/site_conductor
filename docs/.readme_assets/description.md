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
