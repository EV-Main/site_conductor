// DRAFT — pending legal review (site_conductor #204). Not legal advice; a
// template for counsel to edit. Every mechanism described (NAV-priced units,
// queued redemptions, the order book, USDT on TRON, Turnkey custody) is what
// the platform's code does today; nothing here asserts insurance, a guarantee
// or a regulatory protection.
import type { Translate } from "@evinvest/i18n";

import type { LegalDocument } from "./document";

export const riskDocument = (t: Translate): LegalDocument => ({
  status: "draft",
  title: t("legal.risk.title", "Risk Disclosure"),
  lede: t(
    "legal.risk.lede",
    "What can go wrong with an investment through EV Investment. Read it before you subscribe."
  ),
  sections: [
    {
      title: t("legal.risk.capital.title", "Your capital is at risk"),
      paragraphs: [
        "The value of allocation units can fall as well as rise. You may get back less than you invested, and you may lose the whole amount. Nothing on the Platform is a guarantee of return or of the preservation of capital.",
      ],
    },
    {
      title: t("legal.risk.targets.title", "Targets are not forecasts"),
      paragraphs: [
        "Any target return, illustration or calculator output shown on the Platform is an objective or a worked example, not a prediction. Past performance, including the performance of comparable developments or markets, does not indicate future results.",
      ],
    },
    {
      title: t("legal.risk.liquidity.title", "Liquidity and redemption"),
      paragraphs: [
        "The underlying assets are real estate, which cannot be sold quickly or at a predictable price. Redemptions at NAV are queued and are met as the fund’s liquidity allows; a redemption through the order book depends on another investor being willing to buy. There is no assurance that you will be able to redeem on any particular date, at any particular price, or at all.",
      ],
    },
    {
      title: t("legal.risk.valuation.title", "Valuation"),
      paragraphs: [
        "NAV is determined under the fund’s valuation policy. Real estate is appraised periodically rather than priced continuously, so NAV may lag the market and may differ from the price the assets would actually fetch. Subscriptions and redemptions are processed at the posted NAV whether or not it later proves to have been high or low.",
      ],
    },
    {
      title: t("legal.risk.digital.title", "Stablecoin, network and custody"),
      paragraphs: [
        "Deposits and withdrawals use USDT on the TRON network. USDT is issued by a third party and may lose its peg to the US dollar or become unavailable. TRON transactions are irreversible, can be delayed by congestion, and funds sent to the wrong address or over the wrong network are usually lost. Custody and signing depend on Turnkey; an outage or compromise there could delay or prevent transfers.",
      ],
    },
    {
      title: t(
        "legal.risk.market.title",
        "Concentration, currency and country"
      ),
      paragraphs: [
        "The fund concentrates on coastal real estate in Vietnam, so a downturn in that market, in Vietnamese tourism, or in the Vietnamese dong against the US dollar affects the whole portfolio. Changes in Vietnamese law, tax or foreign-ownership rules, and disputes over land title, can reduce the value of the assets or delay their sale.",
      ],
    },
    {
      title: t(
        "legal.risk.regulatory.title",
        "Regulatory uncertainty in the EU and Vietnam"
      ),
      paragraphs: [
        "How an investment of this kind is regulated is still developing and uncertain in both the European Union and Vietnam. In the EU, the treatment of crypto-assets and stablecoins under regulations such as MiCA, and of fund and marketing rules, continues to change; in Vietnam, the rules on foreign investment, foreign exchange and digital assets are evolving. A change on either side — sometimes at short notice — could restrict how the Platform operates, whether you may subscribe or redeem, how your holding is taxed, or whether the service remains available to residents of your country.",
      ],
    },
    {
      title: t("legal.risk.costs.title", "Fees, tax and operations"),
      paragraphs: [
        "The management fee and the performance fee reduce your return; both are settled in units, which reduces your holding. Tax on your investment is your responsibility and depends on your circumstances. The Platform relies on third-party services — Google for sign-in, Didit for verification, Turnkey for custody — and an outage at any of them can delay your access or your transactions.",
      ],
    },
    {
      title: t("legal.risk.advice.title", "This is not advice — get your own"),
      paragraphs: [
        "Nothing on the Platform is investment, legal or tax advice, and no one at EV Investment is acting as your adviser. Whether this investment suits you depends on your own circumstances, which we do not assess. Before you subscribe, consider taking independent financial, legal and tax advice, and do not invest money you cannot afford to lose.",
      ],
    },
  ],
});
