import { SITE } from "@/shared/config/site";

// /llms.txt — a concise, AI-crawler-friendly description of the site (the
// llms.txt proposal). Honest expectation: most AI providers don't fetch it yet,
// so this is cheap future-proofing. Config-driven + static.
export const dynamic = "force-static";

const body = `# ${SITE.name} (${SITE.alternateName})

> ${SITE.description}

## About
- Focus: premium coastal real-estate development and investment in Quy Nhon, Binh Dinh province, central Vietnam.
- Investors: international and European; participations funded by ${SITE.paymentAccepted.join(" or ")}.
- Offices: Quy Nhon (head office) and Ho Chi Minh City (representative office).

## Key pages
- [Portfolio](${SITE.url}/#portfolio): featured developments, target yields and locations.
- [Investment calculator](${SITE.url}/#calculator): model projected returns.
- [Publications](${SITE.url}/publications): field notes filmed on the ground plus macro and market reports on Vietnam's coastal real estate.
- [Publications feed](${SITE.url}/publications/feed.xml): RSS of the above, newest first.
- [Whitepaper](${SITE.url}/publications/whitepaper): the full institutional thesis (also available as a PDF).
- [Team](${SITE.url}/team): leadership and research.
- [Hiring](${SITE.url}/hiring): open roles across investment, development, and advisory.
- [Contact](${SITE.url}/contact): reach the fund.

## Notes
- This is a marketing site. All figures are targets, not guarantees; investing carries risk.
`;

export function GET() {
  return new Response(body, {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
