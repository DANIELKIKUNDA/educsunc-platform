import { CATALOGUE_CONFIGURATION_OFFICIELLE } from './CatalogueConfigurationOfficielle';

// Ce fichier centralise les cles de configuration officiellement cataloguees.

/** Cette constante expose le catalogue courant des cles officielles de configuration. */
export const CLES_CONFIGURATION = CATALOGUE_CONFIGURATION_OFFICIELLE.map(
  (definition) => definition.key,
);
