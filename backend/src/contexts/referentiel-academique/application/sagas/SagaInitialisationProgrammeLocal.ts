import { EcoleSortie } from '../dto/output/EcoleSortie';
import { AnneeScolaireSortie } from '../dto/output/AnneeScolaireSortie';
import { ClasseAcademiqueSortie } from '../dto/output/ClasseAcademiqueSortie';
import { ProgrammeNiveauSortie } from '../dto/output/ProgrammeNiveauSortie';
import { ReferentielProgrammeSortie } from '../dto/output/ReferentielProgrammeSortie';
import { ErreurUseCaseInvalide } from '../exceptions/ErreurUseCaseInvalide';
import { OrchestrateurInitialisationProgrammeNiveau } from '../services/OrchestrateurInitialisationProgrammeNiveau';
import { InitialiserProgrammeNiveauEntree } from '../dto/input/InitialiserProgrammeNiveauEntree';

// Cette interface definit la dependance de chargement d'une ecole pour la saga.
export interface ChargeurEcoleSagaInitialisationProgrammeLocal {
  // Cette methode charge l'ecole cible du workflow.
  chargerEcole(idEcole: string): Promise<EcoleSortie | null>;
}

// Cette interface definit la dependance de chargement d'une annee scolaire pour la saga.
export interface ChargeurAnneeScolaireSagaInitialisationProgrammeLocal {
  // Cette methode charge l'annee scolaire cible du workflow.
  chargerAnneeScolaire(idAnneeScolaire: string): Promise<AnneeScolaireSortie | null>;
}

// Cette interface definit la dependance de chargement d'une classe academique pour la saga.
export interface ChargeurClasseAcademiqueSagaInitialisationProgrammeLocal {
  // Cette methode charge la classe academique cible du workflow.
  chargerClasseAcademique(idClasseAcademique: string): Promise<ClasseAcademiqueSortie | null>;
}

// Cette interface definit la dependance de chargement d'un referentiel programme pour la saga.
export interface ChargeurReferentielProgrammeSagaInitialisationProgrammeLocal {
  // Cette methode charge le referentiel officiel cible du workflow.
  chargerReferentielProgramme(idReferentielProgramme: string): Promise<ReferentielProgrammeSortie | null>;
}

// Cette interface definit la recherche d'un programme deja existant pour la meme ecole, annee et classe.
export interface RechercheProgrammeExistantSagaInitialisationProgrammeLocal {
  // Cette methode recherche un programme local deja initialise dans le meme contexte.
  rechercherProgrammeExistant(
    idEcole: string,
    idAnneeScolaire: string,
    idClasseAcademique: string,
  ): Promise<ProgrammeNiveauSortie | null>;
}

// Cette interface definit la publication d'evenements applicatifs apres initialisation.
export interface PublicateurEvenementsSagaInitialisationProgrammeLocal {
  // Cette methode publie les evenements necessaires a la fin du workflow.
  publierEvenementsNecessaires(
    programmeNiveau: ProgrammeNiveauSortie,
  ): Promise<readonly string[]>;
}

// Cette interface represente l'entree de la saga d'initialisation d'un programme local.
export interface EntreeSagaInitialisationProgrammeLocal extends InitialiserProgrammeNiveauEntree {}

// Cette interface represente la sortie de la saga d'initialisation d'un programme local.
export interface SortieSagaInitialisationProgrammeLocal {
  ecole: EcoleSortie;
  anneeScolaire: AnneeScolaireSortie;
  classeAcademique: ClasseAcademiqueSortie;
  referentielProgramme: ReferentielProgrammeSortie;
  programmeNiveau: ProgrammeNiveauSortie;
  evenementsPublies: readonly string[];
}

// Cette saga orchestre le workflow complet d'initialisation d'un programme local.
export class SagaInitialisationProgrammeLocal {
  private readonly chargeurEcole: ChargeurEcoleSagaInitialisationProgrammeLocal;
  private readonly chargeurAnneeScolaire: ChargeurAnneeScolaireSagaInitialisationProgrammeLocal;
  private readonly chargeurClasseAcademique: ChargeurClasseAcademiqueSagaInitialisationProgrammeLocal;
  private readonly chargeurReferentielProgramme: ChargeurReferentielProgrammeSagaInitialisationProgrammeLocal;
  private readonly rechercheProgrammeExistant: RechercheProgrammeExistantSagaInitialisationProgrammeLocal;
  private readonly orchestrateurInitialisationProgrammeNiveau: OrchestrateurInitialisationProgrammeNiveau;
  private readonly publicateurEvenements: PublicateurEvenementsSagaInitialisationProgrammeLocal;

  // Ce constructeur injecte les dependances du workflow d'initialisation d'un programme local.
  constructor(
    chargeurEcole: ChargeurEcoleSagaInitialisationProgrammeLocal,
    chargeurAnneeScolaire: ChargeurAnneeScolaireSagaInitialisationProgrammeLocal,
    chargeurClasseAcademique: ChargeurClasseAcademiqueSagaInitialisationProgrammeLocal,
    chargeurReferentielProgramme: ChargeurReferentielProgrammeSagaInitialisationProgrammeLocal,
    rechercheProgrammeExistant: RechercheProgrammeExistantSagaInitialisationProgrammeLocal,
    orchestrateurInitialisationProgrammeNiveau: OrchestrateurInitialisationProgrammeNiveau,
    publicateurEvenements: PublicateurEvenementsSagaInitialisationProgrammeLocal,
  ) {
    this.chargeurEcole = chargeurEcole;
    this.chargeurAnneeScolaire = chargeurAnneeScolaire;
    this.chargeurClasseAcademique = chargeurClasseAcademique;
    this.chargeurReferentielProgramme = chargeurReferentielProgramme;
    this.rechercheProgrammeExistant = rechercheProgrammeExistant;
    this.orchestrateurInitialisationProgrammeNiveau = orchestrateurInitialisationProgrammeNiveau;
    this.publicateurEvenements = publicateurEvenements;
  }

  // Cette methode execute les etapes completes de la saga d'initialisation d'un programme local.
  public async executer(
    entree: EntreeSagaInitialisationProgrammeLocal,
  ): Promise<SortieSagaInitialisationProgrammeLocal> {
    const entreeValidee = this.validerEntree(entree);
    const ecole = await this.chargeurEcole.chargerEcole(entreeValidee.idEcole);

    if (ecole === null) {
      throw new ErreurUseCaseInvalide(
        "L'ecole cible de l'initialisation est introuvable.",
      );
    }

    if (!ecole.actif) {
      throw new ErreurUseCaseInvalide(
        "Une ecole inactive ne peut pas initialiser un programme local.",
      );
    }

    const anneeScolaire = await this.chargeurAnneeScolaire.chargerAnneeScolaire(
      entreeValidee.idAnneeScolaire,
    );

    if (anneeScolaire === null) {
      throw new ErreurUseCaseInvalide(
        "L'annee scolaire cible de l'initialisation est introuvable.",
      );
    }

    if (anneeScolaire.idEcole !== entreeValidee.idEcole) {
      throw new ErreurUseCaseInvalide(
        "L'annee scolaire fournie n'est pas coherente avec l'ecole cible.",
      );
    }

    const classeAcademique = await this.chargeurClasseAcademique.chargerClasseAcademique(
      entreeValidee.idClasseAcademique,
    );

    if (classeAcademique === null) {
      throw new ErreurUseCaseInvalide(
        "La classe academique cible de l'initialisation est introuvable.",
      );
    }

    const referentielProgramme = await this.chargeurReferentielProgramme.chargerReferentielProgramme(
      entreeValidee.idReferentielProgramme,
    );

    if (referentielProgramme === null) {
      throw new ErreurUseCaseInvalide(
        "Le referentiel officiel cible de l'initialisation est introuvable.",
      );
    }

    if (referentielProgramme.idClasseAcademique !== entreeValidee.idClasseAcademique) {
      throw new ErreurUseCaseInvalide(
        "Le referentiel officiel fourni n'est pas coherent avec la classe academique cible.",
      );
    }

    const programmeExistant = await this.rechercheProgrammeExistant.rechercherProgrammeExistant(
      entreeValidee.idEcole,
      entreeValidee.idAnneeScolaire,
      entreeValidee.idClasseAcademique,
    );

    if (programmeExistant !== null) {
      throw new ErreurUseCaseInvalide(
        'Un programme local existe deja pour cette ecole, cette annee et cette classe academique.',
      );
    }

    const resultatInitialisation = await this.orchestrateurInitialisationProgrammeNiveau
      .initialiserProgrammeNiveau(entreeValidee);
    const evenementsPublies = await this.publicateurEvenements.publierEvenementsNecessaires(
      resultatInitialisation.programmeNiveau,
    );

    return {
      ecole,
      anneeScolaire,
      classeAcademique,
      referentielProgramme,
      programmeNiveau: resultatInitialisation.programmeNiveau,
      evenementsPublies,
    };
  }

  private validerEntree(
    entree: EntreeSagaInitialisationProgrammeLocal,
  ): EntreeSagaInitialisationProgrammeLocal {
    if (entree === null || entree === undefined) {
      throw new ErreurUseCaseInvalide(
        "L'entree de la saga d'initialisation d'un programme local est obligatoire.",
      );
    }

    return {
      idEcole: this.validerTexteObligatoire(entree.idEcole, 'idEcole'),
      idAnneeScolaire: this.validerTexteObligatoire(entree.idAnneeScolaire, 'idAnneeScolaire'),
      idClasseAcademique: this.validerTexteObligatoire(entree.idClasseAcademique, 'idClasseAcademique'),
      idReferentielProgramme: this.validerTexteObligatoire(entree.idReferentielProgramme, 'idReferentielProgramme'),
      idVersionReferentielProgramme: this.validerTexteObligatoire(
        entree.idVersionReferentielProgramme,
        'idVersionReferentielProgramme',
      ),
      creePar: this.validerTexteObligatoire(entree.creePar, 'creePar'),
    };
  }

  private validerTexteObligatoire(valeur: string, nomChamp: string): string {
    if (typeof valeur !== 'string') {
      throw new ErreurUseCaseInvalide(
        `Le champ "${nomChamp}" doit etre une chaine de caracteres.`,
      );
    }

    const valeurNettoyee = valeur.trim();

    if (valeurNettoyee.length === 0) {
      throw new ErreurUseCaseInvalide(
        `Le champ "${nomChamp}" est obligatoire.`,
      );
    }

    return valeurNettoyee;
  }
}
