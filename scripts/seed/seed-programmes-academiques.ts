import { randomUUID } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import '../../backend/src/config/variables-environnement.config';
import { ClasseAcademique } from '../../backend/src/contexts/referentiel-academique/domain/aggregates/ClasseAcademique';
import { ReferentielCours } from '../../backend/src/contexts/referentiel-academique/domain/aggregates/ReferentielCours';
import { ReferentielProgramme } from '../../backend/src/contexts/referentiel-academique/domain/aggregates/ReferentielProgramme';
import { VersionReferentielProgramme } from '../../backend/src/contexts/referentiel-academique/domain/aggregates/VersionReferentielProgramme';
import { LigneReferentielProgramme } from '../../backend/src/contexts/referentiel-academique/domain/entities/LigneReferentielProgramme';
import { LigneReferentielProgrammeId } from '../../backend/src/contexts/referentiel-academique/domain/value-objects/LigneReferentielProgrammeId';
import { PonderationEvaluation, ProprietesPonderationEvaluation } from '../../backend/src/contexts/referentiel-academique/domain/value-objects/PonderationEvaluation';
import { ReferentielProgrammeId } from '../../backend/src/contexts/referentiel-academique/domain/value-objects/ReferentielProgrammeId';
import { SourceLigneProgramme } from '../../backend/src/contexts/referentiel-academique/domain/value-objects/SourceLigneProgramme';
import { SourceReferentiel } from '../../backend/src/contexts/referentiel-academique/domain/value-objects/SourceReferentiel';
import { TypeStructureEvaluation } from '../../backend/src/contexts/referentiel-academique/domain/value-objects/TypeStructureEvaluation';
import { VersionReferentielProgrammeId } from '../../backend/src/contexts/referentiel-academique/domain/value-objects/VersionReferentielProgrammeId';
import { creerInfrastructurePostgresReferentielAcademique } from '../../backend/src/contexts/referentiel-academique/infrastructure/persistence/postgres';
import { DepotClasseAcademiquePostgres } from '../../backend/src/contexts/referentiel-academique/infrastructure/persistence/postgres/depots/DepotClasseAcademiquePostgres';
import { DepotReferentielCoursPostgres } from '../../backend/src/contexts/referentiel-academique/infrastructure/persistence/postgres/depots/DepotReferentielCoursPostgres';
import { DepotReferentielProgrammePostgres } from '../../backend/src/contexts/referentiel-academique/infrastructure/persistence/postgres/depots/DepotReferentielProgrammePostgres';

interface EnregistrementLigneProgrammeSeed {
  coursCode: string;
  ordreAffichage: number;
  obligatoire: boolean;
  aExamen: boolean;
  estCalculable: boolean;
  sourceLigne: SourceLigneProgramme;
  ponderation: ProprietesPonderationEvaluation;
  domaine?: string;
  sousDomaine?: string;
}

interface EnregistrementProgrammeAcademiqueSeed {
  classeCode: string;
  typeStructureEvaluation: TypeStructureEvaluation;
  versionReferentiel: string;
  anneeReference: string;
  datePublication: string;
  lignes: readonly EnregistrementLigneProgrammeSeed[];
}

interface DocumentProgrammesAcademiquesSeed {
  programmes: readonly EnregistrementProgrammeAcademiqueSeed[];
}

interface BilanSeedProgrammesAcademiques {
  referentielsCrees: number;
  versionsAjoutees: number;
  versionsReactivees: number;
  inchanges: number;
}

interface DependancesSeedProgrammesAcademiques {
  depotClasseAcademique: DepotClasseAcademiquePostgres;
  depotReferentielCours: DepotReferentielCoursPostgres;
  depotReferentielProgramme: DepotReferentielProgrammePostgres;
  coursParCode: Map<string, ReferentielCours>;
}

interface ProgrammePretAPersister {
  classeAcademique: ClasseAcademique;
  lignes: LigneReferentielProgramme[];
  seed: EnregistrementProgrammeAcademiqueSeed;
}

const cheminScript = fileURLToPath(import.meta.url);
const racineProjet = resolve(dirname(cheminScript), '..', '..');
const cheminJsonProgrammesAcademiques = resolve(
  racineProjet,
  'docs/donnees-reference/referentiel-academique/programmes/programmes-academiques.v2.json',
);

// Cette fonction execute le seed CID des programmes academiques officiels issus des bulletins.
export async function executerSeedProgrammesAcademiques(): Promise<BilanSeedProgrammesAcademiques> {
  const documentSeed = chargerDocumentProgrammesAcademiques(cheminJsonProgrammesAcademiques);
  const infrastructure = creerInfrastructurePostgresReferentielAcademique();
  const dependances: DependancesSeedProgrammesAcademiques = {
    depotClasseAcademique: new DepotClasseAcademiquePostgres(
      infrastructure.clientLecture,
      infrastructure.uniteDeTravail,
    ),
    depotReferentielCours: new DepotReferentielCoursPostgres(
      infrastructure.clientLecture,
      infrastructure.uniteDeTravail,
    ),
    depotReferentielProgramme: new DepotReferentielProgrammePostgres(
      infrastructure.clientLecture,
      infrastructure.uniteDeTravail,
    ),
    coursParCode: new Map<string, ReferentielCours>(),
  };
  const bilan: BilanSeedProgrammesAcademiques = {
    referentielsCrees: 0,
    versionsAjoutees: 0,
    versionsReactivees: 0,
    inchanges: 0,
  };

  try {
    await infrastructure.migrateur.executerMigrationsEnAttente();

    await infrastructure.uniteDeTravail.executerDansTransaction(async () => {
      for (const programmeSeed of documentSeed.programmes) {
        const resultat = await sauvegarderProgrammeAcademique(dependances, programmeSeed);

        bilan[resultat] += 1;
      }
    });

    return bilan;
  } finally {
    await infrastructure.pool.end();
  }
}

async function sauvegarderProgrammeAcademique(
  dependances: DependancesSeedProgrammesAcademiques,
  programmeSeed: EnregistrementProgrammeAcademiqueSeed,
): Promise<keyof BilanSeedProgrammesAcademiques> {
  const programmePret = await preparerProgrammeAPersister(dependances, programmeSeed);
  const referentielExistant = await dependances.depotReferentielProgramme.trouverParClasseAcademique(
    programmePret.classeAcademique.obtenirId(),
  );

  if (referentielExistant === null) {
    const nouveauReferentiel = new ReferentielProgramme(
      new ReferentielProgrammeId(randomUUID()),
      programmePret.classeAcademique.obtenirId(),
      programmePret.seed.typeStructureEvaluation,
      false,
    );

    nouveauReferentiel.ajouterVersion(construireVersionReferentielProgramme(programmePret));
    await dependances.depotReferentielProgramme.sauvegarder(nouveauReferentiel);
    return 'referentielsCrees';
  }

  const versionExistante = referentielExistant.trouverVersionParCode(
    programmePret.seed.versionReferentiel,
  );

  if (versionExistante === null) {
    referentielExistant.ajouterVersion(construireVersionReferentielProgramme(programmePret));
    await dependances.depotReferentielProgramme.sauvegarder(referentielExistant);
    return 'versionsAjoutees';
  }

  if (!estVersionDejaAlignee(versionExistante, programmePret)) {
    throw new Error(
      [
        'Le programme officiel existe deja avec un contenu different.',
        `classe=${programmePret.seed.classeCode}`,
        `version=${programmePret.seed.versionReferentiel}`,
      ].join(' '),
    );
  }

  if (!versionExistante.estActive()) {
    referentielExistant.activerVersion(versionExistante.obtenirId());
    await dependances.depotReferentielProgramme.sauvegarder(referentielExistant);
    return 'versionsReactivees';
  }

  return 'inchanges';
}

async function preparerProgrammeAPersister(
  dependances: DependancesSeedProgrammesAcademiques,
  programmeSeed: EnregistrementProgrammeAcademiqueSeed,
): Promise<ProgrammePretAPersister> {
  const classeAcademique = await dependances.depotClasseAcademique.trouverParCode(
    programmeSeed.classeCode,
  );

  if (classeAcademique === null) {
    throw new Error(
      `La classe ${programmeSeed.classeCode} referencee par un programme est introuvable.`,
    );
  }

  if (classeAcademique.obtenirTypeStructureEvaluation() !== programmeSeed.typeStructureEvaluation) {
    throw new Error(
      [
        'Le type de structure du programme ne correspond pas a la classe academique.',
        `classe=${programmeSeed.classeCode}`,
        `attendu=${classeAcademique.obtenirTypeStructureEvaluation()}`,
        `recu=${programmeSeed.typeStructureEvaluation}`,
      ].join(' '),
    );
  }

  const lignes: LigneReferentielProgramme[] = [];

  for (const ligneSeed of programmeSeed.lignes) {
    lignes.push(await construireLigneProgramme(dependances, ligneSeed));
  }

  return {
    classeAcademique,
    lignes,
    seed: programmeSeed,
  };
}

async function construireLigneProgramme(
  dependances: DependancesSeedProgrammesAcademiques,
  ligneSeed: EnregistrementLigneProgrammeSeed,
): Promise<LigneReferentielProgramme> {
  const referentielCours = await trouverCoursOfficiel(dependances, ligneSeed.coursCode);

  return new LigneReferentielProgramme(
    new LigneReferentielProgrammeId(randomUUID()),
    referentielCours.obtenirId(),
    ligneSeed.ordreAffichage,
    ligneSeed.obligatoire,
    ligneSeed.aExamen,
    ligneSeed.estCalculable,
    ligneSeed.sourceLigne,
    new PonderationEvaluation(ligneSeed.ponderation),
    ligneSeed.domaine,
    ligneSeed.sousDomaine,
  );
}

async function trouverCoursOfficiel(
  dependances: DependancesSeedProgrammesAcademiques,
  coursCode: string,
): Promise<ReferentielCours> {
  const coursEnCache = dependances.coursParCode.get(coursCode);

  if (coursEnCache !== undefined) {
    return coursEnCache;
  }

  const referentielCours = await dependances.depotReferentielCours.trouverParCode(coursCode);

  if (referentielCours === null) {
    throw new Error(`Le cours officiel ${coursCode} reference par un programme est introuvable.`);
  }

  dependances.coursParCode.set(coursCode, referentielCours);
  return referentielCours;
}

function construireVersionReferentielProgramme(
  programmePret: ProgrammePretAPersister,
): VersionReferentielProgramme {
  return new VersionReferentielProgramme(
    new VersionReferentielProgrammeId(randomUUID()),
    programmePret.seed.versionReferentiel,
    programmePret.seed.anneeReference,
    convertirDatePublication(programmePret.seed.datePublication),
    SourceReferentiel.JSON_OFFICIEL,
    undefined,
    true,
    new Date(),
    programmePret.lignes,
    true,
  );
}

function estVersionDejaAlignee(
  versionExistante: VersionReferentielProgramme,
  programmePret: ProgrammePretAPersister,
): boolean {
  return versionExistante.estPubliee()
    && versionExistante.obtenirCodeVersion() === programmePret.seed.versionReferentiel
    && versionExistante.obtenirAnneeReference() === programmePret.seed.anneeReference
    && formaterDateIso(versionExistante.obtenirDatePublication()) === programmePret.seed.datePublication
    && versionExistante.obtenirSourceImport() === SourceReferentiel.JSON_OFFICIEL
    && lignesProgrammeEquivalentes(versionExistante.obtenirLignes(), programmePret.lignes);
}

function lignesProgrammeEquivalentes(
  lignesExistantes: readonly LigneReferentielProgramme[],
  lignesAttendues: readonly LigneReferentielProgramme[],
): boolean {
  if (lignesExistantes.length !== lignesAttendues.length) {
    return false;
  }

  const lignesExistantesTriees = trierLignesParOrdre(lignesExistantes);
  const lignesAttenduesTriees = trierLignesParOrdre(lignesAttendues);

  return lignesAttenduesTriees.every((ligneAttendue, index) => {
    const ligneExistante = lignesExistantesTriees[index];

    if (ligneExistante === undefined) {
      return false;
    }

    return ligneExistante.obtenirReferentielCoursId().estEgal(
      ligneAttendue.obtenirReferentielCoursId(),
    )
      && ligneExistante.obtenirOrdreAffichage() === ligneAttendue.obtenirOrdreAffichage()
      && ligneExistante.estObligatoire() === ligneAttendue.estObligatoire()
      && ligneExistante.aExamenAssocie() === ligneAttendue.aExamenAssocie()
      && ligneExistante.estCalculableDansProgramme() === ligneAttendue.estCalculableDansProgramme()
      && ligneExistante.obtenirSourceLigne() === ligneAttendue.obtenirSourceLigne()
      && ligneExistante.obtenirPonderation().estEgal(ligneAttendue.obtenirPonderation())
      && ligneExistante.obtenirDomaine() === ligneAttendue.obtenirDomaine()
      && ligneExistante.obtenirSousDomaine() === ligneAttendue.obtenirSousDomaine();
  });
}

function trierLignesParOrdre(
  lignes: readonly LigneReferentielProgramme[],
): LigneReferentielProgramme[] {
  return [...lignes].sort((premiereLigne, deuxiemeLigne) =>
    premiereLigne.obtenirOrdreAffichage() - deuxiemeLigne.obtenirOrdreAffichage());
}

function chargerDocumentProgrammesAcademiques(
  cheminJson: string,
): DocumentProgrammesAcademiquesSeed {
  if (!existsSync(cheminJson)) {
    throw new Error(`Le fichier JSON des programmes academiques est introuvable : ${cheminJson}`);
  }

  const contenu = readFileSync(cheminJson, 'utf8');
  const donnees: unknown = JSON.parse(contenu);

  return validerDocumentProgrammesAcademiques(donnees);
}

function validerDocumentProgrammesAcademiques(
  donnees: unknown,
): DocumentProgrammesAcademiquesSeed {
  const objet = lireObjet(donnees, 'document programmes academiques');
  const programmes = objet.programmes;

  if (!Array.isArray(programmes) || programmes.length === 0) {
    throw new Error('Le seed des programmes exige un tableau programmes non vide.');
  }

  return {
    programmes: programmes.map((programme, index) => validerProgrammeAcademiqueSeed(
      programme,
      index,
    )),
  };
}

function validerProgrammeAcademiqueSeed(
  donnees: unknown,
  index: number,
): EnregistrementProgrammeAcademiqueSeed {
  const objet = lireObjet(donnees, `programmes[${index}]`);
  const lignes = objet.lignes;

  if (!Array.isArray(lignes) || lignes.length === 0) {
    throw new Error(`Le programme programmes[${index}] doit contenir des lignes non vides.`);
  }

  return {
    classeCode: lireTexte(objet.classeCode, `programmes[${index}].classeCode`),
    typeStructureEvaluation: lireTypeStructureEvaluation(
      objet.typeStructureEvaluation,
      `programmes[${index}].typeStructureEvaluation`,
    ),
    versionReferentiel: lireTexte(
      objet.versionReferentiel,
      `programmes[${index}].versionReferentiel`,
    ),
    anneeReference: lireTexte(objet.anneeReference, `programmes[${index}].anneeReference`),
    datePublication: lireDateIso(objet.datePublication, `programmes[${index}].datePublication`),
    lignes: lignes.map((ligne, indexLigne) =>
      validerLigneProgrammeSeed(ligne, index, indexLigne)),
  };
}

function validerLigneProgrammeSeed(
  donnees: unknown,
  indexProgramme: number,
  indexLigne: number,
): EnregistrementLigneProgrammeSeed {
  const objet = lireObjet(donnees, `programmes[${indexProgramme}].lignes[${indexLigne}]`);

  return {
    coursCode: lireTexte(
      objet.coursCode,
      `programmes[${indexProgramme}].lignes[${indexLigne}].coursCode`,
    ),
    ordreAffichage: lireEntierPositif(
      objet.ordreAffichage,
      `programmes[${indexProgramme}].lignes[${indexLigne}].ordreAffichage`,
    ),
    obligatoire: lireBooleen(
      objet.obligatoire,
      `programmes[${indexProgramme}].lignes[${indexLigne}].obligatoire`,
    ),
    aExamen: lireBooleen(
      objet.aExamen,
      `programmes[${indexProgramme}].lignes[${indexLigne}].aExamen`,
    ),
    estCalculable: lireBooleen(
      objet.estCalculable,
      `programmes[${indexProgramme}].lignes[${indexLigne}].estCalculable`,
    ),
    sourceLigne: lireSourceLigneProgramme(
      objet.sourceLigne,
      `programmes[${indexProgramme}].lignes[${indexLigne}].sourceLigne`,
    ),
    ponderation: lirePonderation(
      objet.ponderation,
      `programmes[${indexProgramme}].lignes[${indexLigne}].ponderation`,
    ),
    domaine: lireTexteOptionnel(
      objet.domaine,
      `programmes[${indexProgramme}].lignes[${indexLigne}].domaine`,
    ),
    sousDomaine: lireTexteOptionnel(
      objet.sousDomaine,
      `programmes[${indexProgramme}].lignes[${indexLigne}].sousDomaine`,
    ),
  };
}

function lirePonderation(
  valeur: unknown,
  nomChamp: string,
): ProprietesPonderationEvaluation {
  const objet = lireObjet(valeur, nomChamp);

  return {
    maxP1: lireEntierNaturel(objet.maxP1, `${nomChamp}.maxP1`),
    maxP2: lireEntierNaturel(objet.maxP2, `${nomChamp}.maxP2`),
    maxEX1: lireEntierNaturel(objet.maxEX1, `${nomChamp}.maxEX1`),
    maxP3: lireEntierNaturel(objet.maxP3, `${nomChamp}.maxP3`),
    maxP4: lireEntierNaturel(objet.maxP4, `${nomChamp}.maxP4`),
    maxEX2: lireEntierNaturel(objet.maxEX2, `${nomChamp}.maxEX2`),
    maxP5: lireEntierNaturel(objet.maxP5, `${nomChamp}.maxP5`),
    maxP6: lireEntierNaturel(objet.maxP6, `${nomChamp}.maxP6`),
    maxEX3: lireEntierNaturel(objet.maxEX3, `${nomChamp}.maxEX3`),
  };
}

function lireObjet(donnees: unknown, contexte: string): Record<string, unknown> {
  if (donnees === null || typeof donnees !== 'object' || Array.isArray(donnees)) {
    throw new Error(`La source ${contexte} doit etre un objet JSON.`);
  }

  return donnees as Record<string, unknown>;
}

function lireTexte(valeur: unknown, nomChamp: string): string {
  if (typeof valeur !== 'string') {
    throw new Error(`Le champ ${nomChamp} doit etre une chaine de caracteres.`);
  }

  const valeurNettoyee = valeur.trim();

  if (valeurNettoyee.length === 0) {
    throw new Error(`Le champ ${nomChamp} est obligatoire.`);
  }

  return valeurNettoyee;
}

function lireTexteOptionnel(valeur: unknown, nomChamp: string): string | undefined {
  if (valeur === undefined || valeur === null) {
    return undefined;
  }

  if (typeof valeur !== 'string') {
    throw new Error(`Le champ ${nomChamp} doit etre une chaine de caracteres si il est present.`);
  }

  const valeurNettoyee = valeur.trim();

  return valeurNettoyee.length === 0 ? undefined : valeurNettoyee;
}

function lireDateIso(valeur: unknown, nomChamp: string): string {
  const valeurTexte = lireTexte(valeur, nomChamp);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(valeurTexte)) {
    throw new Error(`Le champ ${nomChamp} doit etre une date ISO au format YYYY-MM-DD.`);
  }

  convertirDatePublication(valeurTexte);
  return valeurTexte;
}

function lireEntierPositif(valeur: unknown, nomChamp: string): number {
  if (!Number.isInteger(valeur) || typeof valeur !== 'number' || valeur <= 0) {
    throw new Error(`Le champ ${nomChamp} doit etre un entier strictement positif.`);
  }

  return valeur;
}

function lireEntierNaturel(valeur: unknown, nomChamp: string): number {
  if (!Number.isInteger(valeur) || typeof valeur !== 'number' || valeur < 0) {
    throw new Error(`Le champ ${nomChamp} doit etre un entier positif ou nul.`);
  }

  return valeur;
}

function lireBooleen(valeur: unknown, nomChamp: string): boolean {
  if (typeof valeur !== 'boolean') {
    throw new Error(`Le champ ${nomChamp} doit etre un booleen.`);
  }

  return valeur;
}

function lireSourceLigneProgramme(
  valeur: unknown,
  nomChamp: string,
): SourceLigneProgramme {
  if (!Object.values(SourceLigneProgramme).includes(valeur as SourceLigneProgramme)) {
    throw new Error(`Le champ ${nomChamp} doit etre une source de ligne valide.`);
  }

  return valeur as SourceLigneProgramme;
}

function lireTypeStructureEvaluation(
  valeur: unknown,
  nomChamp: string,
): TypeStructureEvaluation {
  if (!Object.values(TypeStructureEvaluation).includes(valeur as TypeStructureEvaluation)) {
    throw new Error(`Le champ ${nomChamp} doit etre un type de structure d'evaluation valide.`);
  }

  return valeur as TypeStructureEvaluation;
}

function convertirDatePublication(datePublication: string): Date {
  const date = new Date(`${datePublication}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    throw new Error(`La date de publication ${datePublication} est invalide.`);
  }

  return date;
}

function formaterDateIso(date: Date): string {
  const annee = date.getFullYear();
  const mois = String(date.getMonth() + 1).padStart(2, '0');
  const jour = String(date.getDate()).padStart(2, '0');

  return `${annee}-${mois}-${jour}`;
}

if (process.argv[1] !== undefined && resolve(process.argv[1]) === cheminScript) {
  void executerSeedProgrammesAcademiques()
    .then((bilan) => {
      console.log('Seed des programmes academiques termine.', bilan);
    })
    .catch((erreur: unknown) => {
      console.error('Echec du seed des programmes academiques.', decrireErreur(erreur));
      process.exitCode = 1;
    });
}

function decrireErreur(erreur: unknown): Record<string, unknown> {
  if (erreur instanceof Error) {
    const erreurAvecMetadata = erreur as Error & { metadata?: unknown; code?: string };

    return {
      nom: erreur.name,
      message: erreur.message,
      code: erreurAvecMetadata.code,
      metadata: erreurAvecMetadata.metadata,
      stack: erreur.stack,
    };
  }

  return {
    valeur: erreur,
  };
}
