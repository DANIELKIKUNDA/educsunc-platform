// Ce DTO represente les donnees attendues pour renommer une organisation.
export interface RenommerOrganisationEntree {
  idOrganisation: string;
  nouveauNom: string;
  modifiePar: string;
}
