// Ce DTO represente les donnees attendues pour creer une option d'etude.
export interface CreerOptionEtudeEntree {
  code: number;
  libelle: string;
  typeOption?: string;
  abreviation?: string;
  ordreAffichage?: number;
  creePar: string;
}
