import type {
  DossierDeliberationApiData,
  PedagogicalAnalysisCenterViewModel,
  PedagogicalAnalysisFilters,
  PedagogicalApplicationViewModel,
  PedagogicalDiagnosticViewModel,
  PedagogicalResultColumnViewModel,
  ResultatBulletinApiData,
  StudentResultDetailViewModel,
} from '../models/pedagogical-analysis.model';

const columnLabels: Record<string, string> = {
  P1: 'Periode 1',
  P2: 'Periode 2',
  EX1: 'Examen 1',
  TOTAL_S1: 'Total semestre 1',
  P3: 'Periode 3',
  P4: 'Periode 4',
  EX2: 'Examen 2',
  TOTAL_S2: 'Total semestre 2',
  TOTAL_GENERAL: 'Total general',
  TOTAL_T1: 'Total trimestre 1',
  TOTAL_T2: 'Total trimestre 2',
  P5: 'Periode 5',
  P6: 'Periode 6',
  EX3: 'Examen 3',
  TOTAL_T3: 'Total trimestre 3',
};

function formatDecimal(value: number | undefined): string {
  if (value === undefined) {
    return 'Non renseigne';
  }

  return new Intl.NumberFormat('fr-FR', {
    maximumFractionDigits: 2,
  }).format(value);
}

function formatPercent(value: number | undefined): string {
  return value === undefined ? 'Non renseigne' : `${formatDecimal(value)} %`;
}

function formatRank(value: number | undefined): string {
  return value === undefined ? 'Non classe' : `${value}`;
}

function labelColonne(code: string): string {
  return columnLabels[code] ?? code;
}

function mapResultColumns(resultat: ResultatBulletinApiData): PedagogicalResultColumnViewModel[] {
  return resultat.resultatsColonnes.map((colonne) => ({
    code: colonne.codeColonne,
    label: labelColonne(colonne.codeColonne),
    totalObtenu: formatDecimal(colonne.totalObtenu),
    maximumGeneral: formatDecimal(colonne.maximumGeneral),
    pourcentage: formatPercent(colonne.pourcentage),
    rang: formatRank(colonne.rang),
    estClassable: colonne.estClassable,
    estNonClasse: colonne.estNonClasse,
  }));
}

function mapDiagnostics(resultat: ResultatBulletinApiData): PedagogicalDiagnosticViewModel[] {
  return resultat.diagnostics.map((diagnostic) => ({
    code: diagnostic.codeColonne,
    label: labelColonne(diagnostic.codeColonne),
    nombreEchecs: diagnostic.nombreEchecs,
    nombreEchecsLegers: diagnostic.nombreEchecsLegers,
    nombreEchecsProfonds: diagnostic.nombreEchecsProfonds,
    eligiblePerequation: diagnostic.eligiblePerequation,
    eligibleRepechage: diagnostic.eligibleRepechage,
    commentaireTechnique: diagnostic.commentaireTechnique ?? 'Aucun commentaire technique expose.',
  }));
}

function mapApplications(resultat: ResultatBulletinApiData): PedagogicalApplicationViewModel[] {
  return resultat.applications.map((application) => ({
    codePeriode: application.codePeriode,
    application: application.application ?? 'Non exposee',
    conduite: application.conduite ?? 'Non exposee',
    pointsConduite: application.pointsConduite === undefined
      ? 'Non exposes'
      : formatDecimal(application.pointsConduite),
  }));
}

function lireResumePrincipal(resultat: ResultatBulletinApiData) {
  const totalGeneral = resultat.resultatsColonnes.find((colonne) => colonne.codeColonne === 'TOTAL_GENERAL');
  const colonneReference = totalGeneral ?? resultat.resultatsColonnes[0];

  return {
    pourcentage: formatPercent(colonneReference?.pourcentage),
    rang: formatRank(colonneReference?.rang),
  };
}

export function mapStudentResultDetailViewModel(
  resultat: ResultatBulletinApiData,
  evolution: StudentResultDetailViewModel['evolution'],
  filtres: PedagogicalAnalysisFilters,
): StudentResultDetailViewModel {
  const resume = lireResumePrincipal(resultat);

  return {
    eleveId: resultat.idEleve,
    eleveLabel: filtres.eleveLabel?.trim() || `Eleve ${resultat.idEleve}`,
    classeId: resultat.idClassePedagogique,
    classeLabel: filtres.classeLabel?.trim() || `Classe ${resultat.idClassePedagogique}`,
    sectionLabel: filtres.sectionLabel?.trim() || 'Section active',
    anneeScolaireLabel: filtres.anneeScolaireLabel?.trim() || filtres.idAnneeScolaire,
    resumePourcentage: resume.pourcentage,
    resumeRang: resume.rang,
    nombreDiagnostics: resultat.diagnostics.length,
    resultColumns: mapResultColumns(resultat),
    diagnostics: mapDiagnostics(resultat),
    applications: mapApplications(resultat),
    evolution,
  };
}

function actorScopeMessage(actorCode: string): string {
  switch (actorCode) {
    case 'TITULAIRE':
      return 'Lecture analytiquement bornee a la classe titulaire et a l annee scolaire active.';
    case 'PREFET_ETUDES':
    case 'DIRECTEUR_ETUDES':
      return 'Lecture analytiquement bornee a la section secondaire autorisee de l ecole active.';
    default:
      return 'Aucun perimetre pedagogique officiel n est ouvert pour cet acteur.';
  }
}

export function mapPedagogicalAnalysisCenterViewModel(
  donnees: {
    studentDetail: StudentResultDetailViewModel | null;
    echecs: PedagogicalAnalysisCenterViewModel['echecs'];
    echecsProfonds: PedagogicalAnalysisCenterViewModel['echecsProfonds'];
    coursProblematiques: PedagogicalAnalysisCenterViewModel['coursProblematiques'];
    comparatifClasses: PedagogicalAnalysisCenterViewModel['comparatifClasses'];
    perequation: PedagogicalAnalysisCenterViewModel['perequation'];
    repechage: DossierDeliberationApiData[];
    deliberation: DossierDeliberationApiData[];
    secondeSession: DossierDeliberationApiData[];
    nonClasses: PedagogicalAnalysisCenterViewModel['nonClasses'];
  },
  filtres: PedagogicalAnalysisFilters,
  actorCode: string,
): PedagogicalAnalysisCenterViewModel {
  const classe = filtres.classeLabel?.trim() || `Classe ${filtres.idClassePedagogique}`;
  const section = filtres.sectionLabel?.trim() || 'Section active';
  const annee = filtres.anneeScolaireLabel?.trim() || filtres.idAnneeScolaire;

  return {
    scopeLabel: `${classe} | ${section} | ${annee}`,
    actorScopeMessage: actorScopeMessage(actorCode),
    activeColumnLabel: labelColonne(filtres.codeColonne),
    studentDetail: donnees.studentDetail,
    echecs: donnees.echecs,
    echecsProfonds: donnees.echecsProfonds,
    coursProblematiques: donnees.coursProblematiques,
    comparatifClasses: donnees.comparatifClasses,
    perequation: donnees.perequation,
    repechage: donnees.repechage,
    deliberation: donnees.deliberation,
    secondeSession: donnees.secondeSession,
    nonClasses: donnees.nonClasses,
  };
}
