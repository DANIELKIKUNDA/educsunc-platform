// Ce fichier definit le read model du tableau de bord scolarite d'une organisation.
export interface SyntheseScolariteOrganisationReadModel {
  idOrganisation: string;
  totalEcoles: number;
  totalEleves: number;
  totalElevesActifs: number;
  totalFamilles: number;
  totalInscriptionsActives: number;
}
