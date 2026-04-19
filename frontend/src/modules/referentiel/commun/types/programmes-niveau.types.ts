export type StatutProgrammeNiveau = 'BROUILLON' | 'VALIDE' | 'ARCHIVE';

export interface PonderationProgrammeNiveau {
  maxP1: number;
  maxP2: number;
  maxEX1: number;
  maxP3: number;
  maxP4: number;
  maxEX2: number;
  maxP5: number;
  maxP6: number;
  maxEX3: number;
}

export interface LigneProgrammeNiveauResume {
  id: string;
  idReferentielCours: string;
  ordreAffichage: number;
  obligatoire: boolean;
  aExamen: boolean;
  estActifDansEcole: boolean;
  estCalculable: boolean;
  obsolete: boolean;
  sourceLigne: string;
  ponderation: PonderationProgrammeNiveau;
}

export interface ProgrammeNiveauResume {
  id: string;
  idEcole: string;
  idClasseAcademique: string;
  idAnneeScolaire: string;
  idReferentielProgramme: string;
  idVersionReferentielProgramme: string;
  statut: StatutProgrammeNiveau;
  creeLe: string;
  version: number;
  lignes: LigneProgrammeNiveauResume[];
  creePar?: string;
  valideLe?: string;
  validePar?: string;
  archiveLe?: string;
}

export interface PaginationProgrammesNiveau {
  total: number;
  page: number;
  taillePage: number;
  totalPages: number;
}

export interface ReponseListeProgrammesNiveau {
  donnees: ProgrammeNiveauResume[];
  pagination: PaginationProgrammesNiveau;
}

export interface ReponseProgrammeNiveau {
  donnee: ProgrammeNiveauResume;
}

export interface EtatLocalProgrammeNiveau {
  statut: StatutProgrammeNiveau;
  lignes: LigneProgrammeNiveauResume[];
  nombreLignesActivesDansEcole: number;
  nombreLignesNonCalculables: number;
  nombreLignesObsoletes: number;
}

export interface ReponseEtatLocalProgrammeNiveau {
  donnee: EtatLocalProgrammeNiveau;
}
