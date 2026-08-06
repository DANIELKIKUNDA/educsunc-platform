export type ConduiteManagementActorCode =
  | 'ENSEIGNANT'
  | 'DIRECTEUR_DISCIPLINE';

export interface ConduiteClasseApiBlock {
  codePeriode: string;
  application?: string;
  conduite?: string;
  pointsConduite?: number;
}

export interface ConduiteClasseApiLine {
  idResultatBulletinEleve: string;
  idEleve: string;
  nomComplet: string;
  sexe?: string;
  applications: ConduiteClasseApiBlock[];
}

export interface ConduiteClasseApiData {
  idClassePedagogique: string;
  idAnneeScolaire: string;
  lignes: ConduiteClasseApiLine[];
}

export interface ConduiteClasseFilters {
  idAnneeScolaire: string;
  idClassePedagogique: string;
  anneeScolaireLabel?: string;
  classeLabel?: string;
  sectionLabel?: string;
}

export interface AuditConduiteApiEntry {
  action: string;
  dateAction: string;
  idUtilisateur?: string;
  commentaire?: string;
}

export interface ConduiteClasseLineViewModel {
  idResultatBulletinEleve: string;
  idEleve: string;
  nomComplet: string;
  sexe: string;
  periodes: Array<{
    codePeriode: string;
    application: string;
    conduite: string;
    pointsConduite: string;
    pointsConduiteValue: number | null;
  }>;
  conduitesEncodees: number;
}

export interface ConduiteClasseViewModel {
  scopeLabel: string;
  actorScopeMessage: string;
  lignes: ConduiteClasseLineViewModel[];
  totalEleves: number;
  totalConduitesEncodees: number;
  totalConduitesRestantes: number;
}

export const authorizedConduiteManagementActors: ConduiteManagementActorCode[] = [
  'ENSEIGNANT',
  'DIRECTEUR_DISCIPLINE',
];
