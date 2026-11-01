import { RiskDisclosureView, legalRoute } from "@/views/legal";

const { generateMetadata, Page } = legalRoute("risk", RiskDisclosureView);

export { generateMetadata };
export default Page;
