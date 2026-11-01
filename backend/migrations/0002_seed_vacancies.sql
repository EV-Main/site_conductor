-- Placeholder roles. The board and detail page read from here — this seed is
-- the source of truth until real listings replace it. No salary figures: every
-- role's compensation is 'negotiable'. Idempotent via ON CONFLICT (slug).

INSERT INTO vacancies (slug, title, category, location, employment_type, summary, about, responsibilities, requirements, nice_to_have, offer, screening_question) VALUES
(
	'investment-analyst', 'Investment Analyst', 'investment', 'Quy Nhơn, Vietnam', 'Full-time',
	'Underwrite coastal development deals end to end — from market thesis to investment committee memo.',
	'You will sit at the centre of how EV Investment decides where capital goes. Working alongside the principals, you''ll build the models, pressure-test the assumptions, and write the memos that move a deal from idea to commitment — focused on premium coastal developments in Quy Nhơn.',
	ARRAY['Build and maintain underwriting models for coastal residential and mixed-use projects', 'Research submarket supply, absorption, pricing and demand drivers', 'Draft investment committee memos and present recommendations', 'Track portfolio performance against underwriting and flag variances'],
	ARRAY['2+ years in real estate, private equity, IB or transaction advisory', 'Fluent financial modelling (DCF, waterfalls, sensitivity analysis)', 'Sharp written English — you can make a complex deal legible in a page', 'Comfortable with ambiguity and primary research'],
	ARRAY['Vietnamese language', 'Experience in emerging or frontier markets', 'CFA progress'],
	ARRAY['Direct mentorship from the investment principals', 'Ownership of live deals from day one', 'A front-row seat to a fund being built', 'Negotiable compensation with performance upside'],
	'Walk us through one deal you would underwrite first in Quy Nhơn, and why.'
),
(
	'real-estate-research-lead', 'Real Estate Research Lead', 'investment', 'Quy Nhơn / Remote', 'Full-time',
	'Own the market intelligence that underpins every investment decision the fund makes.',
	'Research is our edge. As Research Lead you will turn scattered signals — transactions, infrastructure plans, tourism flows — into a coherent, continuously-updated view of the Quy Nhơn and central-coast market that the whole firm relies on.',
	ARRAY['Own the firm''s market data, comps and pricing benchmarks', 'Publish recurring research notes on supply, demand and macro drivers', 'Build relationships with brokers, developers and local authorities for primary data', 'Brief the investment team ahead of underwriting'],
	ARRAY['4+ years in real estate research, consulting or market analytics', 'Rigour with both quantitative data and qualitative field intelligence', 'Excellent written English and a clear visual style', 'Self-directed — you set the research agenda'],
	ARRAY['Vietnamese language and local network', 'GIS / mapping fluency', 'Tourism or hospitality sector experience'],
	ARRAY['Define the research function from the ground up', 'Direct influence on capital allocation', 'Flexible / remote-friendly arrangement', 'Negotiable compensation'],
	'What signal about a coastal market do most investors underweight — and how would you track it?'
),
(
	'development-project-manager', 'Development Project Manager', 'development', 'Quy Nhơn, Vietnam', 'Full-time',
	'Take premium coastal projects from groundbreaking to handover — on time, on budget, on standard.',
	'You will be accountable for delivery on the ground. Coordinating designers, contractors and consultants, you''ll keep our developments moving while protecting the quality that defines the EV brand.',
	ARRAY['Own project schedules, budgets and delivery milestones', 'Coordinate architects, contractors and engineering consultants', 'Run site progress reviews and resolve blockers fast', 'Report status, risk and spend to the investment team'],
	ARRAY['5+ years managing real estate or construction projects', 'Proven delivery of mid-to-large residential or hospitality builds', 'Command of budgets, schedules and contractor management', 'Calm, decisive, and relentless about quality'],
	ARRAY['Coastal or resort development experience', 'Vietnamese language', 'PMP or equivalent'],
	ARRAY['End-to-end ownership of flagship developments', 'A team and budget to deliver with', 'Direct line to the principals', 'Negotiable compensation'],
	'Tell us about a project you rescued when the schedule or budget slipped — what did you do first?'
),
(
	'site-permitting-engineer', 'Site & Permitting Engineer', 'development', 'Quy Nhơn, Vietnam', 'Full-time',
	'Clear the technical and regulatory path so our developments can break ground without surprises.',
	'Before the first foundation is poured, someone has to make the site buildable — surveys, approvals, utilities, compliance. That''s you. You''ll own the engineering and permitting workstream that de-risks every project.',
	ARRAY['Manage site surveys, soil studies and feasibility assessments', 'Drive the permitting and approvals process with local authorities', 'Coordinate utilities, access and infrastructure requirements', 'Maintain the technical due-diligence record for each site'],
	ARRAY['Civil/structural engineering background with 4+ years on site', 'Hands-on experience with permitting and regulatory approvals', 'Strong grasp of local building codes and compliance', 'Methodical, detail-obsessed documentation habits'],
	ARRAY['Vietnamese language and local authority relationships', 'Coastal / geotechnical experience', 'Sustainability or green-build certification'],
	ARRAY['Own the workstream that unblocks every project', 'Work directly with developers and authorities', 'Real responsibility, no bureaucracy', 'Negotiable compensation'],
	'Which permitting or site risk would you check first on a beachfront parcel?'
),
(
	'investor-relations-associate', 'Investor Relations Associate', 'advisory', 'Quy Nhơn / Remote', 'Full-time',
	'Be the trusted line between the fund and the investors who back it.',
	'Our investors expect clarity and candour. As IR Associate you''ll keep them informed, answer the hard questions well, and make the experience of investing with EV feel as considered as the developments themselves.',
	ARRAY['Prepare investor updates, reports and capital-call communications', 'Field investor questions with accuracy and discretion', 'Support fundraising materials and the diligence process', 'Maintain the investor CRM and relationship records'],
	ARRAY['3+ years in investor relations, fund operations or client-facing finance', 'Exceptional written and spoken English', 'Discretion and composure with sophisticated investors', 'Detail-perfect with numbers and documents'],
	ARRAY['Vietnamese or additional languages', 'Real estate or fund experience', 'Network among regional or international investors'],
	ARRAY['Direct relationships with the fund''s investor base', 'A voice in how we communicate and raise', 'Remote-friendly, high-trust role', 'Negotiable compensation'],
	'How would you explain a delayed project milestone to an investor without losing their confidence?'
),
(
	'buyer-advisory-specialist', 'Buyer Advisory Specialist', 'advisory', 'Quy Nhơn, Vietnam', 'Full-time',
	'Guide buyers through acquiring a premium coastal home — with honesty that earns referrals.',
	'You''ll be the person buyers remember. From first enquiry to handover, you''ll advise on the right property, the process and the paperwork — building the kind of trust that turns one purchase into three.',
	ARRAY['Advise prospective buyers on properties, pricing and process', 'Guide clients through reservation, contracts and handover', 'Coordinate with legal, finance and development teams', 'Build long-term relationships that generate referrals'],
	ARRAY['3+ years in premium real estate sales or buyer advisory', 'A consultative, no-pressure style that builds trust', 'Fluent English; clear, warm communication', 'Genuine knowledge of the buying journey'],
	ARRAY['Vietnamese language', 'International or expat client experience', 'Existing buyer network'],
	ARRAY['Represent genuinely premium product you can stand behind', 'Warm inbound interest, not cold calling', 'Uncapped, performance-linked upside', 'Negotiable compensation'],
	'Describe a time you advised a buyer against a purchase. What happened?'
),
(
	'fund-operations-lead', 'Fund Operations Lead', 'operations', 'Quy Nhơn / Remote', 'Full-time',
	'Build the operational backbone that lets a young fund scale without breaking.',
	'Growth dies in the back office if no one tends it. As Operations Lead you''ll put the processes, controls and systems in place that keep the fund compliant, organised and ready to scale — quietly making everything else work.',
	ARRAY['Own fund administration, reporting cycles and compliance workflows', 'Stand up and improve internal systems and processes', 'Coordinate with legal, accounting and banking partners', 'Keep records, controls and documentation audit-ready'],
	ARRAY['5+ years in fund operations, finance ops or a similar backbone role', 'Process-builder who turns chaos into checklists', 'Solid grasp of fund admin, compliance and controls', 'Trustworthy with sensitive financial information'],
	ARRAY['Real estate or private-fund background', 'Vietnamese language', 'Systems / automation fluency'],
	ARRAY['Design the operating model from scratch', 'Broad mandate across the whole firm', 'Remote-friendly and autonomous', 'Negotiable compensation'],
	'What is the first operational process you would put in place at a fund that has none?'
)
ON CONFLICT (slug) DO NOTHING;
