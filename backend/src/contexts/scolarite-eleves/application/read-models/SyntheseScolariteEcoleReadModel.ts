// Ce fichier definit le read model du tableau de bord scolarite d'une ecole.
export interface SyntheseScolariteEcoleReadModel {
  idOrganisation: string;
  idEcole: string;
  totalEleves: number;
  totalElevesActifs: number;
  totalFamilles: number;
  totalInscriptionsActives: number;
  totalAffectationsActives: number;
}
