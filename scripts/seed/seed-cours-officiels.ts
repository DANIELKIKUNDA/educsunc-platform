import { randomUUID } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import '../../backend/src/config/variables-environnement.config';
import { ReferentielCours } from '../../backend/src/contexts/referentiel-academique/domain/aggregates/ReferentielCours';
import { ReferentielCoursId } from '../../backend/src/contexts/referentiel-academique/domain/value-objects/ReferentielCoursId';
import { creerInfrastructurePostgresReferentielAcademique } from '../../backend/src/contexts/referentiel-academique/infrastructure/persistence/postgres';
import { DepotReferentielCoursPostgres } from '../../backend/src/contexts/referentiel-academique/infrastructure/persistence/postgres/depots/DepotReferentielCoursPostgres';

interface EnregistrementCoursOfficielSeed {
  code: string;
  libelle: string;
  abreviation?: string;
  domaine?: string;
  sousDomaine?: string;
}

interface DocumentCoursOfficielsSeed {
  cours: readonly EnregistrementCoursOfficielSeed[];
}

interface BilanSeedCoursOfficiels {
  crees: number;
  misAJour: number;
  inchanges: number;
}

const cheminScript = fileURLToPath(import.meta.url);
const racineProjet = resolve(dirname(cheminScript), '..', '..');
const cheminJsonCoursOfficiels = resolve(
  racineProjet,
  'docs/donnees-reference/referentiel-academique/cours/cours-officiels.v2.json',
);

// Cette fonction execute le seed CID des cours officiels issus des bulletins MINEDUC.
export async function executerSeedCoursOfficiels(): Promise<BilanSeedCoursOfficiels> {
  const documentSeed = chargerDocumentCoursOfficiels(cheminJsonCoursOfficiels);
  const infrastructure = creerInfrastructurePostgresReferentielAcademique();
  const depotReferentielCours = new DepotReferentielCoursPostgres(
    infrastructure.clientLecture,
    infrastructure.uniteDeTravail,
  );
  const bilan: BilanSeedCoursOfficiels = {
    crees: 0,
    misAJour: 0,
    inchanges: 0,
  };

  try {
    await infrastructure.migrateur.executerMigrationsEnAttente();

    await infrastructure.uniteDeTravail.executerDansTransaction(async () => {
      for (const coursSeed of documentSeed.cours) {
        const resultat = await sauvegarderCoursOfficiel(depotReferentielCours, coursSeed);

        bilan[resultat] += 1;
      }
    });

    return bilan;
  } finally {
    await infrastructure.pool.end();
  }
}

async function sauvegarderCoursOfficiel(
  depotReferentielCours: DepotReferentielCoursPostgres,
  coursSeed: EnregistrementCoursOfficielSeed,
): Promise<keyof BilanSeedCoursOfficiels> {
  const coursExistant = await depotReferentielCours.trouverParCode(coursSeed.code);

  if (coursExistant === null) {
    const nouveauCours = construireCoursOfficiel(
      new ReferentielCoursId(randomUUID()),
      coursSeed,
    );

    await depotReferentielCours.sauvegarder(nouveauCours);
    return 'crees';
  }

  if (estCoursDejaAligne(coursExistant, coursSeed)) {
    return 'inchanges';
  }

  const coursAligne = construireCoursOfficiel(
    coursExistant.obtenirId(),
    coursSeed,
    coursExistant,
  );

  await depotReferentielCours.sauvegarder(coursAligne);
  return 'misAJour';
}

function construireCoursOfficiel(
  idReferentielCours: ReferentielCoursId,
  coursSeed: EnregistrementCoursOfficielSeed,
  coursExistant?: ReferentielCours,
): ReferentielCours {
  return new ReferentielCours(
    idReferentielCours,
    coursSeed.code,
    coursSeed.libelle,
    coursSeed.abreviation,
    coursSeed.domaine,
    coursSeed.sousDomaine,
    coursExistant?.estActif() ?? true,
    coursExistant?.obtenirCreeLe() ?? new Date(),
    coursExistant?.obtenirModifieLe(),
    coursExistant?.obtenirVersion() ?? 1,
  );
}

function estCoursDejaAligne(
  coursExistant: ReferentielCours,
  coursSeed: EnregistrementCoursOfficielSeed,
): boolean {
  return coursExistant.obtenirLibelle() === coursSeed.libelle
    && coursExistant.obtenirAbreviation() === coursSeed.abreviation
    && coursExistant.obtenirDomaine() === coursSeed.domaine
    && coursExistant.obtenirSousDomaine() === coursSeed.sousDomaine;
}

function chargerDocumentCoursOfficiels(cheminJson: string): DocumentCoursOfficielsSeed {
  if (!existsSync(cheminJson)) {
    throw new Error(`Le fichier JSON des cours officiels est introuvable : ${cheminJson}`);
  }

  const contenu = readFileSync(cheminJson, 'utf8');
  const donnees: unknown = JSON.parse(contenu);

  return validerDocumentCoursOfficiels(donnees);
}

function validerDocumentCoursOfficiels(donnees: unknown): DocumentCoursOfficielsSeed {
  const objet = lireObjet(donnees, 'document cours officiels');
  const cours = objet.cours;

  if (!Array.isArray(cours) || cours.length === 0) {
    throw new Error('Le seed des cours officiels exige un tableau cours non vide.');
  }

  return {
    cours: cours.map((coursOfficiel, index) => validerCoursOfficielSeed(coursOfficiel, index)),
  };
}

function validerCoursOfficielSeed(
  donnees: unknown,
  index: number,
): EnregistrementCoursOfficielSeed {
  const objet = lireObjet(donnees, `cours[${index}]`);

  return {
    code: lireTexte(objet.code, `cours[${index}].code`),
    libelle: lireTexte(objet.libelle, `cours[${index}].libelle`),
    abreviation: lireTexteOptionnel(objet.abreviation, `cours[${index}].abreviation`),
    domaine: lireTexteOptionnel(objet.domaine, `cours[${index}].domaine`),
    sousDomaine: lireTexteOptionnel(objet.sousDomaine, `cours[${index}].sousDomaine`),
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
  if (valeur === undefined) {
    return undefined;
  }

  if (typeof valeur !== 'string') {
    throw new Error(`Le champ ${nomChamp} doit etre une chaine de caracteres si il est present.`);
  }

  const valeurNettoyee = valeur.trim();

  return valeurNettoyee.length === 0 ? undefined : valeurNettoyee;
}

if (process.argv[1] !== undefined && resolve(process.argv[1]) === cheminScript) {
  void executerSeedCoursOfficiels()
    .then((bilan) => {
      console.log('Seed des cours officiels termine.', bilan);
    })
    .catch((erreur: unknown) => {
      console.error('Echec du seed des cours officiels.', decrireErreur(erreur));
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
