// Ce DTO expose les faits academiques necessaires au BC Paiements pour decider les frais.
export interface ClasseReglesFraisDTO {
  idClasse: string;
  nomClasse: string;
  section: 'MATERNELLE' | 'PRIMAIRE' | 'SECONDAIRE';
  cycle: string;
  option?: {
    idOption: string;
    nom: string;
    estTechnique: boolean;
    categorieTechnique: 'GROUPE_1' | 'GROUPE_2' | null;
  };
  estClasseTENASOSP: boolean;
  estClasseEXETAT: boolean;
  estClasseFinaliste: boolean;
  categorieFraisEtat:
    | 'MATERNELLE'
    | 'PRIMAIRE'
    | 'SECONDAIRE_EB'
    | 'SECONDAIRE_GENERALE'
    | 'SECONDAIRE_TECHNIQUE';
}
