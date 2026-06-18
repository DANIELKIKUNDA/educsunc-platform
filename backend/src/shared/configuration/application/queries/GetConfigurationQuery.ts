// Ce fichier declare la query de lecture d une configuration.

/** Cette interface represente la recherche d une configuration par identifiant. */
export interface GetConfigurationQuery {
  readonly configurationId: string;
}
