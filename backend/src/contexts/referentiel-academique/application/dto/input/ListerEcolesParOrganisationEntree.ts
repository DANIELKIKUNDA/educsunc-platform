// Ce DTO represente les donnees attendues pour lister les ecoles d'une organisation.
export interface ListerEcolesParOrganisationEntree {
  idOrganisation: string;
  page: number;
  taillePage: number;
}
