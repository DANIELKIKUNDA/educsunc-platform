import '../../backend/src/config/variables-environnement.config';
import { creerInfrastructurePostgresReferentielAcademique } from '../../backend/src/contexts/referentiel-academique/infrastructure/persistence/postgres';
import type { ProprietesPonderationEvaluation } from '../../backend/src/contexts/referentiel-academique/domain/value-objects/PonderationEvaluation';

interface LigneProgrammeClassePostgres {
  classe_code: string;
  classe_libelle: string;
  section_code: string;
  section_libelle: string;
  option_code: string | null;
  option_libelle: string | null;
  type_structure_evaluation: string;
  code_version: string;
  annee_reference: string;
  date_publication: Date | string;
  ordre_affichage: number;
  cours_code: string;
  cours_libelle: string;
  cours_abreviation: string | null;
  obligatoire: boolean;
  a_examen: boolean;
  est_calculable: boolean;
  domaine: string | null;
  sous_domaine: string | null;
  ponderation: unknown;
}

interface VersionDisponiblePostgres {
  code_version: string;
  active: boolean;
  publiee: boolean;
  lignes: number;
}

interface ArgumentsVerificationProgramme {
  codeClasse: string;
  codeVersion: string;
}

const codeVersionParDefaut = 'MINEDUC-2024-2025-V2';

// Ce script affiche un programme officiel complet afin de faciliter la validation metier.
async function afficherProgrammeClasse(): Promise<void> {
  const argumentsVerification = lireArgumentsVerificationProgramme(process.argv.slice(2));
  const infrastructure = creerInfrastructurePostgresReferentielAcademique();

  try {
    await infrastructure.migrateur.executerMigrationsEnAttente();

    const lignes = await chargerLignesProgrammeClasse(
      infrastructure.clientLecture,
      argumentsVerification,
    );

    if (lignes.length === 0) {
      await afficherVersionsDisponibles(infrastructure.clientLecture, argumentsVerification);
      return;
    }

    imprimerProgrammeClasse(lignes, argumentsVerification);
  } finally {
    await infrastructure.pool.end();
  }
}

async function chargerLignesProgrammeClasse(
  clientLecture: ReturnType<typeof creerInfrastructurePostgresReferentielAcademique>['clientLecture'],
  argumentsVerification: ArgumentsVerificationProgramme,
): Promise<readonly LigneProgrammeClassePostgres[]> {
  const resultat = await clientLecture.executer<LigneProgrammeClassePostgres>(
    [
      'SELECT',
      'classe.code AS classe_code,',
      'classe.libelle AS classe_libelle,',
      'section.code AS section_code,',
      'section.libelle AS section_libelle,',
      'option_etude.code AS option_code,',
      'option_etude.libelle AS option_libelle,',
      'referentiel.type_structure_evaluation,',
      'version.code_version,',
      'version.annee_reference,',
      'version.date_publication,',
      'ligne.ordre_affichage,',
      'cours.code AS cours_code,',
      'cours.libelle AS cours_libelle,',
      'cours.abreviation AS cours_abreviation,',
      'ligne.obligatoire,',
      'ligne.a_examen,',
      'ligne.est_calculable,',
      'ligne.domaine,',
      'ligne.sous_domaine,',
      'ligne.ponderation',
      'FROM classes_academiques classe',
      'INNER JOIN sections_scolaires section ON section.id = classe.id_section_scolaire',
      'LEFT JOIN options_etudes option_etude ON option_etude.id = classe.id_option_etude',
      'INNER JOIN referentiels_programmes referentiel',
      'ON referentiel.id_classe_academique = classe.id',
      'INNER JOIN versions_referentiel_programme version',
      'ON version.id_referentiel_programme = referentiel.id',
      'INNER JOIN lignes_referentiel_programme ligne',
      'ON ligne.id_version_referentiel_programme = version.id',
      'INNER JOIN referentiels_cours cours ON cours.id = ligne.id_referentiel_cours',
      'WHERE classe.code = $1 AND version.code_version = $2',
      'ORDER BY ligne.ordre_affichage ASC, cours.code ASC',
    ].join(' '),
    [argumentsVerification.codeClasse, argumentsVerification.codeVersion],
  );

  return resultat.lignes;
}

async function afficherVersionsDisponibles(
  clientLecture: ReturnType<typeof creerInfrastructurePostgresReferentielAcademique>['clientLecture'],
  argumentsVerification: ArgumentsVerificationProgramme,
): Promise<void> {
  const resultat = await clientLecture.executer<VersionDisponiblePostgres>(
    [
      'SELECT version.code_version, version.active, version.publiee, count(ligne.id)::int AS lignes',
      'FROM classes_academiques classe',
      'INNER JOIN referentiels_programmes referentiel',
      'ON referentiel.id_classe_academique = classe.id',
      'INNER JOIN versions_referentiel_programme version',
      'ON version.id_referentiel_programme = referentiel.id',
      'LEFT JOIN lignes_referentiel_programme ligne',
      'ON ligne.id_version_referentiel_programme = version.id',
      'WHERE classe.code = $1',
      'GROUP BY version.code_version, version.active, version.publiee',
      'ORDER BY version.code_version ASC',
    ].join(' '),
    [argumentsVerification.codeClasse],
  );

  console.log(
    `Aucun programme trouve pour la classe ${argumentsVerification.codeClasse}`
      + ` avec la version ${argumentsVerification.codeVersion}.`,
  );

  if (resultat.lignes.length === 0) {
    console.log('Aucune version de programme disponible pour cette classe.');
    return;
  }

  console.log('Versions disponibles :');

  for (const versionDisponible of resultat.lignes) {
    console.log(
      `- ${versionDisponible.code_version}`
        + ` | active=${formaterBooleen(versionDisponible.active)}`
        + ` | publiee=${formaterBooleen(versionDisponible.publiee)}`
        + ` | lignes=${versionDisponible.lignes}`,
    );
  }
}

function imprimerProgrammeClasse(
  lignes: readonly LigneProgrammeClassePostgres[],
  argumentsVerification: ArgumentsVerificationProgramme,
): void {
  const premiereLigne = lignes[0];

  if (premiereLigne === undefined) {
    return;
  }

  const doublons = detecterDoublonsCours(lignes);

  console.log('');
  console.log('Programme academique officiel');
  console.log('==============================');
  console.log(`Classe   : ${premiereLigne.classe_code} - ${premiereLigne.classe_libelle}`);
  console.log(`Section  : ${premiereLigne.section_code} - ${premiereLigne.section_libelle}`);
  console.log(`Option   : ${formaterOption(premiereLigne)}`);
  console.log(`Version  : ${premiereLigne.code_version}`);
  console.log(`Annee    : ${premiereLigne.annee_reference}`);
  console.log(`Publiee  : ${formaterDate(premiereLigne.date_publication)}`);
  console.log(`Structure: ${premiereLigne.type_structure_evaluation}`);
  console.log(`Lignes   : ${lignes.length}`);
  console.log('');

  for (const ligne of lignes) {
    const ponderation = lirePonderation(ligne.ponderation);
    const libelleCours = `${ligne.cours_code} - ${ligne.cours_libelle}`;

    console.log(`${ligne.ordre_affichage}. ${libelleCours}`);
    console.log(`   Classification : ${formaterClassification(ligne)}`);
    console.log(`   Ponderation    : ${formaterPonderation(ponderation)}`);
    console.log(`   Statuts        : ${formaterFlags(ligne)}`);
  }

  console.log('');
  console.log('Controles');
  console.log('---------');
  console.log(`Version demandee        : ${argumentsVerification.codeVersion}`);
  console.log(`Cours dupliques         : ${doublons.length}`);
  console.log(`Ponderation totale      : ${calculerTotalProgramme(lignes)}`);

  if (doublons.length > 0) {
    console.log(`Details doublons        : ${doublons.join(', ')}`);
  }
}

function lireArgumentsVerificationProgramme(argumentsScript: readonly string[]): ArgumentsVerificationProgramme {
  const codeClasse = argumentsScript.find((argument) => !argument.startsWith('--'));
  const argumentVersion = argumentsScript.find((argument) => argument.startsWith('--version='));

  if (codeClasse === undefined || codeClasse.trim().length === 0) {
    throw new Error(
      [
        'Le code classe est obligatoire.',
        'Exemple : npm run verifier:programme-classe -- 1PR',
        'Exemple : npm run verifier:programme-classe -- 4ELEC --version=MINEDUC-2024-2025-V2',
      ].join('\n'),
    );
  }

  return {
    codeClasse: codeClasse.trim().toUpperCase(),
    codeVersion: argumentVersion?.replace('--version=', '').trim() || codeVersionParDefaut,
  };
}

function detecterDoublonsCours(lignes: readonly LigneProgrammeClassePostgres[]): string[] {
  const coursDejaVus = new Set<string>();
  const doublons = new Set<string>();

  for (const ligne of lignes) {
    if (coursDejaVus.has(ligne.cours_code)) {
      doublons.add(ligne.cours_code);
      continue;
    }

    coursDejaVus.add(ligne.cours_code);
  }

  return [...doublons].sort((premier, second) => premier.localeCompare(second, 'fr'));
}

function calculerTotalProgramme(lignes: readonly LigneProgrammeClassePostgres[]): number {
  return lignes.reduce((total, ligne) => total + calculerTotalPonderation(
    lirePonderation(ligne.ponderation),
  ), 0);
}

function lirePonderation(valeur: unknown): ProprietesPonderationEvaluation {
  const objet = typeof valeur === 'string'
    ? lireObjetJson(valeur)
    : lireObjet(valeur, 'ponderation');

  return {
    maxP1: lireNombre(objet.maxP1, 'ponderation.maxP1'),
    maxP2: lireNombre(objet.maxP2, 'ponderation.maxP2'),
    maxEX1: lireNombre(objet.maxEX1, 'ponderation.maxEX1'),
    maxP3: lireNombre(objet.maxP3, 'ponderation.maxP3'),
    maxP4: lireNombre(objet.maxP4, 'ponderation.maxP4'),
    maxEX2: lireNombre(objet.maxEX2, 'ponderation.maxEX2'),
    maxP5: lireNombre(objet.maxP5, 'ponderation.maxP5'),
    maxP6: lireNombre(objet.maxP6, 'ponderation.maxP6'),
    maxEX3: lireNombre(objet.maxEX3, 'ponderation.maxEX3'),
  };
}

function lireObjetJson(valeur: string): Record<string, unknown> {
  const donnees: unknown = JSON.parse(valeur);

  return lireObjet(donnees, 'ponderation');
}

function lireObjet(valeur: unknown, nomChamp: string): Record<string, unknown> {
  if (valeur === null || typeof valeur !== 'object' || Array.isArray(valeur)) {
    throw new Error(`Le champ ${nomChamp} doit etre un objet.`);
  }

  return valeur as Record<string, unknown>;
}

function lireNombre(valeur: unknown, nomChamp: string): number {
  if (typeof valeur !== 'number' || !Number.isFinite(valeur)) {
    throw new Error(`Le champ ${nomChamp} doit etre un nombre.`);
  }

  return valeur;
}

function formaterClassification(ligne: LigneProgrammeClassePostgres): string {
  if (ligne.domaine === null && ligne.sous_domaine === null) {
    return '-';
  }

  if (ligne.sous_domaine === null) {
    return ligne.domaine ?? '-';
  }

  return `${ligne.domaine ?? '-'} > ${ligne.sous_domaine}`;
}

function formaterOption(ligne: LigneProgrammeClassePostgres): string {
  if (ligne.option_code === null || ligne.option_libelle === null) {
    return '-';
  }

  return `${ligne.option_code} - ${ligne.option_libelle}`;
}

function formaterPonderation(ponderation: ProprietesPonderationEvaluation): string {
  const valeurs: readonly [string, number][] = [
    ['P1', ponderation.maxP1],
    ['P2', ponderation.maxP2],
    ['EX1', ponderation.maxEX1],
    ['P3', ponderation.maxP3],
    ['P4', ponderation.maxP4],
    ['EX2', ponderation.maxEX2],
    ['P5', ponderation.maxP5],
    ['P6', ponderation.maxP6],
    ['EX3', ponderation.maxEX3],
  ]
    .filter(([, valeur]) => valeur > 0)
    .map(([nom, valeur]) => `${nom}:${valeur}`);

  return `${valeurs.join(' ')} | Total:${calculerTotalPonderation(ponderation)}`;
}

function calculerTotalPonderation(ponderation: ProprietesPonderationEvaluation): number {
  return ponderation.maxP1
    + ponderation.maxP2
    + ponderation.maxEX1
    + ponderation.maxP3
    + ponderation.maxP4
    + ponderation.maxEX2
    + ponderation.maxP5
    + ponderation.maxP6
    + ponderation.maxEX3;
}

function formaterFlags(ligne: LigneProgrammeClassePostgres): string {
  return [
    `obl=${formaterBooleen(ligne.obligatoire)}`,
    `exam=${formaterBooleen(ligne.a_examen)}`,
    `calc=${formaterBooleen(ligne.est_calculable)}`,
  ].join(' ');
}

function formaterBooleen(valeur: boolean): 'oui' | 'non' {
  return valeur ? 'oui' : 'non';
}

function formaterDate(valeur: Date | string): string {
  if (valeur instanceof Date) {
    return valeur.toISOString().slice(0, 10);
  }

  return valeur.slice(0, 10);
}

void afficherProgrammeClasse().catch((erreur: unknown) => {
  if (erreur instanceof Error) {
    console.error(erreur.message);
    process.exitCode = 1;
    return;
  }

  console.error('Une erreur inconnue est survenue pendant la verification du programme.');
  process.exitCode = 1;
});
