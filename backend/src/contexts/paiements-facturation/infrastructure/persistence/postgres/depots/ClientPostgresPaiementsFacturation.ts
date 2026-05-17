// Ce fichier decrit le contrat minimal du client PostgreSQL consomme par les depots paiements.
export interface ResultatExecutionPostgresPaiementsFacturation<
  TLigne extends object = Record<string, unknown>,
> {
  readonly lignes: readonly TLigne[];
  readonly nombreLignesAffectees: number;
}

// Ce contrat permet aux depots de rester decouples du driver PostgreSQL concret.
export interface ClientPostgresPaiementsFacturation {
  // Cette methode execute une requete SQL et retourne un resultat normalise.
  executer<TLigne extends object = Record<string, unknown>>(
    requeteSql: string,
    parametres?: readonly unknown[],
  ): Promise<ResultatExecutionPostgresPaiementsFacturation<TLigne>>;
}
