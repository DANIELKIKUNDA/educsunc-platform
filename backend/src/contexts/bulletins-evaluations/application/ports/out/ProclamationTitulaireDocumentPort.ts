export interface ProclamationTitulaireDocumentPort {
  consulterTitulaireClasse(params: {
    idClassePedagogique: string;
    idAnneeScolaire: string;
    idEcole?: string;
  }): Promise<{
    idUtilisateur: string;
    nomComplet?: string;
  } | null>;
}
