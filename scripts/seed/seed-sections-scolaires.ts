import { randomUUID } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import '../../backend/src/config/variables-environnement.config';
import { SectionScolaire } from '../../backend/src/contexts/referentiel-academique/domain/aggregates/SectionScolaire';
import { SectionScolaireId } from '../../backend/src/contexts/referentiel-academique/domain/value-objects/SectionScolaireId';
import { creerInfrastructurePostgresReferentielAcademique } from '../../backend/src/contexts/referentiel-academique/infrastructure/persistence/postgres';
import { DepotSectionScolairePostgres } from '../../backend/src/contexts/referentiel-academique/infrastructure/persistence/postgres/depots/DepotSectionScolairePostgres';

interface EnregistrementSectionScolaireSeed {
  code: string;
  libelle: string;
  ordreAffichage: number;
}

interface DocumentSectionsScolairesSeed {
  sections: readonly EnregistrementSectionScolaireSeed[];
  importePar: string;
}

interface BilanSeedSectionsScolaires {
  creees: number;
  misesAJour: number;
  inchangees: number;
}

const cheminScript = fileURLToPath(import.meta.url);
const racineProjet = resolve(dirname(cheminScript), '..', '..');
const cheminJsonSectionsScolaires = resolve(
  racineProjet,
  'docs/donnees-reference/referentiel-academique/sections/sections-scolaires.v1.json',
);

// Cette fonction execute le seed CID des sections scolaires du referentiel academique.
export async function executerSeedSectionsScolaires(): Promise<BilanSeedSectionsScolaires> {
  const documentSeed = chargerDocumentSectionsScolaires(cheminJsonSectionsScolaires);
  const infrastructure = creerInfrastructurePostgresReferentielAcademique();
  const depotSectionScolaire = new DepotSectionScolairePostgres(
    infrastructure.clientLecture,
    infrastructure.uniteDeTravail,
  );
  const bilan: BilanSeedSectionsScolaires = {
    creees: 0,
    misesAJour: 0,
    inchangees: 0,
  };

  try {
    await infrastructure.migrateur.executerMigrationsEnAttente();

    for (const sectionSeed of documentSeed.sections) {
      const resultat = await sauvegarderSectionScolaire(depotSectionScolaire, sectionSeed);

      bilan[resultat] += 1;
    }

    return bilan;
  } finally {
    await infrastructure.pool.end();
  }
}

async function sauvegarderSectionScolaire(
  depotSectionScolaire: DepotSectionScolairePostgres,
  sectionSeed: EnregistrementSectionScolaireSeed,
): Promise<keyof BilanSeedSectionsScolaires> {
  const sectionExistante = await depotSectionScolaire.trouverParCode(sectionSeed.code);

  if (sectionExistante === null) {
    const nouvelleSection = new SectionScolaire(
      new SectionScolaireId(randomUUID()),
      sectionSeed.code,
      sectionSeed.libelle,
      sectionSeed.ordreAffichage,
    );

    await depotSectionScolaire.sauvegarder(nouvelleSection);
    return 'creees';
  }

  if (estSectionDejaAlignee(sectionExistante, sectionSeed)) {
    return 'inchangees';
  }

  const sectionAlignee = new SectionScolaire(
    sectionExistante.obtenirId(),
    sectionSeed.code,
    sectionSeed.libelle,
    sectionSeed.ordreAffichage,
    sectionExistante.estActive(),
    sectionExistante.obtenirCreeLe(),
    sectionExistante.obtenirModifieLe(),
    sectionExistante.obtenirVersion(),
  );

  await depotSectionScolaire.sauvegarder(sectionAlignee);
  return 'misesAJour';
}

function estSectionDejaAlignee(
  sectionExistante: SectionScolaire,
  sectionSeed: EnregistrementSectionScolaireSeed,
): boolean {
  return sectionExistante.obtenirLibelle() === sectionSeed.libelle
    && sectionExistante.obtenirOrdreAffichage() === sectionSeed.ordreAffichage;
}

function chargerDocumentSectionsScolaires(cheminJson: string): DocumentSectionsScolairesSeed {
  if (!existsSync(cheminJson)) {
    throw new Error(`Le fichier JSON des sections scolaires est introuvable : ${cheminJson}`);
  }

  const contenu = readFileSync(cheminJson, 'utf8');
  const donnees: unknown = JSON.parse(contenu);

  return validerDocumentSectionsScolaires(donnees);
}

function validerDocumentSectionsScolaires(donnees: unknown): DocumentSectionsScolairesSeed {
  const objet = lireObjet(donnees, 'document sections scolaires');
  const sections = objet.sections;
  const importePar = lireTexte(objet.importePar, 'importePar');

  if (!Array.isArray(sections) || sections.length === 0) {
    throw new Error('Le seed des sections exige un tableau sections non vide.');
  }

  return {
    sections: sections.map((section, index) => validerSectionScolaireSeed(section, index)),
    importePar,
  };
}

function validerSectionScolaireSeed(
  donnees: unknown,
  index: number,
): EnregistrementSectionScolaireSeed {
  const objet = lireObjet(donnees, `sections[${index}]`);

  return {
    code: lireTexte(objet.code, `sections[${index}].code`),
    libelle: lireTexte(objet.libelle, `sections[${index}].libelle`),
    ordreAffichage: lireEntierPositif(
      objet.ordreAffichage,
      `sections[${index}].ordreAffichage`,
    ),
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

function lireEntierPositif(valeur: unknown, nomChamp: string): number {
  if (!Number.isInteger(valeur) || typeof valeur !== 'number' || valeur <= 0) {
    throw new Error(`Le champ ${nomChamp} doit etre un entier strictement positif.`);
  }

  return valeur;
}

if (process.argv[1] !== undefined && resolve(process.argv[1]) === cheminScript) {
  void executerSeedSectionsScolaires()
    .then((bilan) => {
      console.log('Seed des sections scolaires termine.', bilan);
    })
    .catch((erreur: unknown) => {
      console.error('Echec du seed des sections scolaires.', decrireErreur(erreur));
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
