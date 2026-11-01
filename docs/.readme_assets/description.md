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
