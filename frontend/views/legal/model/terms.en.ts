// DRAFT — pending legal review (site_conductor #204). Not legal advice; a
// template for counsel to edit. Bracketed tokens ([LEGAL NAME], [JURISDICTION],
// …) are placeholders the owner fills before this page ships. Every factual
// claim below is one the platform's code enforces today (Google sign-in, Didit
// verification, Turnkey custody, USDT on TRON, NAV-priced units, fees settled
// in units); nothing here asserts a licence, insurance or regulatory status.
import type { Translate } from "@evinvest/i18n";

import type { LegalDocument } from "./document";

export const termsDocument = (t: Translate): LegalDocument => ({
  status: "draft",
  title: t("legal.terms.title", "Terms of Service"),
  lede: t(
    "legal.terms.lede",
    "The agreement between you and EV Investment for using this website and the investor cabinet."
  ),
  sections: [
    {
      title: t(
        "legal.terms.provider.title",
        "Who we are and what these terms cover"
      ),
      paragraphs: [
        "These Terms of Service (the “Terms”) are an agreement between you and [LEGAL NAME], registration number [REGISTRATION NUMBER], incorporated in [JURISDICTION] with its registered address at [REGISTERED ADDRESS] (“EV Investment”, “we”, “us”). Regulatory status: [REGULATOR / LICENCE].",
        "They apply to the public website at evinvest.ltd and to the investor cabinet reached from it (together, the “Platform”). By creating an account or using the Platform you accept these Terms. Subscription to any fund is additionally governed by that fund’s offering documents, which prevail over these Terms where they conflict.",
      ],
    },
    {
      title: t("legal.terms.account.title", "Your account"),
      paragraphs: [
        "You sign in with a Google account. You are responsible for keeping that account secure and for everything done through the Platform while signed in with it. One person may hold one account; you may not let anyone else use it.",
        "You must be of legal age and legally permitted to invest in your country of residence. We may decline to open, or may close, an account at our discretion and without giving a reason, subject to settling any positions you hold.",
      ],
    },
    {
      title: t("legal.terms.verification.title", "Identity verification"),
      paragraphs: [
        "Before you can deposit, withdraw or subscribe, your identity is verified by our verification provider, Didit. You agree to supply accurate documents and information, and to update them when we ask. We may suspend an account whose verification fails, lapses or is later found to rest on inaccurate information.",
      ],
    },
    {
      title: t("legal.terms.funds.title", "Deposits, withdrawals and custody"),
      paragraphs: [
        "Deposits and withdrawals are made in USDT on the TRON network (TRC20) only. Assets sent in another token or over another network may be unrecoverable, and we have no obligation to recover them. Blockchain transfers are irreversible: check every address before you send, and before you submit a withdrawal address.",
        "Custody and transaction signing are provided through Turnkey infrastructure. We do not control the TRON network, its fees or its confirmation times, and a delay or failure there is not a breach of these Terms.",
      ],
    },
    {
      title: t(
        "legal.terms.units.title",
        "Subscriptions, redemptions and fees"
      ),
      paragraphs: [
        "A subscription buys allocation units of the chosen fund at the net asset value (NAV) posted in the cabinet at the time the subscription is processed. Redemptions are made at NAV and are queued, or may be placed on the order book where one is offered; we do not guarantee that a redemption will be met on any particular date or at any particular price.",
        "Fees consist of a management fee charged per annum on your holding and a performance fee charged on the gain, both settled in units. The rates in force are shown in the cabinet before you subscribe, and a change is announced there before it takes effect.",
      ],
    },
    {
      title: t("legal.terms.risk.title", "No advice; capital at risk"),
      paragraphs: [
        "Nothing on the Platform is investment, legal or tax advice, and nothing on it is an offer to any person in a jurisdiction where such an offer would be unlawful. Any target shown is an objective, not a forecast. Returns are not guaranteed and you may lose some or all of the capital you invest. Read the Risk Disclosure before you subscribe.",
      ],
    },
    {
      title: t("legal.terms.conduct.title", "Acceptable use"),
      paragraphs: [
        "You may not use the Platform for anything unlawful, circumvent or attempt to circumvent verification, invest funds that belong to someone else without disclosing it, or interfere with the Platform’s operation or security.",
      ],
    },
    {
      title: t("legal.terms.termination.title", "Suspension and closure"),
      paragraphs: [
        "We may suspend or close your account if you breach these Terms, if the law or a sanctions regime requires it, or if we can no longer verify you. You may close your account at any time once your positions are redeemed and withdrawn. Provisions that by their nature should survive closure — including those on liability and governing law — do so.",
      ],
    },
    {
      title: t("legal.terms.liability.title", "Liability"),
      paragraphs: [
        "To the fullest extent the law allows, we are not liable for loss arising from the performance of any investment, from the TRON network or the USDT token, or from a third-party service the Platform depends on, including Google, Didit and Turnkey. Nothing in these Terms excludes liability that cannot be excluded by law.",
      ],
    },
    {
      title: t("legal.terms.law.title", "Changes, governing law and disputes"),
      paragraphs: [
        "We may revise these Terms; the revised text is posted here with a new effective date, and continued use of the Platform after that date is acceptance. These Terms are governed by the law of [GOVERNING LAW], and the courts of [JURISDICTION] have exclusive jurisdiction over any dispute arising from them.",
        "EV Investment offers the Platform to investors in both the European Union and Vietnam, so two sets of mandatory protections apply in addition, whichever law is chosen above. If you are resident in the EU or EEA, you keep the mandatory rights of the consumer- and data-protection law of your country of residence; nothing in these Terms removes a right that that law grants you and does not permit to be waived, and you may bring proceedings in the courts of your country of residence where its law so provides. If you are resident in Vietnam, these Terms are also subject to the mandatory provisions of Vietnamese law, including its rules on foreign investment, foreign exchange and consumer protection.",
      ],
    },
    {
      title: t("legal.terms.contact.title", "Contact"),
      paragraphs: ["Questions about these Terms go to [DPO / CONTACT EMAIL]."],
    },
  ],
});
