// Server-only. The client half (StatusCopyProvider / useStatusCopy) lives in
// `shared/ui/status-copy` precisely so a Client Component never reaches this
// barrel: `localised-status` imports `messagesFor`, which statically imports
// every catalogue, and one client import of this file puts all five in the
// browser bundle.
export { LocalisedStatus } from "./ui/localised-status";
export { serverErrorCopy } from "./model/status-copy";
