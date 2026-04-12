import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

type ObjetJson = Record<string, unknown>;
type CodeReference = string | number;

interface ProblemeValidation {
  fichier: string;
  chemin: string;
  message: string;
}

interface SectionScolaireJson {
  code: string;
  libelle: string;
  ordreAffichage: number;
}

interface OptionEtudeJson {
  code: CodeReference;
  libelle: string;
  abreviation?: string;
  ordreAffichage: number;
}

interface ClasseAcademiqueJson {
  code: string;
  libelle: string;
  sectionCode: string;
  optionCode: CodeReference | null;
  ordrePedagogique: number;
  cycle: string;
  accepteOptions: boolean;
  optionObligatoire: boolean;
  typeStructureEvaluation: string;
}

interface CoursOfficielJson {
  code: string;
  libelle: string;
  abreviation?: string;
}

interface PonderationJson {
  maxP1: number;
  maxP2: number;
  maxEX1: number;
  maxP3: number;
  maxP4: number;
  maxEX2: number;
  maxP5: number;
  maxP6: number;
  maxEX3: number;
}

interface LigneProgrammeJson {
  coursCode: string;
  ordreAffichage: number;
  obligatoire: boolean;
  aExamen: boolean;
  estCalculable: boolean;
  sourceLigne: string;
  ponderation: PonderationJson;
  domaine?: string;
  sousDomaine?: string;
}

interface ProgrammeAcademiqueJson {
  classeCode: string;
  typeStructureEvaluation: string;
  versionReferentiel: string;
  anneeReference: string;
  datePublication: string;
  lignes: readonly LigneProgrammeJson[];
}

interface CorrespondanceCoursJson {
  ancienCode: string;
  ancienLibelle: string;
  nouveauCode: string;
  nouveauLibelle: string;
  strategie: string;
}

interface BilanValidation {
  sections: number;
  options: number;
  classes: number;
  cours: number;
  correspondances: number;
  programmes: number;
  lignesProgrammes: number;
}

const cheminScript = fileURLToPath(import.meta.url);
const racineProjet = resolve(dirname(cheminScript), '..', '..');
const racineDonneesReference = resolve(
  racineProjet,
  'docs/donnees-reference/referentiel-academique',
);
const versionReferentielAttendue = 'MINEDUC-2024-2025-V2';
const typesStructureEvaluation = new Set(['TRIMESTRIEL', 'SEMESTRIEL']);
const cyclesClasses = new Set(['MATERNELLE', 'PRIMAIRE', 'EB', 'HUMANITE']);
const clesPonderation: readonly (keyof PonderationJson)[] = [
  'maxP1',
  'maxP2',
  'maxEX1',
  'maxP3',
  'maxP4',
  'maxEX2',
  'maxP5',
  'maxP6',
  'maxEX3',
];

// Ce script verifie la coherence CID des donnees de reference du BC Referentiel Academique.
export function validerDonneesReferenceReferentielAcademique(): BilanValidation {
  const problemes: ProblemeValidation[] = [];
  const sections = validerSectionsScolaires(problemes);
  const options = validerOptionsEtudes(problemes);
  const classes = validerClassesAcademiques(problemes, sections, options);
  const cours = validerCoursOfficiels(problemes);
  const correspondances = validerMappingCours(problemes, cours);
  const programmes = validerProgrammesAcademiques(problemes, classes, cours);

  if (problemes.length > 0) {
    afficherProblemes(problemes);
    throw new Error(
      `Validation des donnees de reference echouee: ${problemes.length} probleme(s).`,
    );
  }

  return {
    sections: sections.size,
    options: options.size,
    classes: classes.size,
    cours: cours.size,
    correspondances,
    programmes: programmes.programmes,
    lignesProgrammes: programmes.lignes,
  };
}

function validerSectionsScolaires(
  problemes: ProblemeValidation[],
): Map<string, SectionScolaireJson> {
  const fichier = 'sections/sections-scolaires.v1.json';
  const sections = obtenirTableauJson(fichier, 'sections', problemes);
  const sectionsParCode = new Map<string, SectionScolaireJson>();
  const ordres = new Set<number>();

  sections.forEach((section, index) => {
    const chemin = `sections[${index}]`;

    if (!estObjetJson(section)) {
      ajouterProbleme(problemes, fichier, chemin, 'La section doit etre un objet.');
      return;
    }

    const code = lireChaineObligatoire(section, 'code', fichier, chemin, problemes);
    const libelle = lireChaineObligatoire(section, 'libelle', fichier, chemin, problemes);
    const ordreAffichage = lireEntierObligatoire(
      section,
      'ordreAffichage',
      fichier,
      chemin,
      problemes,
    );

    if (code === undefined || libelle === undefined || ordreAffichage === undefined) {
      return;
    }

    verifierCodeUnique(sectionsParCode, code, fichier, chemin, problemes, 'section');
    verifierOrdreUnique(ordres, ordreAffichage, fichier, chemin, problemes);
    sectionsParCode.set(code, { code, libelle, ordreAffichage });
  });

  return sectionsParCode;
}

function validerOptionsEtudes(
  problemes: ProblemeValidation[],
): Map<string, OptionEtudeJson> {
  const fichier = 'options/options-etudes.v1.json';
  const options = obtenirTableauJson(fichier, 'options', problemes);
  const optionsParCode = new Map<string, OptionEtudeJson>();
  const ordres = new Set<number>();

  options.forEach((option, index) => {
    const chemin = `options[${index}]`;

    if (!estObjetJson(option)) {
      ajouterProbleme(problemes, fichier, chemin, "L'option doit etre un objet.");
      return;
    }

    const code = lireCodeReferenceObligatoire(option, 'code', fichier, chemin, problemes);
    const libelle = lireChaineObligatoire(option, 'libelle', fichier, chemin, problemes);
    const ordreAffichage = lireEntierObligatoire(
      option,
      'ordreAffichage',
      fichier,
      chemin,
      problemes,
    );
    const abreviation = lireChaineOptionnelle(option, 'abreviation', fichier, chemin, problemes);

    if (code === undefined || libelle === undefined || ordreAffichage === undefined) {
      return;
    }

    const codeNormalise = normaliserCodeReference(code);

    verifierCodeUnique(optionsParCode, codeNormalise, fichier, chemin, problemes, 'option');
    verifierOrdreUnique(ordres, ordreAffichage, fichier, chemin, problemes);
    optionsParCode.set(codeNormalise, {
      code,
      libelle,
      abreviation,
      ordreAffichage,
    });
  });

  return optionsParCode;
}

function validerClassesAcademiques(
  problemes: ProblemeValidation[],
  sections: ReadonlyMap<string, SectionScolaireJson>,
  options: ReadonlyMap<string, OptionEtudeJson>,
): Map<string, ClasseAcademiqueJson> {
  const fichier = 'classes/classes-academiques.v1.json';
  const classes = obtenirTableauJson(fichier, 'classesAcademiques', problemes);
  const classesParCode = new Map<string, ClasseAcademiqueJson>();

  classes.forEach((classe, index) => {
    const chemin = `classesAcademiques[${index}]`;

    if (!estObjetJson(classe)) {
      ajouterProbleme(problemes, fichier, chemin, 'La classe academique doit etre un objet.');
      return;
    }

    const classeValidee = lireClasseAcademique(classe, fichier, chemin, problemes);

    if (classeValidee === undefined) {
      return;
    }

    verifierCodeUnique(classesParCode, classeValidee.code, fichier, chemin, problemes, 'classe');

    if (!sections.has(classeValidee.sectionCode)) {
      ajouterProbleme(
        problemes,
        fichier,
        `${chemin}.sectionCode`,
        `La section ${classeValidee.sectionCode} est inconnue.`,
      );
    }

    if (classeValidee.optionCode !== null) {
      const optionCode = normaliserCodeReference(classeValidee.optionCode);

      if (!options.has(optionCode)) {
        ajouterProbleme(
          problemes,
          fichier,
          `${chemin}.optionCode`,
          `L'option ${optionCode} est inconnue.`,
        );
      }
    }

    verifierCoherenceClasseAcademique(classeValidee, fichier, chemin, problemes);
    classesParCode.set(classeValidee.code, classeValidee);
  });

  return classesParCode;
}

function validerCoursOfficiels(problemes: ProblemeValidation[]): Map<string, CoursOfficielJson> {
  const fichier = 'cours/cours-officiels.v2.json';
  const cours = obtenirTableauJson(fichier, 'cours', problemes);
  const coursParCode = new Map<string, CoursOfficielJson>();

  cours.forEach((coursOfficiel, index) => {
    const chemin = `cours[${index}]`;

    if (!estObjetJson(coursOfficiel)) {
      ajouterProbleme(problemes, fichier, chemin, 'Le cours doit etre un objet.');
      return;
    }

    const code = lireChaineObligatoire(coursOfficiel, 'code', fichier, chemin, problemes);
    const libelle = lireChaineObligatoire(coursOfficiel, 'libelle', fichier, chemin, problemes);
    const abreviation = lireChaineOptionnelle(
      coursOfficiel,
      'abreviation',
      fichier,
      chemin,
      problemes,
    );

    if (code === undefined || libelle === undefined) {
      return;
    }

    verifierCodeUnique(coursParCode, code, fichier, chemin, problemes, 'cours');
    verifierAbsenceChamp(coursOfficiel, 'domaine', fichier, chemin, problemes);
    verifierAbsenceChamp(coursOfficiel, 'sousDomaine', fichier, chemin, problemes);
    coursParCode.set(code, { code, libelle, abreviation });
  });

  return coursParCode;
}

function validerMappingCours(
  problemes: ProblemeValidation[],
  cours: ReadonlyMap<string, CoursOfficielJson>,
): number {
  const fichier = 'cours/mapping-cours-v1-vers-v2.json';
  const correspondances = obtenirTableauJson(fichier, 'correspondances', problemes);
  const couples = new Set<string>();

  correspondances.forEach((correspondance, index) => {
    const chemin = `correspondances[${index}]`;

    if (!estObjetJson(correspondance)) {
      ajouterProbleme(problemes, fichier, chemin, 'La correspondance doit etre un objet.');
      return;
    }

    const correspondanceValidee = lireCorrespondanceCours(
      correspondance,
      fichier,
      chemin,
      problemes,
    );

    if (correspondanceValidee === undefined) {
      return;
    }

    const cleCouple = `${correspondanceValidee.ancienCode}->${correspondanceValidee.nouveauCode}`;

    if (couples.has(cleCouple)) {
      ajouterProbleme(
        problemes,
        fichier,
        chemin,
        `La correspondance ${cleCouple} est dupliquee.`,
      );
    }

    couples.add(cleCouple);

    if (!cours.has(correspondanceValidee.nouveauCode)) {
      ajouterProbleme(
        problemes,
        fichier,
        `${chemin}.nouveauCode`,
        `Le cours cible ${correspondanceValidee.nouveauCode} est absent du referentiel V2.`,
      );
    }
  });

  return correspondances.length;
}

function validerProgrammesAcademiques(
  problemes: ProblemeValidation[],
  classes: ReadonlyMap<string, ClasseAcademiqueJson>,
  cours: ReadonlyMap<string, CoursOfficielJson>,
): { programmes: number; lignes: number } {
  const fichier = 'programmes/programmes-academiques.v2.json';
  const programmes = obtenirTableauJson(fichier, 'programmes', problemes);
  const programmesParClasse = new Set<string>();
  let totalLignes = 0;

  programmes.forEach((programme, index) => {
    const chemin = `programmes[${index}]`;

    if (!estObjetJson(programme)) {
      ajouterProbleme(problemes, fichier, chemin, 'Le programme doit etre un objet.');
      return;
    }

    const programmeValide = lireProgrammeAcademique(programme, fichier, chemin, problemes);

    if (programmeValide === undefined) {
      return;
    }

    totalLignes += programmeValide.lignes.length;
    verifierProgrammeAcademique(programmeValide, classes, cours, fichier, chemin, problemes);

    if (programmesParClasse.has(programmeValide.classeCode)) {
      ajouterProbleme(
        problemes,
        fichier,
        `${chemin}.classeCode`,
        `Le programme de la classe ${programmeValide.classeCode} est duplique dans V2.`,
      );
    }

    programmesParClasse.add(programmeValide.classeCode);
  });

  verifierCorrectionsMetierCiblees(programmes, fichier, problemes);

  return {
    programmes: programmes.length,
    lignes: totalLignes,
  };
}

function lireClasseAcademique(
  classe: ObjetJson,
  fichier: string,
  chemin: string,
  problemes: ProblemeValidation[],
): ClasseAcademiqueJson | undefined {
  const code = lireChaineObligatoire(classe, 'code', fichier, chemin, problemes);
  const libelle = lireChaineObligatoire(classe, 'libelle', fichier, chemin, problemes);
  const sectionCode = lireChaineObligatoire(classe, 'sectionCode', fichier, chemin, problemes);
  const optionCode = lireCodeReferenceNullable(classe, 'optionCode', fichier, chemin, problemes);
  const ordrePedagogique = lireEntierObligatoire(
    classe,
    'ordrePedagogique',
    fichier,
    chemin,
    problemes,
  );
  const cycle = lireChaineObligatoire(classe, 'cycle', fichier, chemin, problemes);
  const accepteOptions = lireBooleenObligatoire(
    classe,
    'accepteOptions',
    fichier,
    chemin,
    problemes,
  );
  const optionObligatoire = lireBooleenObligatoire(
    classe,
    'optionObligatoire',
    fichier,
    chemin,
    problemes,
  );
  const typeStructureEvaluation = lireChaineObligatoire(
    classe,
    'typeStructureEvaluation',
    fichier,
    chemin,
    problemes,
  );

  if (
    code === undefined
    || libelle === undefined
    || sectionCode === undefined
    || optionCode === undefined
    || ordrePedagogique === undefined
    || cycle === undefined
    || accepteOptions === undefined
    || optionObligatoire === undefined
    || typeStructureEvaluation === undefined
  ) {
    return undefined;
  }

  return {
    code,
    libelle,
    sectionCode,
    optionCode,
    ordrePedagogique,
    cycle,
    accepteOptions,
    optionObligatoire,
    typeStructureEvaluation,
  };
}

function lireProgrammeAcademique(
  programme: ObjetJson,
  fichier: string,
  chemin: string,
  problemes: ProblemeValidation[],
): ProgrammeAcademiqueJson | undefined {
  const classeCode = lireChaineObligatoire(programme, 'classeCode', fichier, chemin, problemes);
  const typeStructureEvaluation = lireChaineObligatoire(
    programme,
    'typeStructureEvaluation',
    fichier,
    chemin,
    problemes,
  );
  const versionReferentiel = lireChaineObligatoire(
    programme,
    'versionReferentiel',
    fichier,
    chemin,
    problemes,
  );
  const anneeReference = lireChaineObligatoire(
    programme,
    'anneeReference',
    fichier,
    chemin,
    problemes,
  );
  const datePublication = lireChaineObligatoire(
    programme,
    'datePublication',
    fichier,
    chemin,
    problemes,
  );
  const lignesBrutes = programme.lignes;

  if (!Array.isArray(lignesBrutes)) {
    ajouterProbleme(problemes, fichier, `${chemin}.lignes`, 'Les lignes doivent etre un tableau.');
    return undefined;
  }

  const lignes: LigneProgrammeJson[] = [];

  lignesBrutes.forEach((ligne, index) => {
    const ligneValidee = lireLigneProgramme(
      ligne,
      fichier,
      `${chemin}.lignes[${index}]`,
      problemes,
    );

    if (ligneValidee !== undefined) {
      lignes.push(ligneValidee);
    }
  });

  if (
    classeCode === undefined
    || typeStructureEvaluation === undefined
    || versionReferentiel === undefined
    || anneeReference === undefined
    || datePublication === undefined
  ) {
    return undefined;
  }

  return {
    classeCode,
    typeStructureEvaluation,
    versionReferentiel,
    anneeReference,
    datePublication,
    lignes,
  };
}

function lireLigneProgramme(
  ligne: unknown,
  fichier: string,
  chemin: string,
  problemes: ProblemeValidation[],
): LigneProgrammeJson | undefined {
  if (!estObjetJson(ligne)) {
    ajouterProbleme(problemes, fichier, chemin, 'La ligne de programme doit etre un objet.');
    return undefined;
  }

  const coursCode = lireChaineObligatoire(ligne, 'coursCode', fichier, chemin, problemes);
  const ordreAffichage = lireEntierObligatoire(
    ligne,
    'ordreAffichage',
    fichier,
    chemin,
    problemes,
  );
  const obligatoire = lireBooleenObligatoire(ligne, 'obligatoire', fichier, chemin, problemes);
  const aExamen = lireBooleenObligatoire(ligne, 'aExamen', fichier, chemin, problemes);
  const estCalculable = lireBooleenObligatoire(
    ligne,
    'estCalculable',
    fichier,
    chemin,
    problemes,
  );
  const sourceLigne = lireChaineObligatoire(ligne, 'sourceLigne', fichier, chemin, problemes);
  const ponderation = lirePonderation(ligne.ponderation, fichier, `${chemin}.ponderation`, problemes);
  const domaine = lireChaineOptionnelle(ligne, 'domaine', fichier, chemin, problemes);
  const sousDomaine = lireChaineOptionnelle(ligne, 'sousDomaine', fichier, chemin, problemes);

  if (
    coursCode === undefined
    || ordreAffichage === undefined
    || obligatoire === undefined
    || aExamen === undefined
    || estCalculable === undefined
    || sourceLigne === undefined
    || ponderation === undefined
  ) {
    return undefined;
  }

  return {
    coursCode,
    ordreAffichage,
    obligatoire,
    aExamen,
    estCalculable,
    sourceLigne,
    ponderation,
    domaine,
    sousDomaine,
  };
}

function lireCorrespondanceCours(
  correspondance: ObjetJson,
  fichier: string,
  chemin: string,
  problemes: ProblemeValidation[],
): CorrespondanceCoursJson | undefined {
  const ancienCode = lireChaineObligatoire(
    correspondance,
    'ancienCode',
    fichier,
    chemin,
    problemes,
  );
  const ancienLibelle = lireChaineObligatoire(
    correspondance,
    'ancienLibelle',
    fichier,
    chemin,
    problemes,
  );
  const nouveauCode = lireChaineObligatoire(
    correspondance,
    'nouveauCode',
    fichier,
    chemin,
    problemes,
  );
  const nouveauLibelle = lireChaineObligatoire(
    correspondance,
    'nouveauLibelle',
    fichier,
    chemin,
    problemes,
  );
  const strategie = lireChaineObligatoire(
    correspondance,
    'strategie',
    fichier,
    chemin,
    problemes,
  );

  if (
    ancienCode === undefined
    || ancienLibelle === undefined
    || nouveauCode === undefined
    || nouveauLibelle === undefined
    || strategie === undefined
  ) {
    return undefined;
  }

  return {
    ancienCode,
    ancienLibelle,
    nouveauCode,
    nouveauLibelle,
    strategie,
  };
}

function verifierCoherenceClasseAcademique(
  classe: ClasseAcademiqueJson,
  fichier: string,
  chemin: string,
  problemes: ProblemeValidation[],
): void {
  if (!cyclesClasses.has(classe.cycle)) {
    ajouterProbleme(problemes, fichier, `${chemin}.cycle`, `Le cycle ${classe.cycle} est inconnu.`);
  }

  if (!typesStructureEvaluation.has(classe.typeStructureEvaluation)) {
    ajouterProbleme(
      problemes,
      fichier,
      `${chemin}.typeStructureEvaluation`,
      `La structure ${classe.typeStructureEvaluation} est inconnue.`,
    );
  }

  if (classe.sectionCode !== 'SEC' && classe.optionCode !== null) {
    ajouterProbleme(
      problemes,
      fichier,
      `${chemin}.optionCode`,
      'Seules les classes du secondaire peuvent porter une option.',
    );
  }

  if (classe.cycle === 'HUMANITE' && classe.optionCode === null) {
    ajouterProbleme(
      problemes,
      fichier,
      `${chemin}.optionCode`,
      'Une classe des humanites doit etre liee a une option.',
    );
  }

  if (classe.cycle !== 'HUMANITE' && classe.optionCode !== null) {
    ajouterProbleme(
      problemes,
      fichier,
      `${chemin}.optionCode`,
      'Les classes hors humanites ne doivent pas porter d option.',
    );
  }
}

function verifierProgrammeAcademique(
  programme: ProgrammeAcademiqueJson,
  classes: ReadonlyMap<string, ClasseAcademiqueJson>,
  cours: ReadonlyMap<string, CoursOfficielJson>,
  fichier: string,
  chemin: string,
  problemes: ProblemeValidation[],
): void {
  const classe = classes.get(programme.classeCode);
  const ordres = new Set<number>();
  const coursProgramme = new Set<string>();

  if (classe === undefined) {
    ajouterProbleme(
      problemes,
      fichier,
      `${chemin}.classeCode`,
      `La classe ${programme.classeCode} est absente du referentiel des classes.`,
    );
  } else if (classe.typeStructureEvaluation !== programme.typeStructureEvaluation) {
    ajouterProbleme(
      problemes,
      fichier,
      `${chemin}.typeStructureEvaluation`,
      `La structure ${programme.typeStructureEvaluation} diverge de la classe ${classe.typeStructureEvaluation}.`,
    );
  }

  if (programme.versionReferentiel !== versionReferentielAttendue) {
    ajouterProbleme(
      problemes,
      fichier,
      `${chemin}.versionReferentiel`,
      `La version attendue est ${versionReferentielAttendue}.`,
    );
  }

  if (programme.lignes.length === 0) {
    ajouterProbleme(problemes, fichier, `${chemin}.lignes`, 'Un programme doit contenir des lignes.');
  }

  programme.lignes.forEach((ligne, index) => {
    const cheminLigne = `${chemin}.lignes[${index}]`;

    if (!cours.has(ligne.coursCode)) {
      ajouterProbleme(
        problemes,
        fichier,
        `${cheminLigne}.coursCode`,
        `Le cours ${ligne.coursCode} est absent du referentiel des cours V2.`,
      );
    }

    verifierOrdreUnique(ordres, ligne.ordreAffichage, fichier, cheminLigne, problemes);

    if (coursProgramme.has(ligne.coursCode)) {
      ajouterProbleme(
        problemes,
        fichier,
        `${cheminLigne}.coursCode`,
        `Le cours ${ligne.coursCode} est duplique dans ${programme.classeCode}.`,
      );
    }

    coursProgramme.add(ligne.coursCode);

    if (ligne.sourceLigne !== 'OFFICIEL') {
      ajouterProbleme(
        problemes,
        fichier,
        `${cheminLigne}.sourceLigne`,
        'La source de ligne doit rester OFFICIEL.',
      );
    }

    if (ligne.sousDomaine !== undefined && ligne.domaine === undefined) {
      ajouterProbleme(
        problemes,
        fichier,
        `${cheminLigne}.sousDomaine`,
        'Un sous-domaine exige un domaine sur la ligne de programme.',
      );
    }
  });

  verifierOrdresContigus(ordres, programme.lignes.length, fichier, `${chemin}.lignes`, problemes);
}

function verifierCorrectionsMetierCiblees(
  programmesBruts: readonly unknown[],
  fichier: string,
  problemes: ProblemeValidation[],
): void {
  const programmes = programmesBruts.filter(estObjetJson);
  const programmeTroisiemeSciences = programmes.find((programme) => programme.classeCode === '3SC');

  if (!estObjetJson(programmeTroisiemeSciences) || !Array.isArray(programmeTroisiemeSciences.lignes)) {
    ajouterProbleme(problemes, fichier, 'programmes[3SC]', 'Le programme 3SC est introuvable.');
  } else {
    const ligneOrdre17 = programmeTroisiemeSciences.lignes.find(
      (ligne) => estObjetJson(ligne) && ligne.ordreAffichage === 17,
    );

    if (!estObjetJson(ligneOrdre17) || ligneOrdre17.coursCode !== 'ESTHETIQUE') {
      ajouterProbleme(
        problemes,
        fichier,
        'programmes[3SC].lignes[ordre=17]',
        'La ligne 17 de 3SC doit pointer vers ESTHETIQUE.',
      );
    }
  }

  for (const classeCode of ['1PR', '2PR']) {
    const programmePrimaire = programmes.find((programme) => programme.classeCode === classeCode);

    if (!estObjetJson(programmePrimaire) || !Array.isArray(programmePrimaire.lignes)) {
      ajouterProbleme(
        problemes,
        fichier,
        `programmes[${classeCode}]`,
        `Le programme ${classeCode} est introuvable.`,
      );
      continue;
    }

    const ligneLecture = programmePrimaire.lignes.find(
      (ligne) => (
        estObjetJson(ligne)
        && ligne.coursCode === 'LECT_ECRITURE_EN_LANGUES_CONGOLAISES'
      ),
    );

    if (!estObjetJson(ligneLecture)) {
      ajouterProbleme(
        problemes,
        fichier,
        `programmes[${classeCode}].lignes`,
        'La ligne LECT_ECRITURE_EN_LANGUES_CONGOLAISES est introuvable.',
      );
      continue;
    }

    if (ligneLecture.domaine !== 'LANGUES') {
      ajouterProbleme(
        problemes,
        fichier,
        `programmes[${classeCode}].LECT_ECRITURE_EN_LANGUES_CONGOLAISES.domaine`,
        'Le domaine doit etre LANGUES.',
      );
    }

    if (Object.prototype.hasOwnProperty.call(ligneLecture, 'sousDomaine')) {
      ajouterProbleme(
        problemes,
        fichier,
        `programmes[${classeCode}].LECT_ECRITURE_EN_LANGUES_CONGOLAISES.sousDomaine`,
        'Cette ligne ne doit pas porter de sous-domaine.',
      );
    }
  }
}

function lirePonderation(
  valeur: unknown,
  fichier: string,
  chemin: string,
  problemes: ProblemeValidation[],
): PonderationJson | undefined {
  if (!estObjetJson(valeur)) {
    ajouterProbleme(problemes, fichier, chemin, 'La ponderation doit etre un objet.');
    return undefined;
  }

  const ponderation = {} as Partial<PonderationJson>;

  for (const cle of clesPonderation) {
    const valeurPonderation = valeur[cle];

    if (
      typeof valeurPonderation !== 'number'
      || !Number.isInteger(valeurPonderation)
      || valeurPonderation < 0
    ) {
      ajouterProbleme(
        problemes,
        fichier,
        `${chemin}.${cle}`,
        'La ponderation doit etre un entier positif ou nul.',
      );
      return undefined;
    }

    ponderation[cle] = valeurPonderation;
  }

  return ponderation as PonderationJson;
}

function obtenirTableauJson(
  fichier: string,
  cleTableau: string,
  problemes: ProblemeValidation[],
): readonly unknown[] {
  const document = lireJson(fichier, problemes);

  if (!estObjetJson(document)) {
    ajouterProbleme(problemes, fichier, '$', 'Le document JSON doit etre un objet.');
    return [];
  }

  const tableau = document[cleTableau];

  if (!Array.isArray(tableau)) {
    ajouterProbleme(problemes, fichier, cleTableau, `Le champ ${cleTableau} doit etre un tableau.`);
    return [];
  }

  return tableau;
}

function lireJson(fichier: string, problemes: ProblemeValidation[]): unknown {
  const cheminFichier = resolve(racineDonneesReference, fichier);

  try {
    return JSON.parse(readFileSync(cheminFichier, 'utf8')) as unknown;
  } catch (erreur) {
    ajouterProbleme(
      problemes,
      fichier,
      '$',
      `Lecture JSON impossible: ${decrireErreur(erreur)}.`,
    );

    return {};
  }
}

function lireChaineObligatoire(
  objet: ObjetJson,
  cle: string,
  fichier: string,
  chemin: string,
  problemes: ProblemeValidation[],
): string | undefined {
  const valeur = objet[cle];

  if (typeof valeur !== 'string' || valeur.trim().length === 0) {
    ajouterProbleme(problemes, fichier, `${chemin}.${cle}`, 'Une chaine non vide est obligatoire.');
    return undefined;
  }

  return valeur;
}

function lireChaineOptionnelle(
  objet: ObjetJson,
  cle: string,
  fichier: string,
  chemin: string,
  problemes: ProblemeValidation[],
): string | undefined {
  const valeur = objet[cle];

  if (valeur === undefined) {
    return undefined;
  }

  if (typeof valeur !== 'string' || valeur.trim().length === 0) {
    ajouterProbleme(problemes, fichier, `${chemin}.${cle}`, 'La chaine optionnelle doit etre non vide.');
    return undefined;
  }

  return valeur;
}

function lireEntierObligatoire(
  objet: ObjetJson,
  cle: string,
  fichier: string,
  chemin: string,
  problemes: ProblemeValidation[],
): number | undefined {
  const valeur = objet[cle];

  if (typeof valeur !== 'number' || !Number.isInteger(valeur)) {
    ajouterProbleme(problemes, fichier, `${chemin}.${cle}`, 'Un entier est obligatoire.');
    return undefined;
  }

  return valeur;
}

function lireBooleenObligatoire(
  objet: ObjetJson,
  cle: string,
  fichier: string,
  chemin: string,
  problemes: ProblemeValidation[],
): boolean | undefined {
  const valeur = objet[cle];

  if (typeof valeur !== 'boolean') {
    ajouterProbleme(problemes, fichier, `${chemin}.${cle}`, 'Un booleen est obligatoire.');
    return undefined;
  }

  return valeur;
}

function lireCodeReferenceObligatoire(
  objet: ObjetJson,
  cle: string,
  fichier: string,
  chemin: string,
  problemes: ProblemeValidation[],
): CodeReference | undefined {
  const valeur = objet[cle];

  if (typeof valeur === 'string' && valeur.trim().length > 0) {
    return valeur;
  }

  if (typeof valeur === 'number' && Number.isInteger(valeur)) {
    return valeur;
  }

  ajouterProbleme(
    problemes,
    fichier,
    `${chemin}.${cle}`,
    'Un code texte ou numerique non vide est obligatoire.',
  );

  return undefined;
}

function lireCodeReferenceNullable(
  objet: ObjetJson,
  cle: string,
  fichier: string,
  chemin: string,
  problemes: ProblemeValidation[],
): CodeReference | null | undefined {
  const valeur = objet[cle];

  if (valeur === null) {
    return null;
  }

  return lireCodeReferenceObligatoire(objet, cle, fichier, chemin, problemes);
}

function verifierCodeUnique<TValeur>(
  valeurs: ReadonlyMap<string, TValeur>,
  code: string,
  fichier: string,
  chemin: string,
  problemes: ProblemeValidation[],
  typeObjet: string,
): void {
  if (valeurs.has(code)) {
    ajouterProbleme(
      problemes,
      fichier,
      `${chemin}.code`,
      `Le code ${code} du ${typeObjet} est duplique.`,
    );
  }
}

function verifierOrdreUnique(
  ordres: Set<number>,
  ordre: number,
  fichier: string,
  chemin: string,
  problemes: ProblemeValidation[],
): void {
  if (ordres.has(ordre)) {
    ajouterProbleme(
      problemes,
      fichier,
      `${chemin}.ordreAffichage`,
      `L'ordre ${ordre} est duplique.`,
    );
  }

  ordres.add(ordre);
}

function verifierOrdresContigus(
  ordres: ReadonlySet<number>,
  totalLignes: number,
  fichier: string,
  chemin: string,
  problemes: ProblemeValidation[],
): void {
  for (let ordre = 1; ordre <= totalLignes; ordre += 1) {
    if (!ordres.has(ordre)) {
      ajouterProbleme(
        problemes,
        fichier,
        chemin,
        `L'ordre ${ordre} est absent dans les lignes du programme.`,
      );
    }
  }
}

function verifierAbsenceChamp(
  objet: ObjetJson,
  cle: string,
  fichier: string,
  chemin: string,
  problemes: ProblemeValidation[],
): void {
  if (Object.prototype.hasOwnProperty.call(objet, cle)) {
    ajouterProbleme(problemes, fichier, `${chemin}.${cle}`, `Le champ ${cle} est interdit ici.`);
  }
}

function ajouterProbleme(
  problemes: ProblemeValidation[],
  fichier: string,
  chemin: string,
  message: string,
): void {
  problemes.push({ fichier, chemin, message });
}

function afficherProblemes(problemes: readonly ProblemeValidation[]): void {
  console.error('Validation des donnees de reference echouee.');

  for (const probleme of problemes) {
    console.error(`- ${probleme.fichier} :: ${probleme.chemin} :: ${probleme.message}`);
  }
}

function estObjetJson(valeur: unknown): valeur is ObjetJson {
  return typeof valeur === 'object' && valeur !== null && !Array.isArray(valeur);
}

function normaliserCodeReference(code: CodeReference): string {
  return String(code);
}

function decrireErreur(erreur: unknown): string {
  if (erreur instanceof Error) {
    return erreur.message;
  }

  if (typeof erreur === 'string') {
    return erreur;
  }

  return 'Erreur inconnue';
}

if (process.argv[1] !== undefined && resolve(process.argv[1]) === cheminScript) {
  try {
    const bilan = validerDonneesReferenceReferentielAcademique();

    console.log('Validation des donnees de reference du referentiel academique reussie.', bilan);
  } catch (erreur) {
    if (erreur instanceof Error) {
      console.error(erreur.message);
    } else {
      console.error('Validation des donnees de reference echouee.');
    }

    process.exitCode = 1;
  }
}
