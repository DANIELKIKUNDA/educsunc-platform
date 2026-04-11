// Cette interface represente le resultat normalise d'une requete PostgreSQL.
export interface ResultatExecutionPostgres<TLigne extends object = Record<string, unknown>> {
  readonly lignes: readonly TLigne[];
  readonly nombreLignesAffectees: number;
}

// Ce contrat abstrait un client PostgreSQL utilisable par les depots du BC.
export interface ClientPostgresReferentielAcademique {
  // Cette methode execute une requete SQL et retourne les lignes normalisees.
  executer<TLigne extends object = Record<string, unknown>>(
    requeteSql: string,
    parametres?: readonly unknown[],
  ): Promise<ResultatExecutionPostgres<TLigne>>;
}
