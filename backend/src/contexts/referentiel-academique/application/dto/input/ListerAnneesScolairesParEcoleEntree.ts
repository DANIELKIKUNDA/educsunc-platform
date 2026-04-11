// Ce DTO represente les donnees attendues pour lister les annees scolaires d'une ecole.
export interface ListerAnneesScolairesParEcoleEntree {
  idEcole: string;
  page: number;
  taillePage: number;
}
