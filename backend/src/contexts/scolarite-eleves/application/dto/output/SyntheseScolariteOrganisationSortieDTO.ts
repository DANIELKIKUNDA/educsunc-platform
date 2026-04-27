// Ce fichier definit la synthese de scolarite d'une organisation.
export interface SyntheseScolariteOrganisationSortieDTO {
  idOrganisation: string;
  totalEcoles: number;
  totalEleves: number;
  totalElevesActifs: number;
  totalFamilles: number;
  totalInscriptionsActives: number;
}
