// Ce DTO represente les donnees attendues pour mettre a jour l'identite institutionnelle d'une ecole existante.
export interface MettreAJourInformationsInstitutionnellesEcoleEntree {
  idEcole: string;
  modifiePar: string;
  sigle?: string;
  adresse?: string;
  telephone?: string;
  email?: string;
  provinceEducationnelle?: string;
  ville?: string;
  communeOuTerritoire?: string;
}
