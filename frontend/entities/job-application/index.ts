// `job-application` entity — domain surface over the generated application API.
// `NewApplication` carries an optional `vacancy_slug`: present when sent from a
// role page, absent for a general talent-pool application (the universal-letter
// mechanic from the design).
export { type CreateApplicationRequest as NewApplication, type ApplicationAccepted, createApplication } from "@/shared/api";
