// `publication` entity — the single read surface over the publications
// catalogue (research reports, the whitepaper, field notes) that /publications,
// its detail routes and the sitemap share.
//
// The catalogue itself is build-produced and deliberately not exported: callers
// ask questions (`findPublication`, `fieldNotes`, …) instead of scanning an
// array, so the storage can move behind these names without touching consumers.
export type { Cover, Publication, PublicationKind } from "./model/types";
export { coverStill, toPlateCover } from "./model/cover-props";
export {
  allPublications,
  publicationsFor,
  fieldNotes,
  findPublication,
  formatPublicationDate,
  publicationsByKind,
} from "./model/selectors";
export {
  documentLocales,
  hasTranslatedDocument,
  localizePublication,
} from "./model/translations";
