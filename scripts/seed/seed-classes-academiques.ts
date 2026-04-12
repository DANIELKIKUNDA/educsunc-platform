import { randomUUID } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import '../../backend/src/config/variables-environnement.config';
import { ClasseAcademique } from '../../backend/src/contexts/referentiel-academique/domain/aggregates/ClasseAcademique';
import { OptionEtude } from '../../backend/src/contexts/referentiel-academique/domain/aggregates/OptionEtude';
import { SectionScolaire } from '../../backend/src/contexts/referentiel-academique/domain/aggregates/SectionScolaire';
import { ClasseAcademiqueId } from '../../backend/src/contexts/referentiel-academique/domain/value-objects/ClasseAcademiqueId';
import { OrdreClasse } from '../../backend/src/contexts/referentiel-academique/domain/value-objects/OrdreClasse';
import { TypeStructureEvaluation } from '../../backend/src/contexts/referentiel-academique/domain/value-objects/TypeStructureEvaluation';
import { creerInfrastructurePostgresReferentielAcademique } from '../../backend/src/contexts/referentiel-academique/infrastructure/persistence/postgres';
import { DepotClasseAcademiquePostgres } from '../../backend/src/contexts/referentiel-academique/infrastructure/persistence/postgres/depots/DepotClasseAcademiquePostgres';
import { DepotOptionEtudePostgres } from '../../backend/src/contexts/referentiel-academique/infrastructure/persistence/postgres/depots/DepotOptionEtudePostgres';
import { DepotSectionScolairePostgres } from '../../backend/src/contexts/referentiel-academique/infrastructure/persistence/postgres/depots/DepotSectionScolairePostgres';

interface EnregistrementClasseAcademiqueSeed {
  code: string;
  libelle: string;
  sectionCode: string;
  optionCode: number | null;
  ordrePedagogique: number;
  cycle: string;
  accepteOptions: boolean;
  optionObligatoire: boolean;
  typeStructureEvaluation: TypeStructureEvaluation;
}

interface DocumentClassesAcademiquesSeed {
  classesAcademiques: readonly EnregistrementClasseAcademiqueSeed[];
  importePar: string;
}

interface BilanSeedClassesAcademiques {
  creees: number;
  misesAJour: number;
  inchangees: number;
}

interface DependancesSeedClassesAcademiques {
  depotClasseAcademique: DepotClasseAcademiquePostgres;
  depotSectionScolaire: DepotSectionScolairePostgres;
  depotOptionEtude: DepotOptionEtudePostgres;
}

interface ReferencesClasseAcademique {
  sectionScolaire: SectionScolaire;
  optionEtude?: OptionEtude;
}

const cheminScript = fileURLToPath(import.meta.url);
const racineProjet = resolve(dirname(cheminScript), '..', '..');
const cheminJsonClassesAcademiques = resolve(
  racineProjet,
  'docs/donnees-reference/referentiel-academique/classes/classes-academiques.v1.json',
);

// Cette fonction execute le seed CID des classes academiques du referentiel.
export async function executerSeedClassesAcademiques(): Promise<BilanSeedClassesAcademiques> {
  const documentSeed = chargerDocumentClassesAcademiques(cheminJsonClassesAcademiques);
  const infrastructure = creerInfrastructurePostgresReferentielAcademique();
  const dependances: DependancesSeedClassesAcademiques = {
    depotClasseAcademique: new DepotClasseAcademiquePostgres(
      infrastructure.clientLecture,
      infrastructure.uniteDeTravail,
    ),
    depotSectionScolaire: new DepotSectionScolairePostgres(
      infrastructure.clientLecture,
      infrastructure.uniteDeTravail,
    ),
    depotOptionEtude: new DepotOptionEtudePostgres(
      infrastructure.clientLecture,
      infrastructure.uniteDeTravail,
    ),
  };
  const bilan: BilanSeedClassesAcademiques = {
    creees: 0,
    misesAJour: 0,
    inchangees: 0,
  };

  try {
    await infrastructure.migrateur.executerMigrationsEnAttente();

    for (const classeSeed of documentSeed.classesAcademiques) {
      const resultat = await sauvegarderClasseAcademique(dependances, classeSeed);

      bilan[resultat] += 1;
    }

    return bilan;
  } finally {
    await infrastructure.pool.end();
  }
}

async function sauvegarderClasseAcademique(
  dependances: DependancesSeedClassesAcademiques,
  classeSeed: EnregistrementClasseAcademiqueSeed,
): Promise<keyof BilanSeedClassesAcademiques> {
  const references = await resoudreReferencesClasseAcademique(dependances, classeSeed);
  const classeExistante = await dependances.depotClasseAcademique.trouverParCode(
    classeSeed.code,
  );

  if (classeExistante === null) {
    const nouvelleClasse = construireClasseAcademique(
      new ClasseAcademiqueId(randomUUID()),
      classeSeed,
      references,
    );

    await dependances.depotClasseAcademique.sauvegarder(nouvelleClasse);
    return 'creees';
  }

  if (estClasseDejaAlignee(classeExistante, classeSeed, references)) {
    return 'inchangees';
  }

  const classeAlignee = construireClasseAcademique(
    classeExistante.obtenirId(),
    classeSeed,
    references,
    classeExistante,
  );

  await dependances.depotClasseAcademique.sauvegarder(classeAlignee);
  return 'misesAJour';
}

async function resoudreReferencesClasseAcademique(
  dependances: DependancesSeedClassesAcademiques,
  classeSeed: EnregistrementClasseAcademiqueSeed,
): Promise<ReferencesClasseAcademique> {
  const sectionScolaire = await dependances.depotSectionScolaire.trouverParCode(
    classeSeed.sectionCode,
  );

  if (sectionScolaire === null) {
    throw new Error(
      `La section ${classeSeed.sectionCode} referencee par ${classeSeed.code} est introuvable.`,
    );
  }

  if (classeSeed.optionCode === null) {
    return { sectionScolaire };
  }

  const optionEtude = await dependances.depotOptionEtude.trouverParCode(classeSeed.optionCode);

  if (optionEtude === null) {
    throw new Error(
      `L'option ${classeSeed.optionCode} referencee par ${classeSeed.code} est introuvable.`,
    );
  }

  return {
    sectionScolaire,
    optionEtude,
  };
}

function construireClasseAcademique(
  idClasseAcademique: ClasseAcademiqueId,
  classeSeed: EnregistrementClasseAcademiqueSeed,
  references: ReferencesClasseAcademique,
  classeExistante?: ClasseAcademique,
): ClasseAcademique {
  return new ClasseAcademique(
    idClasseAcademique,
    references.sectionScolaire.obtenirId(),
    classeSeed.code,
    classeSeed.libelle,
    new OrdreClasse(classeSeed.ordrePedagogique),
    classeSeed.cycle,
    classeSeed.accepteOptions,
    classeSeed.optionObligatoire,
    classeSeed.typeStructureEvaluation,
    references.optionEtude?.obtenirId(),
    classeExistante?.estActive() ?? true,
    classeExistante?.obtenirCreeLe() ?? new Date(),
    classeExistante?.obtenirModifieLe(),
    classeExistante?.obtenirVersion() ?? 1,
  );
}

function estClasseDejaAlignee(
  classeExistante: ClasseAcademique,
  classeSeed: EnregistrementClasseAcademiqueSeed,
  references: ReferencesClasseAcademique,
): boolean {
  const optionExistanteId = classeExistante.obtenirOptionEtudeId()?.obtenirValeur();
  const optionSeedId = references.optionEtude?.obtenirId().obtenirValeur();

  return classeExistante.obtenirSectionScolaireId().estEgal(references.sectionScolaire.obtenirId())
    && optionExistanteId === optionSeedId
    && classeExistante.obtenirLibelle() === classeSeed.libelle
    && classeExistante.obtenirOrdrePedagogiqueNumerique() === classeSeed.ordrePedagogique
    && classeExistante.obtenirCycle() === classeSeed.cycle
    && classeExistante.accepteOptionsEtude() === classeSeed.accepteOptions
    && classeExistante.estOptionObligatoire() === classeSeed.optionObligatoire
    && classeExistante.obtenirTypeStructureEvaluation() === classeSeed.typeStructureEvaluation;
}

function chargerDocumentClassesAcademiques(cheminJson: string): DocumentClassesAcademiquesSeed {
  if (!existsSync(cheminJson)) {
    throw new Error(`Le fichier JSON des classes academiques est introuvable : ${cheminJson}`);
  }

  const contenu = readFileSync(cheminJson, 'utf8');
  const donnees: unknown = JSON.parse(contenu);

  return validerDocumentClassesAcademiques(donnees);
}

function validerDocumentClassesAcademiques(donnees: unknown): DocumentClassesAcademiquesSeed {
  const objet = lireObjet(donnees, 'document classes academiques');
  const classesAcademiques = objet.classesAcademiques;
  const importePar = lireTexte(objet.importePar, 'importePar');

  if (!Array.isArray(classesAcademiques) || classesAcademiques.length === 0) {
    throw new Error('Le seed des classes exige un tableau classesAcademiques non vide.');
  }

  return {
    classesAcademiques: classesAcademiques.map((classeAcademique, index) =>
      validerClasseAcademiqueSeed(classeAcademique, index)
    ),
    importePar,
  };
}

function validerClasseAcademiqueSeed(
  donnees: unknown,
  index: number,
): EnregistrementClasseAcademiqueSeed {
  const objet = lireObjet(donnees, `classesAcademiques[${index}]`);

  return {
    code: lireTexte(objet.code, `classesAcademiques[${index}].code`),
    libelle: lireTexte(objet.libelle, `classesAcademiques[${index}].libelle`),
    sectionCode: lireTexte(objet.sectionCode, `classesAcademiques[${index}].sectionCode`),
    optionCode: lireOptionCode(objet.optionCode, `classesAcademiques[${index}].optionCode`),
    ordrePedagogique: lireEntierPositif(
      objet.ordrePedagogique,
      `classesAcademiques[${index}].ordrePedagogique`,
    ),
    cycle: lireTexte(objet.cycle, `classesAcademiques[${index}].cycle`),
    accepteOptions: lireBooleen(
      objet.accepteOptions,
      `classesAcademiques[${index}].accepteOptions`,
    ),
    optionObligatoire: lireBooleen(
      objet.optionObligatoire,
      `classesAcademiques[${index}].optionObligatoire`,
    ),
    typeStructureEvaluation: lireTypeStructureEvaluation(
      objet.typeStructureEvaluation,
      `classesAcademiques[${index}].typeStructureEvaluation`,
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

function lireOptionCode(valeur: unknown, nomChamp: string): number | null {
  if (valeur === null) {
    return null;
  }

  return lireEntierPositif(valeur, nomChamp);
}

function lireEntierPositif(valeur: unknown, nomChamp: string): number {
  if (!Number.isInteger(valeur) || typeof valeur !== 'number' || valeur <= 0) {
    throw new Error(`Le champ ${nomChamp} doit etre un entier strictement positif.`);
  }

  return valeur;
}

function lireBooleen(valeur: unknown, nomChamp: string): boolean {
  if (typeof valeur !== 'boolean') {
    throw new Error(`Le champ ${nomChamp} doit etre un booleen.`);
  }

  return valeur;
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

if (process.argv[1] !== undefined && resolve(process.argv[1]) === cheminScript) {
  void executerSeedClassesAcademiques()
    .then((bilan) => {
      console.log('Seed des classes academiques termine.', bilan);
    })
    .catch((erreur: unknown) => {
      console.error('Echec du seed des classes academiques.', decrireErreur(erreur));
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
