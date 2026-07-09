import type {
  ClasseAcademiqueItem,
  OptionEtudeItem,
  ReferentielCoursItem,
  ReferentielProgrammeItem,
  SectionScolaireItem,
} from '../../academique/models/academique.model';
import type { PlatformReferenceImportType } from '../stores/platform-reference-center.store';

export interface PlatformReferenceImportDefinition {
  code: PlatformReferenceImportType;
  label: string;
  description: string;
  collectionKey: string;
  neutralHint: string;
}

export interface PlatformReferenceImportValidationIssue {
  message: string;
  niveau: 'erreur' | 'avertissement';
}

export interface PlatformReferenceImportPreview {
  structureReconnaissable: boolean;
  collectionKey: string;
  elementsDetectes: number;
  elementsACreer: number | null;
  elementsAMettreAJour: number | null;
  elementsIgnores: number | null;
  erreursBloquantes: number;
  avertissements: number;
}

export interface PlatformReferenceImportValidationResult {
  estValide: boolean;
  structureReconnaissable: boolean;
  elementsDetectes: number;
  collectionKey: string;
  corps: Record<string, unknown> | null;
  erreurs: string[];
  avertissements: string[];
  preview: PlatformReferenceImportPreview;
}

interface ExistingReferenceState {
  sections: SectionScolaireItem[];
  optionsEtudes: OptionEtudeItem[];
  classesAcademiques: ClasseAcademiqueItem[];
  cours: ReferentielCoursItem[];
  referentiels: ReferentielProgrammeItem[];
}

const STRUCTURES = ['TRIMESTRIEL', 'SEMESTRIEL'] as const;
const SOURCES_LIGNE = ['OFFICIEL', 'AJOUT_ETAT', 'HERITE_ANCIENNE_VERSION', 'OBSOLETE'] as const;
const CATEGORIES_TECHNIQUES = ['GROUPE_1', 'GROUPE_2'] as const;

export const PLATFORM_REFERENCE_IMPORT_DEFINITIONS: readonly PlatformReferenceImportDefinition[] = [
  {
    code: 'sections',
    label: 'Sections scolaires',
    description: 'Ajoute ou verifie les sections officielles qui structurent le socle academique transverse.',
    collectionKey: 'sections',
    neutralHint: 'Les sections servent de base aux classes academiques et aux futurs referentiels programmes.',
  },
  {
    code: 'options',
    label: 'Options d etudes',
    description: 'Charge les options officielles utilisees dans les parcours academiques et techniques.',
    collectionKey: 'options',
    neutralHint: 'Les options d etudes doivent rester coherentes avec les classes et les programmes officiels.',
  },
  {
    code: 'classes',
    label: 'Classes academiques',
    description: 'Met a disposition les classes academiques officielles avec leur structure d evaluation et leurs drapeaux de parcours.',
    collectionKey: 'classesAcademiques',
    neutralHint: 'Les classes academiques structurent la lecture des referentiels et des futures publications officielles.',
  },
  {
    code: 'cours',
    label: 'Cours officiels',
    description: 'Alimente le catalogue officiel des cours, domaines et sous-domaines reutilises par les programmes.',
    collectionKey: 'cours',
    neutralHint: 'Les cours officiels deviennent reutilisables dans les lignes de programme et les comparaisons de versions.',
  },
  {
    code: 'programmes',
    label: 'Programmes officiels',
    description: 'Charge des programmes complets avec leur version officielle et leurs lignes associees.',
    collectionKey: 'programmes',
    neutralHint: 'Les programmes officiels servent ensuite a publier, comparer et activer des versions du referentiel.',
  },
  {
    code: 'lignes',
    label: 'Lignes de programme',
    description: 'Controle ou injecte un lot de lignes officielles selon une structure d evaluation deja connue.',
    collectionKey: 'lignes',
    neutralHint: 'Les lignes de programme doivent rester compatibles avec la structure d evaluation retenue.',
  },
] as const;

export function lireDefinitionImport(
  typeImport: PlatformReferenceImportType,
): PlatformReferenceImportDefinition {
  return PLATFORM_REFERENCE_IMPORT_DEFINITIONS.find((entry) => entry.code === typeImport)
    ?? PLATFORM_REFERENCE_IMPORT_DEFINITIONS[0];
}

export function construireExempleImport(
  typeImport: PlatformReferenceImportType,
): Record<string, unknown> {
  switch (typeImport) {
    case 'sections':
      return {
        sections: [
          { code: 'PRIM', libelle: 'Primaire', ordreAffichage: 1 },
          { code: 'SECO', libelle: 'Secondaire', ordreAffichage: 2 },
        ],
      };
    case 'options':
      return {
        options: [
          {
            code: 301,
            abreviation: 'CG',
            libelle: 'Commerciale et Gestion',
            estTechnique: true,
            categorieTechnique: 'GROUPE_1',
            ordreAffichage: 1,
          },
        ],
      };
    case 'classes':
      return {
        classesAcademiques: [
          {
            idSectionScolaire: 'SECTION-ID',
            code: '7EB',
            libelle: '7e EB',
            ordrePedagogique: 1,
            cycle: 'SECONDAIRE',
            accepteOptions: false,
            optionObligatoire: false,
            typeStructureEvaluation: 'TRIMESTRIEL',
            estClasseTENASOSP: false,
            estClasseEXETAT: false,
            estClasseFinaliste: false,
          },
        ],
      };
    case 'cours':
      return {
        cours: [
          {
            code: 'MATH',
            libelle: 'Mathematiques',
            abreviation: 'MATH',
            domaine: 'Scientifique',
            sousDomaine: 'Sciences exactes',
          },
        ],
      };
    case 'programmes':
      return {
        programmes: [
          {
            idClasseAcademique: 'CLASSE-ID',
            typeStructureEvaluation: 'TRIMESTRIEL',
            versionReferentiel: 'MINEDUC-2026-V1',
            datePublication: '2026-07-01',
            lignes: [
              {
                idReferentielCours: 'COURS-ID',
                ordreAffichage: 1,
                obligatoire: true,
                aExamen: true,
                estCalculable: true,
                sourceLigne: 'OFFICIEL',
                ponderation: {
                  maxP1: 10,
                  maxP2: 10,
                  maxEX1: 20,
                  maxP3: 10,
                  maxP4: 10,
                  maxEX2: 20,
                  maxP5: 10,
                  maxP6: 10,
                  maxEX3: 20,
                },
              },
            ],
          },
        ],
      };
    case 'lignes':
      return {
        typeStructureEvaluation: 'TRIMESTRIEL',
        lignes: [
          {
            idReferentielCours: 'COURS-ID',
            ordreAffichage: 1,
            obligatoire: true,
            aExamen: true,
            estCalculable: true,
            sourceLigne: 'OFFICIEL',
            ponderation: {
              maxP1: 10,
              maxP2: 10,
              maxEX1: 20,
              maxP3: 10,
              maxP4: 10,
              maxEX2: 20,
              maxP5: 10,
              maxP6: 10,
              maxEX3: 20,
            },
          },
        ],
      };
  }
}

export function construireModeleImportJson(
  typeImport: PlatformReferenceImportType,
): string {
  return JSON.stringify(construireExempleImport(typeImport), null, 2);
}

function estObjetRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function lireTexte(value: unknown): string | null {
  return typeof value === 'string' ? value.trim() : null;
}

function lireNombre(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function lireBooleen(value: unknown): boolean | null {
  return typeof value === 'boolean' ? value : null;
}

function egaliteSimple(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

function ajouterErreur(erreurs: string[], message: string): void {
  if (!erreurs.includes(message)) {
    erreurs.push(message);
  }
}

function ajouterAvertissement(avertissements: string[], message: string): void {
  if (!avertissements.includes(message)) {
    avertissements.push(message);
  }
}

function validerPonderation(
  value: unknown,
  erreurs: string[],
  prefixe: string,
): void {
  if (!estObjetRecord(value)) {
    ajouterErreur(erreurs, `${prefixe} doit contenir une ponderation complete.`);
    return;
  }

  const champs = [
    'maxP1', 'maxP2', 'maxEX1',
    'maxP3', 'maxP4', 'maxEX2',
    'maxP5', 'maxP6', 'maxEX3',
  ];

  for (const champ of champs) {
    if (lireNombre(value[champ]) === null) {
      ajouterErreur(erreurs, `${prefixe} doit definir ${champ} comme nombre entier ou decimal valide.`);
    }
  }
}

function analyserSections(
  elements: unknown[],
  existing: ExistingReferenceState,
  erreurs: string[],
): { aCreer: number; ignores: number } {
  let aCreer = 0;
  let ignores = 0;

  elements.forEach((entry, index) => {
    if (!estObjetRecord(entry)) {
      ajouterErreur(erreurs, `La section ${index + 1} doit etre un objet.`);
      return;
    }

    const code = lireTexte(entry.code);
    const libelle = lireTexte(entry.libelle);
    const ordreAffichage = lireNombre(entry.ordreAffichage);

    if (!code) ajouterErreur(erreurs, `Le champ code est manquant sur la section ${index + 1}.`);
    if (!libelle) ajouterErreur(erreurs, `Le champ libelle est manquant sur la section ${index + 1}.`);
    if (ordreAffichage === null) ajouterErreur(erreurs, `Le champ ordreAffichage est invalide sur la section ${index + 1}.`);
    if (!code || !libelle || ordreAffichage === null) return;

    const existante = existing.sections.find((item) => item.code === code);
    if (!existante) {
      aCreer += 1;
      return;
    }

    if (
      existante.libelle !== libelle
      || existante.ordreAffichage !== ordreAffichage
    ) {
      ajouterErreur(erreurs, `Une section avec le code ${code} existe deja avec une definition differente.`);
      return;
    }

    ignores += 1;
  });

  return { aCreer, ignores };
}

function analyserOptions(
  elements: unknown[],
  existing: ExistingReferenceState,
  erreurs: string[],
): { aCreer: number; ignores: number } {
  let aCreer = 0;
  let ignores = 0;

  elements.forEach((entry, index) => {
    if (!estObjetRecord(entry)) {
      ajouterErreur(erreurs, `L option ${index + 1} doit etre un objet.`);
      return;
    }

    const code = lireNombre(entry.code);
    const libelle = lireTexte(entry.libelle);
    const estTechnique = lireBooleen(entry.estTechnique);
    const categorieTechnique = entry.categorieTechnique ?? null;

    if (code === null) ajouterErreur(erreurs, `Le champ code est invalide sur l option ${index + 1}.`);
    if (!libelle) ajouterErreur(erreurs, `Le champ libelle est manquant sur l option ${index + 1}.`);
    if (estTechnique === null) ajouterErreur(erreurs, `Le champ estTechnique est invalide sur l option ${index + 1}.`);
    if (
      categorieTechnique !== null
      && !CATEGORIES_TECHNIQUES.includes(String(categorieTechnique) as never)
    ) {
      ajouterErreur(erreurs, `La categorie technique de l option ${index + 1} est invalide.`);
    }
    if (code === null || !libelle || estTechnique === null) return;

    const existante = existing.optionsEtudes.find((item) => item.code === code);
    if (!existante) {
      aCreer += 1;
      return;
    }

    const coherent = egaliteSimple(
      {
        libelle: existante.libelle,
        estTechnique: existante.estTechnique,
        categorieTechnique: existante.categorieTechnique ?? null,
        abreviation: existante.abreviation ?? null,
        ordreAffichage: existante.ordreAffichage ?? null,
      },
      {
        libelle,
        estTechnique,
        categorieTechnique,
        abreviation: lireTexte(entry.abreviation),
        ordreAffichage: entry.ordreAffichage ?? null,
      },
    );

    if (!coherent) {
      ajouterErreur(erreurs, `Une option avec le code ${code} existe deja avec une definition differente.`);
      return;
    }

    ignores += 1;
  });

  return { aCreer, ignores };
}

function analyserClasses(
  elements: unknown[],
  existing: ExistingReferenceState,
  erreurs: string[],
): { aCreer: number; ignores: number } {
  let aCreer = 0;
  let ignores = 0;

  elements.forEach((entry, index) => {
    if (!estObjetRecord(entry)) {
      ajouterErreur(erreurs, `La classe academique ${index + 1} doit etre un objet.`);
      return;
    }

    const code = lireTexte(entry.code);
    const libelle = lireTexte(entry.libelle);
    const idSectionScolaire = lireTexte(entry.idSectionScolaire);
    const ordrePedagogique = lireNombre(entry.ordrePedagogique);
    const cycle = lireTexte(entry.cycle);
    const accepteOptions = lireBooleen(entry.accepteOptions);
    const optionObligatoire = lireBooleen(entry.optionObligatoire);
    const typeStructureEvaluation = lireTexte(entry.typeStructureEvaluation);

    if (!idSectionScolaire) ajouterErreur(erreurs, `Le champ idSectionScolaire est manquant sur la classe ${index + 1}.`);
    if (!code) ajouterErreur(erreurs, `Le champ code est manquant sur la classe ${index + 1}.`);
    if (!libelle) ajouterErreur(erreurs, `Le champ libelle est manquant sur la classe ${index + 1}.`);
    if (ordrePedagogique === null) ajouterErreur(erreurs, `Le champ ordrePedagogique est invalide sur la classe ${index + 1}.`);
    if (!cycle) ajouterErreur(erreurs, `Le champ cycle est manquant sur la classe ${index + 1}.`);
    if (accepteOptions === null) ajouterErreur(erreurs, `Le champ accepteOptions est invalide sur la classe ${index + 1}.`);
    if (optionObligatoire === null) ajouterErreur(erreurs, `Le champ optionObligatoire est invalide sur la classe ${index + 1}.`);
    if (!STRUCTURES.includes(String(typeStructureEvaluation) as never)) {
      ajouterErreur(erreurs, `La structure d evaluation de la classe ${index + 1} est invalide.`);
    }
    if (!code || !libelle || !idSectionScolaire || ordrePedagogique === null || !cycle || accepteOptions === null || optionObligatoire === null) return;

    const existante = existing.classesAcademiques.find((item) => item.code === code);
    if (!existante) {
      aCreer += 1;
      return;
    }

    const coherent = egaliteSimple(
      {
        idSectionScolaire: existante.idSectionScolaire,
        idOptionEtude: existante.idOptionEtude ?? null,
        libelle: existante.libelle,
        ordrePedagogique: existante.ordrePedagogique,
        cycle: existante.cycle,
        accepteOptions: existante.accepteOptions,
        optionObligatoire: existante.optionObligatoire,
        typeStructureEvaluation: existante.typeStructureEvaluation,
        estClasseTENASOSP: existante.estClasseTENASOSP,
        estClasseEXETAT: existante.estClasseEXETAT,
        estClasseFinaliste: existante.estClasseFinaliste,
      },
      {
        idSectionScolaire,
        idOptionEtude: lireTexte(entry.idOptionEtude),
        libelle,
        ordrePedagogique,
        cycle,
        accepteOptions,
        optionObligatoire,
        typeStructureEvaluation,
        estClasseTENASOSP: lireBooleen(entry.estClasseTENASOSP) ?? false,
        estClasseEXETAT: lireBooleen(entry.estClasseEXETAT) ?? false,
        estClasseFinaliste: lireBooleen(entry.estClasseFinaliste) ?? false,
      },
    );

    if (!coherent) {
      ajouterErreur(erreurs, `Une classe academique avec le code ${code} existe deja avec une definition differente.`);
      return;
    }

    ignores += 1;
  });

  return { aCreer, ignores };
}

function analyserCours(
  elements: unknown[],
  existing: ExistingReferenceState,
  erreurs: string[],
): { aCreer: number; ignores: number } {
  let aCreer = 0;
  let ignores = 0;

  elements.forEach((entry, index) => {
    if (!estObjetRecord(entry)) {
      ajouterErreur(erreurs, `Le cours ${index + 1} doit etre un objet.`);
      return;
    }

    const code = lireTexte(entry.code);
    const libelle = lireTexte(entry.libelle);

    if (!code) ajouterErreur(erreurs, `Le champ code est manquant sur le cours ${index + 1}.`);
    if (!libelle) ajouterErreur(erreurs, `Le champ libelle est manquant sur le cours ${index + 1}.`);
    if (!code || !libelle) return;

    const existant = existing.cours.find((item) => item.code === code);
    if (!existant) {
      aCreer += 1;
      return;
    }

    const coherent = egaliteSimple(
      {
        libelle: existant.libelle,
        abreviation: existant.abreviation ?? null,
        domaine: existant.domaine ?? null,
        sousDomaine: existant.sousDomaine ?? null,
      },
      {
        libelle,
        abreviation: lireTexte(entry.abreviation),
        domaine: lireTexte(entry.domaine),
        sousDomaine: lireTexte(entry.sousDomaine),
      },
    );

    if (!coherent) {
      ajouterErreur(erreurs, `Un cours avec le code ${code} existe deja avec une definition differente.`);
      return;
    }

    ignores += 1;
  });

  return { aCreer, ignores };
}

function validerLigneProgramme(
  entry: unknown,
  index: number,
  erreurs: string[],
): void {
  if (!estObjetRecord(entry)) {
    ajouterErreur(erreurs, `La ligne ${index + 1} doit etre un objet.`);
    return;
  }

  const idReferentielCours = lireTexte(entry.idReferentielCours);
  const ordreAffichage = lireNombre(entry.ordreAffichage);
  const obligatoire = lireBooleen(entry.obligatoire);
  const aExamen = lireBooleen(entry.aExamen);
  const estCalculable = lireBooleen(entry.estCalculable);
  const sourceLigne = lireTexte(entry.sourceLigne);

  if (!idReferentielCours) ajouterErreur(erreurs, `Le champ idReferentielCours est manquant sur la ligne ${index + 1}.`);
  if (ordreAffichage === null) ajouterErreur(erreurs, `Le champ ordreAffichage est invalide sur la ligne ${index + 1}.`);
  if (obligatoire === null) ajouterErreur(erreurs, `Le champ obligatoire est invalide sur la ligne ${index + 1}.`);
  if (aExamen === null) ajouterErreur(erreurs, `Le champ aExamen est invalide sur la ligne ${index + 1}.`);
  if (estCalculable === null) ajouterErreur(erreurs, `Le champ estCalculable est invalide sur la ligne ${index + 1}.`);
  if (!SOURCES_LIGNE.includes(String(sourceLigne) as never)) {
    ajouterErreur(erreurs, `La provenance de la ligne ${index + 1} est invalide.`);
  }

  validerPonderation(entry.ponderation, erreurs, `La ligne ${index + 1}`);
}

function analyserProgrammes(
  elements: unknown[],
  existing: ExistingReferenceState,
  erreurs: string[],
  avertissements: string[],
): { aCreer: number | null; ignores: number | null } {
  elements.forEach((entry, index) => {
    if (!estObjetRecord(entry)) {
      ajouterErreur(erreurs, `Le programme ${index + 1} doit etre un objet.`);
      return;
    }

    if (!lireTexte(entry.idClasseAcademique)) {
      ajouterErreur(erreurs, `Le champ idClasseAcademique est manquant sur le programme ${index + 1}.`);
    }
    if (!STRUCTURES.includes(String(lireTexte(entry.typeStructureEvaluation)) as never)) {
      ajouterErreur(erreurs, `La structure d evaluation du programme ${index + 1} est invalide.`);
    }
    if (!lireTexte(entry.versionReferentiel)) {
      ajouterErreur(erreurs, `Le champ versionReferentiel est manquant sur le programme ${index + 1}.`);
    }
    const datePublication = lireTexte(entry.datePublication) ?? String(entry.datePublication ?? '');
    if (Number.isNaN(new Date(datePublication).getTime())) {
      ajouterErreur(erreurs, `La date de publication du programme ${index + 1} est invalide.`);
    }

    if (!Array.isArray(entry.lignes) || entry.lignes.length === 0) {
      ajouterErreur(erreurs, `Le programme ${index + 1} doit contenir au moins une ligne.`);
      return;
    }

    entry.lignes.forEach((ligne, ligneIndex) => validerLigneProgramme(ligne, ligneIndex, erreurs));
  });

  if (elements.length > 0) {
    ajouterAvertissement(
      avertissements,
      existing.referentiels.length > 0
        ? 'Le detail creer / ignorer des programmes ne peut pas etre determine avec certitude avant execution.'
        : 'Le detail creer / ignorer des programmes sera confirme apres execution de l import.',
    );
  }

  return { aCreer: null, ignores: null };
}

function analyserLignes(
  elements: unknown[],
  root: Record<string, unknown>,
  erreurs: string[],
  avertissements: string[],
): { aCreer: number | null; ignores: number | null } {
  if (!STRUCTURES.includes(String(lireTexte(root.typeStructureEvaluation)) as never)) {
    ajouterErreur(erreurs, 'Le champ typeStructureEvaluation est manquant ou invalide.');
  }

  elements.forEach((entry, index) => validerLigneProgramme(entry, index, erreurs));
  if (elements.length > 0) {
    ajouterAvertissement(
      avertissements,
      'Le detail creer / ignorer des lignes sera confirme apres execution de l import.',
    );
  }
  return { aCreer: null, ignores: null };
}

export function validerImportReferentiel(
  typeImport: PlatformReferenceImportType,
  rawJson: string,
  existing: ExistingReferenceState,
): PlatformReferenceImportValidationResult {
  const definition = lireDefinitionImport(typeImport);
  const erreurs: string[] = [];
  const avertissements: string[] = [];
  const trimmed = rawJson.trim();

  if (trimmed.length === 0) {
    return {
      estValide: false,
      structureReconnaissable: false,
      elementsDetectes: 0,
      collectionKey: definition.collectionKey,
      corps: null,
      erreurs: ['Aucun contenu JSON n a encore ete fourni.'],
      avertissements: [],
      preview: {
        structureReconnaissable: false,
        collectionKey: definition.collectionKey,
        elementsDetectes: 0,
        elementsACreer: null,
        elementsAMettreAJour: null,
        elementsIgnores: null,
        erreursBloquantes: 1,
        avertissements: 0,
      },
    };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    return {
      estValide: false,
      structureReconnaissable: false,
      elementsDetectes: 0,
      collectionKey: definition.collectionKey,
      corps: null,
      erreurs: ['Le contenu fourni n est pas un JSON valide.'],
      avertissements: [],
      preview: {
        structureReconnaissable: false,
        collectionKey: definition.collectionKey,
        elementsDetectes: 0,
        elementsACreer: null,
        elementsAMettreAJour: null,
        elementsIgnores: null,
        erreursBloquantes: 1,
        avertissements: 0,
      },
    };
  }

  if (!estObjetRecord(parsed)) {
    return {
      estValide: false,
      structureReconnaissable: false,
      elementsDetectes: 0,
      collectionKey: definition.collectionKey,
      corps: null,
      erreurs: ['Le contenu fourni doit etre un objet JSON contenant la collection attendue.'],
      avertissements: [],
      preview: {
        structureReconnaissable: false,
        collectionKey: definition.collectionKey,
        elementsDetectes: 0,
        elementsACreer: null,
        elementsAMettreAJour: null,
        elementsIgnores: null,
        erreursBloquantes: 1,
        avertissements: 0,
      },
    };
  }

  const rawCollection = parsed[definition.collectionKey];
  if (!Array.isArray(rawCollection)) {
    return {
      estValide: false,
      structureReconnaissable: false,
      elementsDetectes: 0,
      collectionKey: definition.collectionKey,
      corps: null,
      erreurs: [`La collection ${definition.collectionKey} est manquante ou invalide.`],
      avertissements: [],
      preview: {
        structureReconnaissable: false,
        collectionKey: definition.collectionKey,
        elementsDetectes: 0,
        elementsACreer: null,
        elementsAMettreAJour: null,
        elementsIgnores: null,
        erreursBloquantes: 1,
        avertissements: 0,
      },
    };
  }

  if (rawCollection.length === 0) {
    ajouterErreur(erreurs, `La collection ${definition.collectionKey} doit contenir au moins un element.`);
  }

  let aCreer: number | null = null;
  let ignores: number | null = null;

  switch (typeImport) {
    case 'sections': {
      const result = analyserSections(rawCollection, existing, erreurs);
      aCreer = result.aCreer;
      ignores = result.ignores;
      break;
    }
    case 'options': {
      const result = analyserOptions(rawCollection, existing, erreurs);
      aCreer = result.aCreer;
      ignores = result.ignores;
      break;
    }
    case 'classes': {
      const result = analyserClasses(rawCollection, existing, erreurs);
      aCreer = result.aCreer;
      ignores = result.ignores;
      break;
    }
    case 'cours': {
      const result = analyserCours(rawCollection, existing, erreurs);
      aCreer = result.aCreer;
      ignores = result.ignores;
      break;
    }
    case 'programmes': {
      const result = analyserProgrammes(rawCollection, existing, erreurs, avertissements);
      aCreer = result.aCreer;
      ignores = result.ignores;
      break;
    }
    case 'lignes': {
      const result = analyserLignes(rawCollection, parsed, erreurs, avertissements);
      aCreer = result.aCreer;
      ignores = result.ignores;
      break;
    }
  }

  const estValide = erreurs.length === 0;

  return {
    estValide,
    structureReconnaissable: true,
    elementsDetectes: rawCollection.length,
    collectionKey: definition.collectionKey,
    corps: estValide ? parsed : null,
    erreurs,
    avertissements,
    preview: {
      structureReconnaissable: true,
      collectionKey: definition.collectionKey,
      elementsDetectes: rawCollection.length,
      elementsACreer: aCreer,
      elementsAMettreAJour: null,
      elementsIgnores: ignores,
      erreursBloquantes: erreurs.length,
      avertissements: avertissements.length,
    },
  };
}

export function resumerResultatImport(
  typeImport: PlatformReferenceImportType,
  resultat: Record<string, unknown> | null,
  validation: PlatformReferenceImportValidationResult | null,
  dureeMs: number | null,
): {
  succes: boolean;
  titre: string;
  elementsImportes: number | null;
  elementsRejetes: number | null;
  elementsIgnores: number | null;
  dureeTexte: string | null;
  detailsDisponibles: Record<string, unknown> | null;
} | null {
  if (!resultat) {
    return null;
  }

  const nombreImporte = typeof resultat.nombreImporte === 'number' ? resultat.nombreImporte : null;
  const totalDetecte = validation?.elementsDetectes ?? null;
  const ignores = totalDetecte !== null && nombreImporte !== null && totalDetecte >= nombreImporte
    ? totalDetecte - nombreImporte
    : null;

  return {
    succes: true,
    titre: `Import ${lireDefinitionImport(typeImport).label.toLowerCase()} termine`,
    elementsImportes: nombreImporte,
    elementsRejetes: 0,
    elementsIgnores: ignores,
    dureeTexte: dureeMs !== null ? `${(dureeMs / 1000).toFixed(dureeMs >= 10000 ? 0 : 1)} s` : null,
    detailsDisponibles: resultat,
  };
}
