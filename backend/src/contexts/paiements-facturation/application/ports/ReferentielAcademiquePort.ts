// Ce port expose les faits académiques utiles au BC paiements-facturation.
export interface ClasseReglesFraisDTO {
  idClassePedagogique: string;
  section?: string;
  optionEstTechnique?: boolean;
  optionCategorieTechnique?: string;
  estClasseTENASOSP?: boolean;
  estClasseEXETAT?: boolean;
  estClasseFinaliste?: boolean;
  categorieFraisEtat?: string;
}

export interface ReferentielAcademiquePort {
  consulterReglesFraisClasse(idClassePedagogique: string): Promise<ClasseReglesFraisDTO>;
}
