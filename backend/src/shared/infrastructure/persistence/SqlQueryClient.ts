// Ce fichier definit le contrat SQL minimal partageable entre plusieurs BC.
export interface ResultatExecutionSql<TLigne extends object = Record<string, unknown>> {
  readonly lignes: readonly TLigne[];
  readonly nombreLignesAffectees: number;
}

// Ce contrat represente un client de lecture/ecriture SQL neutre pour les besoins transverses.
export interface SqlQueryClient {
  // Cette methode execute une requete SQL et retourne un resultat normalise.
  executer<TLigne extends object = Record<string, unknown>>(
    requeteSql: string,
    parametres?: readonly unknown[],
  ): Promise<ResultatExecutionSql<TLigne>>;
}
