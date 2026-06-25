import { BulletinEleve } from 'contexts/bulletins-evaluations/domain/aggregates/BulletinEleve';
import { ClassementColonneClasse } from 'contexts/bulletins-evaluations/domain/aggregates/ClassementColonneClasse';
import { FicheCotationEleveCours } from 'contexts/bulletins-evaluations/domain/aggregates/FicheCotationEleveCours';
import { MigrationBulletin } from 'contexts/bulletins-evaluations/domain/aggregates/MigrationBulletin';
import { ProclamationClasse } from 'contexts/bulletins-evaluations/domain/aggregates/ProclamationClasse';
import { ResultatBulletinEleve } from 'contexts/bulletins-evaluations/domain/aggregates/ResultatBulletinEleve';
import { SyntheseResultatsEcole } from 'contexts/bulletins-evaluations/domain/aggregates/SyntheseResultatsEcole';
import { ApplicationPeriode } from 'contexts/bulletins-evaluations/domain/entities/ApplicationPeriode';
import { BlocApplicationConduite } from 'contexts/bulletins-evaluations/domain/entities/BlocApplicationConduite';
import { ConduitePeriode } from 'contexts/bulletins-evaluations/domain/entities/ConduitePeriode';
import { CoteColonneBulletin } from 'contexts/bulletins-evaluations/domain/entities/CoteColonneBulletin';
import { DiagnosticEchec } from 'contexts/bulletins-evaluations/domain/entities/DiagnosticEchec';
import { DiffColonneBulletin } from 'contexts/bulletins-evaluations/domain/entities/DiffColonneBulletin';
import { EleveAbandonProclamation } from 'contexts/bulletins-evaluations/domain/entities/EleveAbandonProclamation';
import { EleveNonClasseProclamation } from 'contexts/bulletins-evaluations/domain/entities/EleveNonClasseProclamation';
import { HistoriqueGenerationBulletin } from 'contexts/bulletins-evaluations/domain/entities/HistoriqueGenerationBulletin';
import { HistoriqueGenerationProclamation } from 'contexts/bulletins-evaluations/domain/entities/HistoriqueGenerationProclamation';
import { LigneBulletinEleve } from 'contexts/bulletins-evaluations/domain/entities/LigneBulletinEleve';
import { LigneClassementEleve } from 'contexts/bulletins-evaluations/domain/entities/LigneClassementEleve';
import { LigneProclamationClasse } from 'contexts/bulletins-evaluations/domain/entities/LigneProclamationClasse';
import { LigneSyntheseResultatsClasse } from 'contexts/bulletins-evaluations/domain/entities/LigneSyntheseResultatsClasse';
import { ResultatColonneBulletin } from 'contexts/bulletins-evaluations/domain/entities/ResultatColonneBulletin';
import { StatistiquesProclamationClasse } from 'contexts/bulletins-evaluations/domain/entities/StatistiquesProclamationClasse';
import { TransformationCoteBulletin } from 'contexts/bulletins-evaluations/domain/entities/TransformationCoteBulletin';
import { CodeColonneBulletin } from 'contexts/bulletins-evaluations/domain/value-objects/CodeColonneBulletin';
import { CodePeriodeSimple } from 'contexts/bulletins-evaluations/domain/value-objects/CodePeriodeSimple';
import { EtatBulletin } from 'contexts/bulletins-evaluations/domain/value-objects/EtatBulletin';
import { MentionBulletin } from 'contexts/bulletins-evaluations/domain/value-objects/MentionBulletin';
import { MotifNonClasse } from 'contexts/bulletins-evaluations/domain/value-objects/MotifNonClasse';
import { SexeEleve } from 'contexts/bulletins-evaluations/domain/value-objects/SexeEleve';
import { StatutMigrationBulletin } from 'contexts/bulletins-evaluations/domain/value-objects/StatutMigrationBulletin';
import { StatutProclamationEleve } from 'contexts/bulletins-evaluations/domain/value-objects/StatutProclamationEleve';
import { TypeDiffBulletin } from 'contexts/bulletins-evaluations/domain/value-objects/TypeDiffBulletin';
import { TypeProclamation } from 'contexts/bulletins-evaluations/domain/value-objects/TypeProclamation';
import { TypeStructureEvaluation } from 'contexts/bulletins-evaluations/domain/value-objects/TypeStructureEvaluation';
import { TypeSyntheseResultats } from 'contexts/bulletins-evaluations/domain/value-objects/TypeSyntheseResultats';

// Ce fichier centralise des fabriques de test simples pour eviter de dupliquer les objets metier.
let sequenceIdentifiants = 0;

// Cette fonction produit un identifiant deterministe pour les tests.
export function creerIdentifiant(prefixe: string): string {
  sequenceIdentifiants += 1;
  return `${prefixe}-${sequenceIdentifiants}`;
}

// Cette fonction fabrique une cote de colonne de bulletin exploitable dans les tests.
export function creerCoteColonne(
  codeColonne: CodeColonneBulletin,
  coteObtenue?: number | null,
  maximumColonne = 10,
): CoteColonneBulletin {
  return new CoteColonneBulletin({
    idCoteColonneBulletin: creerIdentifiant('cote'),
    codeColonne,
    coteObtenue,
    maximumColonne,
  });
}

// Cette fonction fabrique une fiche de cotation minimale.
export function creerFicheCotation(
  overrides: Partial<ConstructorParameters<typeof FicheCotationEleveCours>[0]> = {},
): FicheCotationEleveCours {
  return new FicheCotationEleveCours({
    idFicheCotationEleveCours: creerIdentifiant('fiche'),
    idEcole: 'ecole-1',
    idEleve: 'eleve-1',
    idInscriptionScolaire: 'inscription-1',
    idClassePedagogique: 'classe-1',
    idAnneeScolaire: 'annee-1',
    idReferentielCours: 'cours-1',
    idProgrammeNiveau: 'programme-1',
    typeStructureEvaluation: TypeStructureEvaluation.SEMESTRIEL,
    estCalculable: true,
    aExamen: true,
    versionReferentielProgramme: 'version-ref-1',
    creePar: 'utilisateur-1',
    creeLe: new Date('2026-01-01T00:00:00.000Z'),
    creerEvenement: false,
    cotesColonnes: [
      creerCoteColonne(CodeColonneBulletin.P1, null),
      creerCoteColonne(CodeColonneBulletin.P2, null),
      creerCoteColonne(CodeColonneBulletin.EX1, null),
      creerCoteColonne(CodeColonneBulletin.TOTAL_S1, null, 30),
      creerCoteColonne(CodeColonneBulletin.P3, null),
      creerCoteColonne(CodeColonneBulletin.P4, null),
      creerCoteColonne(CodeColonneBulletin.EX2, null),
      creerCoteColonne(CodeColonneBulletin.TOTAL_S2, null, 30),
      creerCoteColonne(CodeColonneBulletin.TOTAL_GENERAL, null, 60),
    ],
    ...overrides,
  });
}

// Cette fonction fabrique une ligne de classement.
export function creerLigneClassement(
  overrides: Partial<ConstructorParameters<typeof LigneClassementEleve>[0]> = {},
): LigneClassementEleve {
  return new LigneClassementEleve({
    idLigneClassementEleve: creerIdentifiant('ligne-classement'),
    idEleve: creerIdentifiant('eleve'),
    sexe: SexeEleve.M,
    totalObtenu: 140,
    maximumGeneral: 200,
    pourcentage: 70,
    rang: 1,
    estNonClasse: false,
    ...overrides,
  });
}

// Cette fonction fabrique un resultat par colonne.
export function creerResultatColonne(
  codeColonne = CodeColonneBulletin.TOTAL_GENERAL,
  overrides: Partial<ConstructorParameters<typeof ResultatColonneBulletin>[0]> = {},
): ResultatColonneBulletin {
  return new ResultatColonneBulletin({
    idResultatColonneBulletin: creerIdentifiant('resultat-colonne'),
    codeColonne,
    totalObtenu: 140,
    maximumGeneral: 200,
    pourcentage: 70,
    rang: 1,
    estClassable: true,
    estNonClasse: false,
    ...overrides,
  });
}

// Cette fonction fabrique un resultat bulletin eleve.
export function creerResultatBulletin(
  overrides: Partial<ConstructorParameters<typeof ResultatBulletinEleve>[0]> = {},
): ResultatBulletinEleve {
  return new ResultatBulletinEleve({
    idResultatBulletinEleve: creerIdentifiant('resultat'),
    idEcole: 'ecole-1',
    idEleve: 'eleve-1',
    idInscriptionScolaire: 'inscription-1',
    idClassePedagogique: 'classe-1',
    idAnneeScolaire: 'annee-1',
    idProgrammeNiveau: 'programme-1',
    typeStructureEvaluation: TypeStructureEvaluation.SEMESTRIEL,
    versionReferentielProgramme: 'version-ref-1',
    resultatsColonnes: [
      creerResultatColonne(CodeColonneBulletin.P1),
      creerResultatColonne(CodeColonneBulletin.TOTAL_GENERAL),
    ],
    ...overrides,
  });
}

// Cette fonction fabrique une ligne de bulletin.
export function creerLigneBulletin(
  overrides: Partial<ConstructorParameters<typeof LigneBulletinEleve>[0]> = {},
): LigneBulletinEleve {
  return new LigneBulletinEleve({
    idLigneBulletinEleve: creerIdentifiant('ligne-bulletin'),
    idReferentielCours: 'cours-1',
    libelleCours: 'Mathematiques',
    ordreAffichage: 1,
    estCalculable: true,
    aExamen: true,
    mentionRepechage: undefined,
    ...overrides,
  });
}

// Cette fonction fabrique un bloc application/conduite.
export function creerBlocApplicationConduite(
  overrides: Partial<ConstructorParameters<typeof BlocApplicationConduite>[0]> = {},
): BlocApplicationConduite {
  return new BlocApplicationConduite({
    idBlocApplicationConduite: creerIdentifiant('bloc'),
    codePeriode: CodePeriodeSimple.P1,
    application: MentionBulletin.B,
    conduite: MentionBulletin.TB,
    pointsConduite: 75,
    ...overrides,
  });
}

// Cette fonction fabrique un bulletin eleve.
export function creerBulletin(
  overrides: Partial<ConstructorParameters<typeof BulletinEleve>[0]> = {},
): BulletinEleve {
  return new BulletinEleve({
    idBulletinEleve: creerIdentifiant('bulletin'),
    idEcole: 'ecole-1',
    idEleve: 'eleve-1',
    idInscriptionScolaire: 'inscription-1',
    idClassePedagogique: 'classe-1',
    idAnneeScolaire: 'annee-1',
    idProgrammeNiveau: 'programme-1',
    typeStructureEvaluation: TypeStructureEvaluation.SEMESTRIEL,
    etatBulletin: EtatBulletin.BROUILLON,
    versionReferentielProgramme: 'version-ref-1',
    lignesBulletin: [creerLigneBulletin()],
    blocsApplicationConduite: [creerBlocApplicationConduite()],
    historiqueGeneration: [],
    ...overrides,
  });
}

// Cette fonction fabrique une application periode.
export function creerApplicationPeriode(
  overrides: Partial<ConstructorParameters<typeof ApplicationPeriode>[0]> = {},
): ApplicationPeriode {
  return new ApplicationPeriode({
    idApplicationPeriode: creerIdentifiant('application'),
    codePeriode: CodePeriodeSimple.P1,
    pourcentage: 72,
    ...overrides,
  });
}

// Cette fonction fabrique une conduite de periode.
export function creerConduitePeriode(
  overrides: Partial<ConstructorParameters<typeof ConduitePeriode>[0]> = {},
): ConduitePeriode {
  return new ConduitePeriode({
    idConduitePeriode: creerIdentifiant('conduite'),
    codePeriode: CodePeriodeSimple.P1,
    pointsConduite: 80,
    encodeePar: 'utilisateur-1',
    dateEncodage: new Date('2026-01-01T00:00:00.000Z'),
    ...overrides,
  });
}

// Cette fonction fabrique un diagnostic d'echec.
export function creerDiagnosticEchec(
  overrides: Partial<ConstructorParameters<typeof DiagnosticEchec>[0]> = {},
): DiagnosticEchec {
  return new DiagnosticEchec({
    idDiagnosticEchec: creerIdentifiant('diagnostic'),
    codeColonne: CodeColonneBulletin.TOTAL_GENERAL,
    nombreEchecs: 2,
    nombreEchecsLegers: 1,
    nombreEchecsProfonds: 1,
    eligiblePerequation: true,
    eligibleRepechage: false,
    ...overrides,
  });
}

// Cette fonction fabrique un classement de colonne.
export function creerClassement(
  overrides: Partial<ConstructorParameters<typeof ClassementColonneClasse>[0]> = {},
): ClassementColonneClasse {
  return new ClassementColonneClasse({
    idClassementColonneClasse: creerIdentifiant('classement'),
    idEcole: 'ecole-1',
    idClassePedagogique: 'classe-1',
    idAnneeScolaire: 'annee-1',
    codeColonne: CodeColonneBulletin.TOTAL_GENERAL,
    typeStructureEvaluation: TypeStructureEvaluation.SEMESTRIEL,
    dateCalcul: new Date('2026-01-01T00:00:00.000Z'),
    lignesClassement: [],
    ...overrides,
  });
}

// Cette fonction fabrique une ligne de proclamation.
export function creerLigneProclamation(
  overrides: Partial<ConstructorParameters<typeof LigneProclamationClasse>[0]> = {},
): LigneProclamationClasse {
  return new LigneProclamationClasse({
    idLigneProclamationClasse: creerIdentifiant('ligne-proclamation'),
    rang: 1,
    idEleve: 'eleve-1',
    nomComplet: 'Eleve Test',
    sexe: SexeEleve.M,
    totalObtenu: 140,
    maximumGeneral: 200,
    pourcentage: 70,
    statutProclamation: StatutProclamationEleve.CLASSE,
    ...overrides,
  });
}

// Cette fonction fabrique les statistiques documentaires d'une proclamation.
export function creerStatistiquesProclamation(
  overrides: Partial<ConstructorParameters<typeof StatistiquesProclamationClasse>[0]> = {},
): StatistiquesProclamationClasse {
  return new StatistiquesProclamationClasse({
    inscritsGarcons: 5,
    inscritsFilles: 5,
    inscritsTotal: 10,
    participantsGarcons: 5,
    participantsFilles: 4,
    participantsTotal: 9,
    classesGarcons: 4,
    classesFilles: 3,
    classesTotal: 7,
    nonClassesGarcons: 1,
    nonClassesFilles: 1,
    nonClassesTotal: 2,
    abandonsGarcons: 0,
    abandonsFilles: 1,
    abandonsTotal: 1,
    reussitesGarcons: 4,
    reussitesFilles: 3,
    reussitesTotal: 7,
    echecsGarcons: 0,
    echecsFilles: 0,
    echecsTotal: 0,
    tauxParticipation: 90,
    tauxReussite: 77.78,
    tauxEchec: 0,
    tauxAbandon: 10,
    ...overrides,
  });
}

// Cette fonction fabrique une proclamation de classe.
export function creerProclamation(
  overrides: Partial<ConstructorParameters<typeof ProclamationClasse>[0]> = {},
): ProclamationClasse {
  return new ProclamationClasse({
    idProclamationClasse: creerIdentifiant('proclamation'),
    idEcole: 'ecole-1',
    idClassePedagogique: 'classe-1',
    idAnneeScolaire: 'annee-1',
    codeColonne: CodeColonneBulletin.TOTAL_GENERAL,
    typeProclamation: TypeProclamation.ANNUEL,
    dateGeneration: new Date('2026-01-01T00:00:00.000Z'),
    genereePar: 'utilisateur-1',
    versionReferentielProgramme: 'programme-version-1',
    lignesProclamation: [creerLigneProclamation()],
    elevesNonClasses: [],
    elevesAbandon: [],
    historiqueGeneration: [],
    ...overrides,
  });
}

// Cette fonction fabrique une ligne de synthese par classe.
export function creerLigneSynthese(
  overrides: Partial<ConstructorParameters<typeof LigneSyntheseResultatsClasse>[0]> = {},
): LigneSyntheseResultatsClasse {
  return new LigneSyntheseResultatsClasse({
    idClassePedagogique: 'classe-1',
    libelleClasse: '3e Scientifique',
    statistiques: creerStatistiquesProclamation(),
    ...overrides,
  });
}

// Cette fonction fabrique une synthese de resultats d'ecole.
export function creerSynthese(
  overrides: Partial<ConstructorParameters<typeof SyntheseResultatsEcole>[0]> = {},
): SyntheseResultatsEcole {
  return new SyntheseResultatsEcole({
    idSyntheseResultatsEcole: creerIdentifiant('synthese'),
    idEcole: 'ecole-1',
    idAnneeScolaire: 'annee-1',
    codeColonne: CodeColonneBulletin.TOTAL_GENERAL,
    typeSynthese: TypeSyntheseResultats.ANNUELLE,
    dateGeneration: new Date('2026-01-01T00:00:00.000Z'),
    genereePar: 'utilisateur-1',
    lignesSyntheseResultatsClasse: [creerLigneSynthese()],
    ...overrides,
  });
}

// Cette fonction fabrique une transformation de cote de migration.
export function creerTransformation(
  overrides: Partial<ConstructorParameters<typeof TransformationCoteBulletin>[0]> = {},
): TransformationCoteBulletin {
  return new TransformationCoteBulletin({
    idTransformationCoteBulletin: creerIdentifiant('transformation'),
    idEleve: 'eleve-1',
    idReferentielCours: 'cours-1',
    codeColonne: CodeColonneBulletin.P1,
    ancienneCote: 8,
    nouvelleCote: 12,
    ancienMaximum: 10,
    nouveauMaximum: 15,
    dateTransformation: new Date('2026-01-01T00:00:00.000Z'),
    ...overrides,
  });
}

// Cette fonction fabrique une difference de migration.
export function creerDiff(
  overrides: Partial<ConstructorParameters<typeof DiffColonneBulletin>[0]> = {},
): DiffColonneBulletin {
  return new DiffColonneBulletin({
    typeDiff: TypeDiffBulletin.PONDERATION_MODIFIEE,
    codeCours: 'MATH',
    codeColonne: CodeColonneBulletin.P1,
    ancienMaximum: 10,
    nouveauMaximum: 20,
    commentaire: 'Diff test',
    ...overrides,
  });
}

// Cette fonction fabrique une migration de bulletin.
export function creerMigration(
  overrides: Partial<ConstructorParameters<typeof MigrationBulletin>[0]> = {},
): MigrationBulletin {
  return new MigrationBulletin({
    idMigrationBulletin: creerIdentifiant('migration'),
    idEcole: 'ecole-1',
    idClassePedagogique: 'classe-1',
    idAnneeScolaire: 'annee-1',
    ancienneVersionReferentiel: 'version-1',
    nouvelleVersionReferentiel: 'version-2',
    dateMigration: new Date('2026-01-01T00:00:00.000Z'),
    declenchePar: 'utilisateur-1',
    statutMigration: StatutMigrationBulletin.BROUILLON,
    transformationsCoteBulletin: [],
    diffsColonnesBulletin: [],
    ...overrides,
  });
}

// Cette fonction fabrique un historique de generation de bulletin.
export function creerHistoriqueGenerationBulletin(): HistoriqueGenerationBulletin {
  return new HistoriqueGenerationBulletin({
    idHistoriqueGenerationBulletin: creerIdentifiant('historique-bulletin'),
    dateGeneration: new Date('2026-01-01T00:00:00.000Z'),
    generePar: 'utilisateur-1',
    motifGeneration: 'TEST',
    versionBulletin: 1,
    versionReferentielProgramme: 'programme-version-1',
  });
}

// Cette fonction fabrique un historique de proclamation.
export function creerHistoriqueGenerationProclamation(): HistoriqueGenerationProclamation {
  return new HistoriqueGenerationProclamation({
    idHistoriqueGenerationProclamation: creerIdentifiant('historique-proclamation'),
    dateGeneration: new Date('2026-01-01T00:00:00.000Z'),
    genereePar: 'utilisateur-1',
    motifGeneration: 'TEST',
    versionReferentielProgramme: 'programme-version-1',
  });
}

// Cette fonction fabrique un eleve non classe dans une proclamation.
export function creerEleveNonClasse(): EleveNonClasseProclamation {
  return new EleveNonClasseProclamation({
    idEleve: 'eleve-nc-1',
    nomComplet: 'Eleve NC',
    sexe: SexeEleve.F,
    motifs: [MotifNonClasse.COTE_MANQUANTE],
    coursManquants: ['cours-1'],
    colonnesManquantes: [CodeColonneBulletin.P1],
  });
}

// Cette fonction fabrique un eleve abandon dans une proclamation.
export function creerEleveAbandon(): EleveAbandonProclamation {
  return new EleveAbandonProclamation({
    idEleve: 'eleve-ab-1',
    nomComplet: 'Eleve AB',
    sexe: SexeEleve.M,
    dateAbandon: new Date('2026-02-01T00:00:00.000Z'),
    motifAbandon: 'Demission',
  });
}
