export interface ClasseAcademiqueResume {
  id: string;
  code: string;
  libelle: string;
  sectionCode: string;
  optionCode?: string | null;
}

export interface OptionEtudeResume {
  id: string;
  code: string;
  libelle: string;
  abreviation?: string;
}

export interface ClassePedagogiqueResume {
  id: string;
  libelle: string;
  idClasseAcademique: string;
  idAnneeScolaire: string;
  active: boolean;
}
