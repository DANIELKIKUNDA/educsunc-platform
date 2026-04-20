export interface ClasseAcademiqueResume {
  id: string;
  idSectionScolaire: string;
  idOptionEtude?: string;
  code: string;
  libelle: string;
  ordrePedagogique: number;
  cycle: string;
  accepteOptions: boolean;
  optionObligatoire: boolean;
  typeStructureEvaluation: string;
  active: boolean;
  creeLe: string;
  version: number;
  modifieLe?: string;
}

export interface SectionScolaireResume {
  id: string;
  code: string;
  libelle: string;
  ordreAffichage: number;
  active: boolean;
  creeLe: string;
  version: number;
  modifieLe?: string;
}

export interface OptionEtudeResume {
  id: string;
  code: string;
  libelle: string;
  abreviation?: string;
}

export interface ClassePedagogiqueResume {
  id: string;
  idEcole: string;
  idClasseAcademique: string;
  idAnneeScolaire: string;
  code: string;
  libelle: string;
  active: boolean;
  creeLe: string;
  version: number;
  suffixeParallele?: string;
  capaciteAccueil?: number;
  archiveLe?: string;
  modifieLe?: string;
}

export interface PaginationStructureScolaire {
  total: number;
  page: number;
  taillePage: number;
  totalPages: number;
}

export interface ReponseListeClassesPedagogiques {
  donnees: ClassePedagogiqueResume[];
  pagination: PaginationStructureScolaire;
}

export interface ReponseClassePedagogique {
  donnee: ClassePedagogiqueResume;
}

export interface ReponseListeClassesAcademiques {
  donnees: ClasseAcademiqueResume[];
  pagination: PaginationStructureScolaire;
}

export interface ReponseListeSectionsScolaires {
  donnees: SectionScolaireResume[];
  pagination: PaginationStructureScolaire;
}

export interface ReponseListeOptionsEtudes {
  donnees: OptionEtudeResume[];
  pagination: PaginationStructureScolaire;
}
