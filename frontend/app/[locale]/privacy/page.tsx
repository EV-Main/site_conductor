import { PrivacyView, legalRoute } from "@/views/legal";

const { generateMetadata, Page } = legalRoute("privacy", PrivacyView);

export { generateMetadata };
export default Page;
