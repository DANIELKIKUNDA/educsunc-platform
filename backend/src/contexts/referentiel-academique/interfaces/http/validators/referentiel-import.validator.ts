import {
  type EnregistrementClasseAcademiqueJson,
  ImporterClassesAcademiquesDepuisJsonEntree,
} from '../../../application/dto/input/ImporterClassesAcademiquesDepuisJsonEntree';
import {
  type EnregistrementReferentielCoursJson,
  ImporterCoursAcademiquesDepuisJsonEntree,
} from '../../../application/dto/input/ImporterCoursAcademiquesDepuisJsonEntree';
import {
  ImporterLignesProgrammeDepuisJsonEntree,
} from '../../../application/dto/input/ImporterLignesProgrammeDepuisJsonEntree';
import { EnregistrementLigneReferentielProgrammeJson } from '../../../application/dto/input/EnregistrementLigneReferentielProgrammeJson';
import {
  type EnregistrementOptionEtudeJson,
  ImporterOptionsDepuisJsonEntree,
} from '../../../application/dto/input/ImporterOptionsDepuisJsonEntree';
import {
  type EnregistrementReferentielProgrammeJson,
  ImporterProgrammesAcademiquesDepuisJsonEntree,
} from '../../../application/dto/input/ImporterProgrammesAcademiquesDepuisJsonEntree';
import {
  type EnregistrementSectionScolaireJson,
  ImporterSectionsDepuisJsonEntree,
} from '../../../application/dto/input/ImporterSectionsDepuisJsonEntree';
import { ActiverVersionReferentielEntree } from '../../../application/dto/input/ActiverVersionReferentielEntree';
import { ComparerDeuxVersionsReferentielEntree } from '../../../application/dto/input/ComparerDeuxVersionsReferentielEntree';
import { ConsulterReferentielProgrammeEntree } from '../../../application/dto/input/ConsulterReferentielProgrammeEntree';
import { ListerReferentielsParClasseAcademiqueEntree } from '../../../application/dto/input/ListerReferentielsParClasseAcademiqueEntree';
import { ListerReferentielsCoursEntree } from '../../../application/dto/input/ListerReferentielsCoursEntree';
import { PublierVersionReferentielEntree } from '../../../application/dto/input/PublierVersionReferentielEntree';
import type { ProprietesPonderationEvaluation } from '../../../domain/value-objects/PonderationEvaluation';
import { SourceLigneProgramme } from '../../../domain/value-objects/SourceLigneProgramme';
import { SourceReferentiel } from '../../../domain/value-objects/SourceReferentiel';
import { TypeStructureEvaluation } from '../../../domain/value-objects/TypeStructureEvaluation';
import { OutilsValidationHttpReferentielAcademique } from './OutilsValidationHttpReferentielAcademique';

// Ce validateur gere la validation HTTP des routes de referentiels et d'import JSON.
export class ValidateurReferentielImportHttp {
  // Cette methode valide la requete HTTP d'import des sections scolaires.
  public static validerImportSections(
    corps: unknown,
    importePar: string,
  ): ImporterSectionsDepuisJsonEntree {
    const donnees = OutilsValidationHttpReferentielAcademique.obtenirObjet(corps, 'corps');
    const sections = OutilsValidationHttpReferentielAcademique.lireTableauRequis(
      donnees,
      'sections',
    );

    return {
      sections: sections.map((section, index) => this.validerSection(section, index)),
      importePar,
    };
  }

  // Cette methode valide la requete HTTP d'import des options d'etude.
  public static validerImportOptions(
    corps: unknown,
    importePar: string,
  ): ImporterOptionsDepuisJsonEntree {
    const donnees = OutilsValidationHttpReferentielAcademique.obtenirObjet(corps, 'corps');
    const options = OutilsValidationHttpReferentielAcademique.lireTableauRequis(
      donnees,
      'options',
    );

    return {
      options: options.map((option, index) => this.validerOption(option, index)),
      importePar,
    };
  }

  // Cette methode valide la requete HTTP d'import des classes academiques.
  public static validerImportClasses(
    corps: unknown,
    importePar: string,
  ): ImporterClassesAcademiquesDepuisJsonEntree {
    const donnees = OutilsValidationHttpReferentielAcademique.obtenirObjet(corps, 'corps');
    const classesAcademiques = OutilsValidationHttpReferentielAcademique.lireTableauRequis(
      donnees,
      'classesAcademiques',
    );

    return {
      classesAcademiques: classesAcademiques.map((classeAcademique, index) =>
        this.validerClasseAcademique(classeAcademique, index)
      ),
      importePar,
    };
  }

  // Cette methode valide la requete HTTP d'import des cours academiques.
  public static validerImportCours(
    corps: unknown,
    importePar: string,
  ): ImporterCoursAcademiquesDepuisJsonEntree {
    const donnees = OutilsValidationHttpReferentielAcademique.obtenirObjet(corps, 'corps');
    const cours = OutilsValidationHttpReferentielAcademique.lireTableauRequis(
      donnees,
      'cours',
    );

    return {
      cours: cours.map((coursAcademique, index) => this.validerCours(coursAcademique, index)),
      importePar,
    };
  }

  // Cette methode valide la requete HTTP d'import des programmes academiques.
  public static validerImportProgrammes(
    corps: unknown,
    importePar: string,
  ): ImporterProgrammesAcademiquesDepuisJsonEntree {
    const donnees = OutilsValidationHttpReferentielAcademique.obtenirObjet(corps, 'corps');
    const programmes = OutilsValidationHttpReferentielAcademique.lireTableauRequis(
      donnees,
      'programmes',
    );

    return {
      programmes: programmes.map((programme, index) => this.validerProgramme(programme, index)),
      importePar,
    };
  }

  // Cette methode valide la requete HTTP d'import des lignes de programme.
  public static validerImportLignes(
    corps: unknown,
    importePar: string,
  ): ImporterLignesProgrammeDepuisJsonEntree {
    const donnees = OutilsValidationHttpReferentielAcademique.obtenirObjet(corps, 'corps');
    const lignes = OutilsValidationHttpReferentielAcademique.lireTableauRequis(
      donnees,
      'lignes',
    );

    return {
      lignes: lignes.map((ligne, index) => this.validerLigneProgramme(ligne, index)),
      typeStructureEvaluation: OutilsValidationHttpReferentielAcademique.lireEnumRequis(
        donnees,
        'typeStructureEvaluation',
        TypeStructureEvaluation,
      ),
      importePar,
    };
  }

  // Cette methode valide la requete HTTP de publication d'une version de referentiel.
  public static validerPublicationVersion(
    corps: unknown,
    publiePar: string,
  ): PublierVersionReferentielEntree {
    const donnees = OutilsValidationHttpReferentielAcademique.obtenirObjet(corps, 'corps');

    OutilsValidationHttpReferentielAcademique.validerChampsRequis(
      donnees,
      {
        idReferentielProgramme: true,
        codeVersion: true,
        anneeReference: true,
        datePublication: true,
        sourceImport: true,
      },
      'publication-version-referentiel',
    );

    return {
      idReferentielProgramme: OutilsValidationHttpReferentielAcademique.lireChaineRequise(
        donnees,
        'idReferentielProgramme',
      ),
      codeVersion: OutilsValidationHttpReferentielAcademique.lireChaineRequise(
        donnees,
        'codeVersion',
      ),
      anneeReference: OutilsValidationHttpReferentielAcademique.lireChaineRequise(
        donnees,
        'anneeReference',
      ),
      datePublication: OutilsValidationHttpReferentielAcademique.lireDateRequise(
        donnees,
        'datePublication',
      ),
      sourceImport: OutilsValidationHttpReferentielAcademique.lireEnumRequis(
        donnees,
        'sourceImport',
        SourceReferentiel,
      ),
      motifPublication: OutilsValidationHttpReferentielAcademique.lireChaineOptionnelle(
        donnees,
        'motifPublication',
      ),
      publiePar,
    };
  }

  // Cette methode valide la requete HTTP d'activation d'une version de referentiel.
  public static validerActivationVersion(
    parametres: unknown,
    corps: unknown,
    activePar: string,
  ): ActiverVersionReferentielEntree {
    const donneesParametres = OutilsValidationHttpReferentielAcademique.obtenirObjet(
      parametres,
      'parametres',
    );
    OutilsValidationHttpReferentielAcademique.obtenirObjet(corps, 'corps');

    return {
      idVersionReferentielProgramme:
        OutilsValidationHttpReferentielAcademique.lireChaineRequise(
          donneesParametres,
          'id',
        ),
      activePar,
    };
  }

  // Cette methode valide la requete HTTP de comparaison de deux versions.
  public static validerComparaison(
    corps: unknown,
  ): ComparerDeuxVersionsReferentielEntree {
    const donnees = OutilsValidationHttpReferentielAcademique.obtenirObjet(corps, 'corps');

    OutilsValidationHttpReferentielAcademique.validerChampsRequis(
      donnees,
      {
        idClasseAcademique: true,
        versionReferentielSource: true,
        versionReferentielCible: true,
      },
      'comparaison-versions-referentiel',
    );

    return {
      idClasseAcademique: OutilsValidationHttpReferentielAcademique.lireChaineRequise(
        donnees,
        'idClasseAcademique',
      ),
      versionReferentielSource:
        OutilsValidationHttpReferentielAcademique.lireChaineRequise(
          donnees,
          'versionReferentielSource',
        ),
      versionReferentielCible:
        OutilsValidationHttpReferentielAcademique.lireChaineRequise(
          donnees,
          'versionReferentielCible',
        ),
    };
  }

  // Cette methode valide la requete HTTP de liste des referentiels programmes.
  public static validerListeReferentiels(
    query: unknown,
  ): ListerReferentielsParClasseAcademiqueEntree {
    const donnees = OutilsValidationHttpReferentielAcademique.obtenirObjet(query, 'query');
    const pagination = OutilsValidationHttpReferentielAcademique.lirePagination(query);

    return {
      idClasseAcademique: OutilsValidationHttpReferentielAcademique.lireChaineRequise(
        donnees,
        'idClasseAcademique',
      ),
      page: pagination.page,
      taillePage: pagination.taillePage,
    };
  }

  // Cette methode valide la requete HTTP de liste des cours officiels.
  public static validerListeReferentielsCours(
    query: unknown,
  ): ListerReferentielsCoursEntree {
    const pagination = OutilsValidationHttpReferentielAcademique.lirePagination(query);

    return {
      page: pagination.page,
      taillePage: pagination.taillePage,
    };
  }

  // Cette methode valide la requete HTTP de consultation d'un referentiel programme.
  public static validerConsultationReferentiel(
    parametres: unknown,
  ): ConsulterReferentielProgrammeEntree {
    const donnees = OutilsValidationHttpReferentielAcademique.obtenirObjet(
      parametres,
      'parametres',
    );

    return {
      idReferentielProgramme: OutilsValidationHttpReferentielAcademique.lireChaineRequise(
        donnees,
        'id',
      ),
    };
  }

  private static validerSection(
    valeur: unknown,
    index: number,
  ): EnregistrementSectionScolaireJson {
    const donnees = OutilsValidationHttpReferentielAcademique.obtenirObjet(
      valeur,
      `sections[${index}]`,
    );

    return {
      code: OutilsValidationHttpReferentielAcademique.lireChaineRequise(donnees, 'code'),
      libelle: OutilsValidationHttpReferentielAcademique.lireChaineRequise(
        donnees,
        'libelle',
      ),
      ordreAffichage: OutilsValidationHttpReferentielAcademique.lireNombreEntierRequis(
        donnees,
        'ordreAffichage',
      ),
    };
  }

  private static validerOption(
    valeur: unknown,
    index: number,
  ): EnregistrementOptionEtudeJson {
    const donnees = OutilsValidationHttpReferentielAcademique.obtenirObjet(
      valeur,
      `options[${index}]`,
    );

    return {
      code: OutilsValidationHttpReferentielAcademique.lireNombreEntierRequis(donnees, 'code'),
      libelle: OutilsValidationHttpReferentielAcademique.lireChaineRequise(
        donnees,
        'libelle',
      ),
      estTechnique: OutilsValidationHttpReferentielAcademique.lireBooleenRequis(
        donnees,
        'estTechnique',
      ),
      categorieTechnique: this.lireCategorieTechniqueOptionnelle(donnees),
      abreviation: OutilsValidationHttpReferentielAcademique.lireChaineOptionnelle(
        donnees,
        'abreviation',
      ),
      ordreAffichage: OutilsValidationHttpReferentielAcademique.lireNombreEntierOptionnel(
        donnees,
        'ordreAffichage',
      ),
    };
  }

  private static validerClasseAcademique(
    valeur: unknown,
    index: number,
  ): EnregistrementClasseAcademiqueJson {
    const donnees = OutilsValidationHttpReferentielAcademique.obtenirObjet(
      valeur,
      `classesAcademiques[${index}]`,
    );

    return {
      idSectionScolaire: OutilsValidationHttpReferentielAcademique.lireChaineRequise(
        donnees,
        'idSectionScolaire',
      ),
      idOptionEtude: OutilsValidationHttpReferentielAcademique.lireChaineOptionnelle(
        donnees,
        'idOptionEtude',
      ),
      code: OutilsValidationHttpReferentielAcademique.lireChaineRequise(donnees, 'code'),
      libelle: OutilsValidationHttpReferentielAcademique.lireChaineRequise(
        donnees,
        'libelle',
      ),
      ordrePedagogique: OutilsValidationHttpReferentielAcademique.lireNombreEntierRequis(
        donnees,
        'ordrePedagogique',
      ),
      cycle: OutilsValidationHttpReferentielAcademique.lireChaineRequise(donnees, 'cycle'),
      accepteOptions: OutilsValidationHttpReferentielAcademique.lireBooleenRequis(
        donnees,
        'accepteOptions',
      ),
      optionObligatoire: OutilsValidationHttpReferentielAcademique.lireBooleenRequis(
        donnees,
        'optionObligatoire',
      ),
      typeStructureEvaluation: OutilsValidationHttpReferentielAcademique.lireEnumRequis(
        donnees,
        'typeStructureEvaluation',
        TypeStructureEvaluation,
      ),
      estClasseTENASOSP: OutilsValidationHttpReferentielAcademique.lireBooleenOptionnel(
        donnees,
        'estClasseTENASOSP',
      ),
      estClasseEXETAT: OutilsValidationHttpReferentielAcademique.lireBooleenOptionnel(
        donnees,
        'estClasseEXETAT',
      ),
      estClasseFinaliste: OutilsValidationHttpReferentielAcademique.lireBooleenOptionnel(
        donnees,
        'estClasseFinaliste',
      ),
    };
  }

  private static lireCategorieTechniqueOptionnelle(
    donnees: Record<string, unknown>,
  ): EnregistrementOptionEtudeJson['categorieTechnique'] {
    const valeur = donnees.categorieTechnique;

    if (valeur === undefined) {
      return undefined;
    }

    if (valeur === null || valeur === 'GROUPE_1' || valeur === 'GROUPE_2') {
      return valeur;
    }

    throw new Error('Le champ categorieTechnique doit etre GROUPE_1, GROUPE_2 ou null.');
  }

  private static validerCours(
    valeur: unknown,
    index: number,
  ): EnregistrementReferentielCoursJson {
    const donnees = OutilsValidationHttpReferentielAcademique.obtenirObjet(
      valeur,
      `cours[${index}]`,
    );

    return {
      code: OutilsValidationHttpReferentielAcademique.lireChaineRequise(donnees, 'code'),
      libelle: OutilsValidationHttpReferentielAcademique.lireChaineRequise(
        donnees,
        'libelle',
      ),
      abreviation: OutilsValidationHttpReferentielAcademique.lireChaineOptionnelle(
        donnees,
        'abreviation',
      ),
      domaine: OutilsValidationHttpReferentielAcademique.lireChaineOptionnelle(
        donnees,
        'domaine',
      ),
      sousDomaine: OutilsValidationHttpReferentielAcademique.lireChaineOptionnelle(
        donnees,
        'sousDomaine',
      ),
    };
  }

  private static validerProgramme(
    valeur: unknown,
    index: number,
  ): EnregistrementReferentielProgrammeJson {
    const donnees = OutilsValidationHttpReferentielAcademique.obtenirObjet(
      valeur,
      `programmes[${index}]`,
    );
    const lignes = OutilsValidationHttpReferentielAcademique.lireTableauRequis(
      donnees,
      'lignes',
    );

    return {
      idClasseAcademique: OutilsValidationHttpReferentielAcademique.lireChaineRequise(
        donnees,
        'idClasseAcademique',
      ),
      typeStructureEvaluation: OutilsValidationHttpReferentielAcademique.lireEnumRequis(
        donnees,
        'typeStructureEvaluation',
        TypeStructureEvaluation,
      ),
      versionReferentiel: OutilsValidationHttpReferentielAcademique.lireChaineRequise(
        donnees,
        'versionReferentiel',
      ),
      datePublication: OutilsValidationHttpReferentielAcademique.lireDateRequise(
        donnees,
        'datePublication',
      ),
      lignes: lignes.map((ligne, ligneIndex) =>
        this.validerLigneProgramme(ligne, ligneIndex)
      ),
    };
  }

  private static validerLigneProgramme(
    valeur: unknown,
    index: number,
  ): EnregistrementLigneReferentielProgrammeJson {
    const donnees = OutilsValidationHttpReferentielAcademique.obtenirObjet(
      valeur,
      `lignes[${index}]`,
    );

    return {
      idReferentielCours: OutilsValidationHttpReferentielAcademique.lireChaineRequise(
        donnees,
        'idReferentielCours',
      ),
      ordreAffichage: OutilsValidationHttpReferentielAcademique.lireNombreEntierRequis(
        donnees,
        'ordreAffichage',
      ),
      obligatoire: OutilsValidationHttpReferentielAcademique.lireBooleenRequis(
        donnees,
        'obligatoire',
      ),
      aExamen: OutilsValidationHttpReferentielAcademique.lireBooleenRequis(
        donnees,
        'aExamen',
      ),
      estCalculable: OutilsValidationHttpReferentielAcademique.lireBooleenRequis(
        donnees,
        'estCalculable',
      ),
      sourceLigne: OutilsValidationHttpReferentielAcademique.lireEnumRequis(
        donnees,
        'sourceLigne',
        SourceLigneProgramme,
      ),
      ponderation: this.validerPonderation(
        OutilsValidationHttpReferentielAcademique.lireObjetRequis(donnees, 'ponderation'),
      ),
    };
  }

  private static validerPonderation(
    donnees: Record<string, unknown>,
  ): ProprietesPonderationEvaluation {
    return {
      maxP1: OutilsValidationHttpReferentielAcademique.lireNombreEntierRequis(donnees, 'maxP1'),
      maxP2: OutilsValidationHttpReferentielAcademique.lireNombreEntierRequis(donnees, 'maxP2'),
      maxEX1: OutilsValidationHttpReferentielAcademique.lireNombreEntierRequis(
        donnees,
        'maxEX1',
      ),
      maxP3: OutilsValidationHttpReferentielAcademique.lireNombreEntierRequis(donnees, 'maxP3'),
      maxP4: OutilsValidationHttpReferentielAcademique.lireNombreEntierRequis(donnees, 'maxP4'),
      maxEX2: OutilsValidationHttpReferentielAcademique.lireNombreEntierRequis(
        donnees,
        'maxEX2',
      ),
      maxP5: OutilsValidationHttpReferentielAcademique.lireNombreEntierRequis(donnees, 'maxP5'),
      maxP6: OutilsValidationHttpReferentielAcademique.lireNombreEntierRequis(donnees, 'maxP6'),
      maxEX3: OutilsValidationHttpReferentielAcademique.lireNombreEntierRequis(
        donnees,
        'maxEX3',
      ),
    };
  }
}
