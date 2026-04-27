// Ce fichier definit le client PostgreSQL minimal utilise par les depots du BC Scolarite des Eleves.
export interface ResultatExecutionPostgresScolarite<TLigne extends object = Record<string, unknown>> {
  readonly lignes: readonly TLigne[];
  readonly nombreLignesAffectees: number;
}

/**
 * Ce contrat evite de coupler les depots a une librairie PostgreSQL concrete.
 */
export interface ClientPostgresScolariteEleves {
  /** Execute une requete SQL et retourne un resultat normalise. */
  executer<TLigne extends object = Record<string, unknown>>(
    requeteSql: string,
    parametres?: readonly unknown[],
  ): Promise<ResultatExecutionPostgresScolarite<TLigne>>;
}
