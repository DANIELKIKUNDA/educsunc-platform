import type { DetailResponse } from '../../finances/models/payment-history.model';

export type PedagogicalAnalysisActorCode =
  | 'TITULAIRE'
  | 'PREFET_ETUDES'
  | 'DIRECTEUR_ETUDES';

export interface PedagogicalApiContext {
  organisationId: string | null;
  ecoleId: string | null;
  utilisateurId: string | null;
}

export interface PaginatedResponse<TData> {
  donnee: TData[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApplicationConduiteApiData {
  codePeriode: string;
  application?: string;
  conduite?: string;
  pointsConduite?: number;
}

export interface DiagnosticEchecApiData {
  codeColonne: string;
  nombreEchecs: number;
  nombreEchecsLegers: number;
  nombreEchecsProfonds: number;
  eligiblePerequation: boolean;
  eligibleRepechage: boolean;
  commentaireTechnique?: string;
}

export interface ResultatColonneApiData {
  codeColonne: string;
  totalObtenu?: number;
  maximumGeneral?: number;
  pourcentage?: number;
  rang?: number;
  estClassable: boolean;
  estNonClasse: boolean;
}

export interface ResultatBulletinApiData {
  idResultatBulletinEleve: string;
  idEleve: string;
  idInscriptionScolaire: string;
  idEcole: string;
  idClassePedagogique: string;
  resultatsColonnes: ResultatColonneApiData[];
  applications: ApplicationConduiteApiData[];
  diagnostics: DiagnosticEchecApiData[];
}

export interface EleveEchecApiData {
  idEleve: string;
  nomComplet: string;
  sexe?: string;
  idClassePedagogique: string;
  codeColonne: string;
  pourcentage?: number;
  rang?: number;
  nombreEchecs: number;
  nombreEchecsProfonds: number;
  eligiblePerequation: boolean;
  eligibleRepechage: boolean;
}

export interface CoursProblematiqueApiData {
  idReferentielCours: string;
  codeColonne: string;
  effectifEchecs: number;
  effectifEchecsProfonds: number;
  moyennePourcentage: number;
  idsElevesConcernes: string[];
}

export interface ComparatifClasseApiData {
  idClassePedagogique: string;
  libelleClasse: string;
  codeColonne: string;
  participantsTotal: number;
  classesTotal: number;
  nonClassesTotal: number;
  abandonsTotal: number;
  tauxReussite: number;
  tauxEchec: number;
}

export interface EvolutionResultatApiData {
  codeColonne: string;
  totalObtenu?: number;
  maximumGeneral?: number;
  pourcentage?: number;
  rang?: number;
  estNonClasse: boolean;
  dateObservation: string;
  motifObservation: string;
  estEtatCourant: boolean;
}

export interface EligibilitePerequationApiData {
  idEleve: string;
  nomComplet: string;
  sexe?: string;
  idClassePedagogique: string;
  codeColonne: string;
  pourcentage?: number;
  rang?: number;
  nombreEchecs: number;
  nombreEchecsLegers: number;
  nombreEchecsProfonds: number;
  eligiblePerequation: true;
}

export interface DossierDeliberationApiData {
  idEleve: string;
  nomComplet: string;
  sexe?: string;
  idClassePedagogique: string;
  codeColonne: string;
  pourcentage?: number;
  rang?: number;
  nombreEchecs: number;
  nombreEchecsLegers: number;
  nombreEchecsProfonds: number;
  eligiblePerequation: boolean;
  eligibleRepechage: boolean;
  commentaireTechnique?: string;
}

export interface NonClasseApiData {
  idEleve: string;
  nomComplet: string;
  sexe: string;
  motifs: string[];
  coursManquants: string[];
  colonnesManquantes: string[];
}

export interface PedagogicalAnalysisFilters {
  idAnneeScolaire: string;
  idClassePedagogique: string;
  codeColonne: string;
  idEleve?: string;
  idClassesPedagogiques?: string;
  anneeScolaireLabel?: string;
  classeLabel?: string;
  sectionLabel?: string;
  eleveLabel?: string;
}

export interface PedagogicalResultColumnViewModel {
  code: string;
  label: string;
  totalObtenu: string;
  maximumGeneral: string;
  pourcentage: string;
  rang: string;
  estClassable: boolean;
  estNonClasse: boolean;
}

export interface PedagogicalDiagnosticViewModel {
  code: string;
  label: string;
  nombreEchecs: number;
  nombreEchecsLegers: number;
  nombreEchecsProfonds: number;
  eligiblePerequation: boolean;
  eligibleRepechage: boolean;
  commentaireTechnique: string;
}

export interface PedagogicalApplicationViewModel {
  codePeriode: string;
  application: string;
  conduite: string;
  pointsConduite: string;
}

export interface StudentResultDetailViewModel {
  eleveId: string;
  eleveLabel: string;
  classeId: string;
  classeLabel: string;
  sectionLabel: string;
  anneeScolaireLabel: string;
  resumePourcentage: string;
  resumeRang: string;
  nombreDiagnostics: number;
  resultColumns: PedagogicalResultColumnViewModel[];
  diagnostics: PedagogicalDiagnosticViewModel[];
  applications: PedagogicalApplicationViewModel[];
  evolution: EvolutionResultatApiData[];
}

export interface PedagogicalAnalysisCenterViewModel {
  scopeLabel: string;
  actorScopeMessage: string;
  activeColumnLabel: string;
  studentDetail: StudentResultDetailViewModel | null;
  echecs: EleveEchecApiData[];
  echecsProfonds: EleveEchecApiData[];
  coursProblematiques: CoursProblematiqueApiData[];
  comparatifClasses: ComparatifClasseApiData[];
  perequation: EligibilitePerequationApiData[];
  repechage: DossierDeliberationApiData[];
  deliberation: DossierDeliberationApiData[];
  secondeSession: DossierDeliberationApiData[];
  nonClasses: NonClasseApiData[];
}

export type StudentResultDetailResponse = DetailResponse<ResultatBulletinApiData>;

export const authorizedPedagogicalAnalysisActors: PedagogicalAnalysisActorCode[] = [
  'TITULAIRE',
  'PREFET_ETUDES',
  'DIRECTEUR_ETUDES',
];
