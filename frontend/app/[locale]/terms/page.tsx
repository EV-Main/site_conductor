import { TermsView, legalRoute } from "@/views/legal";

const { generateMetadata, Page } = legalRoute("terms", TermsView);

export { generateMetadata };
export default Page;
