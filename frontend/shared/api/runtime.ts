import { config as appConfig } from "@/config";

import type { CreateClientConfig } from "./generated/client.gen";

// Runtime config for the generated fetch client. Kept separate from the
// generated artifact so codegen never overwrites our base URL / headers.
//
// Server Component fetches and browser fetches resolve the API origin
// differently: the server can reach the backend over an internal address
// (API_URL_INTERNAL, not NEXT_PUBLIC_) while the browser must use the public
// origin (NEXT_PUBLIC_API_URL). The backend's OpenAPI paths already include
// `/api/v1`, so the base URL is just the origin.
export const createClientConfig: CreateClientConfig = config => ({
  ...config,
  baseUrl:
    typeof window === "undefined"
      ? appConfig.apiUrlInternal ?? appConfig.public.apiUrl
      : appConfig.public.apiUrl,
});
