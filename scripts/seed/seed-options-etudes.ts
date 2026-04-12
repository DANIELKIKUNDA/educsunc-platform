import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import '../../backend/src/config/variables-environnement.config';
import { OptionEtude } from '../../backend/src/contexts/referentiel-academique/domain/aggregates/OptionEtude';
import { CodeOption } from '../../backend/src/contexts/referentiel-academique/domain/value-objects/CodeOption';
import { OptionEtudeId } from '../../backend/src/contexts/referentiel-academique/domain/value-objects/OptionEtudeId';
import { creerInfrastructurePostgresReferentielAcademique } from '../../backend/src/contexts/referentiel-academique/infrastructure/persistence/postgres';
import { DepotOptionEtudePostgres } from '../../backend/src/contexts/referentiel-academique/infrastructure/persistence/postgres/depots/DepotOptionEtudePostgres';

interface EnregistrementOptionEtudeSeed {
  code: number;
  libelle: string;
  abreviation: string;
  ordreAffichage: number;
}

interface DocumentOptionsEtudesSeed {
  options: readonly EnregistrementOptionEtudeSeed[];
  importePar: string;
}

interface BilanSeedOptionsEtudes {
  creees: number;
  misesAJour: number;
  inchangees: number;
}

const cheminScript = fileURLToPath(import.meta.url);
const racineProjet = resolve(dirname(cheminScript), '..', '..');
const cheminJsonOptionsEtudes = resolve(
  racineProjet,
  'docs/donnees-reference/referentiel-academique/options/options-etudes.v1.json',
);

// Cette fonction execute le seed CID des options d'etudes du referentiel academique.
export async function executerSeedOptionsEtudes(): Promise<BilanSeedOptionsEtudes> {
  const documentSeed = chargerDocumentOptionsEtudes(cheminJsonOptionsEtudes);
  const infrastructure = creerInfrastructurePostgresReferentielAcademique();
  const depotOptionEtude = new DepotOptionEtudePostgres(
    infrastructure.clientLecture,
    infrastructure.uniteDeTravail,
  );
  const bilan: BilanSeedOptionsEtudes = {
    creees: 0,
    misesAJour: 0,
    inchangees: 0,
  };

  try {
    await infrastructure.migrateur.executerMigrationsEnAttente();

    for (const optionSeed of documentSeed.options) {
      const resultat = await sauvegarderOptionEtude(depotOptionEtude, optionSeed);

      bilan[resultat] += 1;
    }

    return bilan;
  } finally {
    await infrastructure.pool.end();
  }
}

async function sauvegarderOptionEtude(
  depotOptionEtude: DepotOptionEtudePostgres,
  optionSeed: EnregistrementOptionEtudeSeed,
): Promise<keyof BilanSeedOptionsEtudes> {
  const optionExistante = await depotOptionEtude.trouverParCode(optionSeed.code);

  if (optionExistante === null) {
    const nouvelleOption = new OptionEtude(
      new OptionEtudeId(randomUUID()),
      new CodeOption(optionSeed.code),
      optionSeed.libelle,
      undefined,
      optionSeed.ordreAffichage,
      optionSeed.abreviation,
    );

    await depotOptionEtude.sauvegarder(nouvelleOption);
    return 'creees';
  }

  if (estOptionDejaAlignee(optionExistante, optionSeed)) {
    return 'inchangees';
  }

  const optionAlignee = new OptionEtude(
    optionExistante.obtenirId(),
    new CodeOption(optionSeed.code),
    optionSeed.libelle,
    undefined,
    optionSeed.ordreAffichage,
    optionSeed.abreviation,
    optionExistante.estActive(),
    optionExistante.obtenirCreeLe(),
    optionExistante.obtenirModifieLe(),
    optionExistante.obtenirVersion(),
  );

  await depotOptionEtude.sauvegarder(optionAlignee);
  return 'misesAJour';
}

function estOptionDejaAlignee(
  optionExistante: OptionEtude,
  optionSeed: EnregistrementOptionEtudeSeed,
): boolean {
  return optionExistante.obtenirLibelle() === optionSeed.libelle
    && optionExistante.obtenirTypeOption() === undefined
    && optionExistante.obtenirAbreviation() === optionSeed.abreviation
    && optionExistante.obtenirOrdreAffichage() === optionSeed.ordreAffichage;
}

function chargerDocumentOptionsEtudes(cheminJson: string): DocumentOptionsEtudesSeed {
  if (!existsSync(cheminJson)) {
    throw new Error(`Le fichier JSON des options d'etudes est introuvable : ${cheminJson}`);
  }

  const contenu = readFileSync(cheminJson, 'utf8');
  const donnees: unknown = JSON.parse(contenu);

  return validerDocumentOptionsEtudes(donnees);
}

function validerDocumentOptionsEtudes(donnees: unknown): DocumentOptionsEtudesSeed {
  const objet = lireObjet(donnees, 'document options etudes');
  const options = objet.options;
  const importePar = lireTexte(objet.importePar, 'importePar');

  if (!Array.isArray(options) || options.length === 0) {
    throw new Error('Le seed des options exige un tableau options non vide.');
  }

  return {
    options: options.map((option, index) => validerOptionEtudeSeed(option, index)),
    importePar,
  };
}

function validerOptionEtudeSeed(
  donnees: unknown,
  index: number,
): EnregistrementOptionEtudeSeed {
  const objet = lireObjet(donnees, `options[${index}]`);

  verifierChampAbsent(objet, 'typeOption', index);
  verifierChampAbsent(objet, 'sectionCode', index);

  return {
    code: lireEntierPositif(objet.code, `options[${index}].code`),
    libelle: lireTexte(objet.libelle, `options[${index}].libelle`),
    abreviation: lireTexte(objet.abreviation, `options[${index}].abreviation`),
    ordreAffichage: lireEntierPositif(
      objet.ordreAffichage,
      `options[${index}].ordreAffichage`,
    ),
  };
}

function verifierChampAbsent(
  donnees: Record<string, unknown>,
  nomChamp: string,
  index: number,
): void {
  if (donnees[nomChamp] !== undefined) {
    throw new Error(`Le champ ${nomChamp} ne doit plus etre present dans options[${index}].`);
  }
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

function lireEntierPositif(valeur: unknown, nomChamp: string): number {
  if (!Number.isInteger(valeur) || typeof valeur !== 'number' || valeur <= 0) {
    throw new Error(`Le champ ${nomChamp} doit etre un entier strictement positif.`);
  }

  return valeur;
}

if (process.argv[1] !== undefined && resolve(process.argv[1]) === cheminScript) {
  void executerSeedOptionsEtudes()
    .then((bilan) => {
      console.log('Seed des options d etudes termine.', bilan);
    })
    .catch((erreur: unknown) => {
      console.error('Echec du seed des options d etudes.', decrireErreur(erreur));
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
