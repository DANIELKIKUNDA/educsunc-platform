export interface ReferentielProgrammeResume {
  id: string;
  idClasseAcademique: string;
  typeStructureEvaluation: string;
  versionProjectionnee: VersionReferentielProgrammeResume | null;
  actif: boolean;
  creeLe: string;
  version: number;
}

export interface VersionReferentielProgrammeResume {
  id: string;
  codeVersion: string;
  anneeReference: string;
  datePublication: string;
  active: boolean;
  publiee: boolean;
  sourceImport: string;
  creeLe: string;
  motifPublication?: string;
  lignes: LigneReferentielProgrammeResume[];
}

export interface LigneReferentielProgrammeResume {
  id: string;
  idReferentielCours: string;
  ordreAffichage: number;
  obligatoire: boolean;
  aExamen: boolean;
  estCalculable: boolean;
  domaine?: string;
  sousDomaine?: string;
  ponderation: {
    maxP1: number;
    maxP2: number;
    maxEX1: number;
    maxP3: number;
    maxP4: number;
    maxEX2: number;
    maxP5: number;
    maxP6: number;
    maxEX3: number;
  };
}

export interface ReferentielCoursResume {
  id: string;
  code: string;
  libelle: string;
  actif: boolean;
  creeLe: string;
  version: number;
  abreviation?: string;
  domaine?: string;
  sousDomaine?: string;
  modifieLe?: string;
}

export interface PaginationReferentielOfficiel {
  total: number;
  page: number;
  taillePage: number;
  totalPages: number;
}

export interface ReponseListeReferentielsProgrammes {
  donnees: ReferentielProgrammeResume[];
  pagination: PaginationReferentielOfficiel;
}

export interface ReponseReferentielProgramme {
  donnee: ReferentielProgrammeResume;
}

export interface ReponseListeReferentielsCours {
  donnees: ReferentielCoursResume[];
  pagination: PaginationReferentielOfficiel;
}
