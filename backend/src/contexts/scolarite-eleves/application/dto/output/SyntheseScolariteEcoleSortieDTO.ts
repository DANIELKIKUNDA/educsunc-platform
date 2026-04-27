// Ce fichier definit la synthese de scolarite d'une ecole.
export interface SyntheseScolariteEcoleSortieDTO {
  idOrganisation: string;
  idEcole: string;
  totalEleves: number;
  totalElevesActifs: number;
  totalFamilles: number;
  totalInscriptionsActives: number;
  totalAffectationsActives: number;
}
