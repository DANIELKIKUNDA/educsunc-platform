// Ce DTO represente les donnees attendues pour creer une option d'etude.
export interface CreerOptionEtudeEntree {
  code: number;
  libelle: string;
  typeOption?: string;
  estTechnique: boolean;
  categorieTechnique?: 'GROUPE_1' | 'GROUPE_2' | null;
  abreviation?: string;
  ordreAffichage?: number;
  creePar: string;
}
