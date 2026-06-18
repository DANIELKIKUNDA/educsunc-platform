import type {
  CloturerCaisseJourInput,
  ConsulterCaisseJourInput,
  OuvrirCaisseJourInput,
} from '../../../application/dto/input/CaisseEntreeDTO';
import type {
  ConsulterArrieresEleveInput,
  ConsulterDetteEleveInput,
  ConsulterFraisExigiblesEleveInput,
  ConsulterHistoriquePaiementsEleveInput,
} from '../../../application/dto/input/DettesEntreeDTO';
import type { ConsulterRapportFinancierJournalierInput } from '../../../application/dto/input/RapportsEntreeDTO';
import type { ConsulterPaiementsParCaissierInput } from '../../../application/dto/input/AnalysesFinancieresEntreeDTO';
import type { ConsulterPaiementsParTypeFraisInput } from '../../../application/dto/input/AnalysesFinancieresEntreeDTO';
import type { ConsulterFondsAnticipesInput } from '../../../application/dto/input/AnalysesFinancieresEntreeDTO';
import { ValidationHttpPaiementsFacturation } from './ValidationHttpPaiementsFacturation';

// Ce validator gere les identifiants et parametres techniques communs des routes HTTP paiements.
export class ParamValidator {
  // Cette methode valide le parametre idEleve pour la lecture d'une dette.
  public static validerDetteEleveAvecContexte(
    parametres: unknown,
    headers: unknown,
  ): ConsulterDetteEleveInput {
    const donnees = ValidationHttpPaiementsFacturation.obtenirObjet(parametres, 'params');

    return {
      idOrganisation: this.lireIdentifiantOrganisation(donnees, headers),
      idEcole: this.lireIdentifiantEcole(donnees, headers),
      idUtilisateur: this.lireIdentifiantUtilisateur(donnees, headers, 'idUtilisateur'),
      idEleve: ValidationHttpPaiementsFacturation.lireChaineRequise(donnees, 'idEleve'),
    };
  }

  public static validerArrieresEleveAvecContexte(
    parametres: unknown,
    headers: unknown,
  ): ConsulterArrieresEleveInput {
    const donnees = ValidationHttpPaiementsFacturation.obtenirObjet(parametres, 'params');

    return {
      idOrganisation: this.lireIdentifiantOrganisation(donnees, headers),
      idEcole: this.lireIdentifiantEcole(donnees, headers),
      idUtilisateur: this.lireIdentifiantUtilisateur(donnees, headers, 'idUtilisateur'),
      idEleve: ValidationHttpPaiementsFacturation.lireChaineRequise(donnees, 'idEleve'),
    };
  }

  // Cette methode valide le parametre idEleve pour la lecture des frais exigibles.
  public static validerFraisExigiblesAvecContexte(
    parametres: unknown,
    headers: unknown,
  ): ConsulterFraisExigiblesEleveInput {
    const donnees = ValidationHttpPaiementsFacturation.obtenirObjet(parametres, 'params');

    return {
      idOrganisation: this.lireIdentifiantOrganisation(donnees, headers),
      idEcole: this.lireIdentifiantEcole(donnees, headers),
      idUtilisateur: this.lireIdentifiantUtilisateur(donnees, headers, 'idUtilisateur'),
      idEleve: ValidationHttpPaiementsFacturation.lireChaineRequise(donnees, 'idEleve'),
    };
  }

  // Cette methode valide le parametre idEleve pour l'historique des paiements.
  public static validerHistoriquePaiements(
    parametres: unknown,
    headers: unknown,
  ): ConsulterHistoriquePaiementsEleveInput {
    const donnees = ValidationHttpPaiementsFacturation.obtenirObjet(parametres, 'params');

    return {
      idOrganisation: this.lireIdentifiantOrganisation(donnees, headers),
      idEcole: this.lireIdentifiantEcole(donnees, headers),
      idUtilisateur: this.lireIdentifiantUtilisateur(donnees, headers, 'idUtilisateur'),
      idEleve: ValidationHttpPaiementsFacturation.lireChaineRequise(donnees, 'idEleve'),
    };
  }

  // Cette methode valide le corps HTTP d'ouverture de caisse.
  public static validerOuvertureCaisse(
    corps: unknown,
    headers: unknown,
  ): OuvrirCaisseJourInput {
    const donnees = ValidationHttpPaiementsFacturation.obtenirObjet(corps, 'body');

    return {
      idOrganisation: this.lireIdentifiantOrganisation(donnees, headers),
      idEcole: this.lireIdentifiantEcole(donnees, headers),
      date: ValidationHttpPaiementsFacturation.lireDateTexteRequise(donnees, 'date'),
      idUtilisateur: this.lireIdentifiantUtilisateur(donnees, headers, 'idUtilisateur'),
    };
  }

  // Cette methode valide les parametres de consultation de la caisse du jour.
  public static validerConsultationCaisse(
    query: unknown,
    headers: unknown,
  ): ConsulterCaisseJourInput {
    const donnees = ValidationHttpPaiementsFacturation.obtenirObjet(query, 'query');

    return {
      idOrganisation: this.lireIdentifiantOrganisation(donnees, headers),
      idEcole: this.lireIdentifiantEcole(donnees, headers),
      date: ValidationHttpPaiementsFacturation.lireDateTexteRequise(donnees, 'date'),
      idUtilisateur: this.lireIdentifiantUtilisateur(donnees, headers, 'idUtilisateur'),
    };
  }

  public static validerConsultationRapportFinancierJournalier(
    query: unknown,
    headers: unknown,
  ): ConsulterRapportFinancierJournalierInput {
    const donnees = ValidationHttpPaiementsFacturation.obtenirObjet(query, 'query');

    return {
      idOrganisation: this.lireIdentifiantOrganisation(donnees, headers),
      idEcole: this.lireIdentifiantEcole(donnees, headers),
      date: ValidationHttpPaiementsFacturation.lireDateTexteRequise(donnees, 'date'),
      idUtilisateur: this.lireIdentifiantUtilisateur(donnees, headers, 'idUtilisateur'),
    };
  }

  public static validerConsultationPaiementsParCaissier(
    query: unknown,
    headers: unknown,
  ): ConsulterPaiementsParCaissierInput {
    const donnees = ValidationHttpPaiementsFacturation.obtenirObjet(query, 'query');

    return {
      idOrganisation: this.lireIdentifiantOrganisation(donnees, headers),
      idEcole: this.lireIdentifiantEcole(donnees, headers),
      idUtilisateur: this.lireIdentifiantUtilisateur(donnees, headers, 'idUtilisateur'),
      dateDebut: ValidationHttpPaiementsFacturation.lireChaineOptionnelle(donnees, 'dateDebut'),
      dateFin: ValidationHttpPaiementsFacturation.lireChaineOptionnelle(donnees, 'dateFin'),
    };
  }

  public static validerConsultationPaiementsParTypeFrais(
    query: unknown,
    headers: unknown,
  ): ConsulterPaiementsParTypeFraisInput {
    const donnees = ValidationHttpPaiementsFacturation.obtenirObjet(query, 'query');

    return {
      idOrganisation: this.lireIdentifiantOrganisation(donnees, headers),
      idEcole: this.lireIdentifiantEcole(donnees, headers),
      idUtilisateur: this.lireIdentifiantUtilisateur(donnees, headers, 'idUtilisateur'),
      dateDebut: ValidationHttpPaiementsFacturation.lireChaineOptionnelle(donnees, 'dateDebut'),
      dateFin: ValidationHttpPaiementsFacturation.lireChaineOptionnelle(donnees, 'dateFin'),
    };
  }

  public static validerConsultationFondsAnticipes(
    query: unknown,
    headers: unknown,
  ): ConsulterFondsAnticipesInput {
    const donnees = ValidationHttpPaiementsFacturation.obtenirObjet(query, 'query');

    return {
      idOrganisation: this.lireIdentifiantOrganisation(donnees, headers),
      idEcole: this.lireIdentifiantEcole(donnees, headers),
      idUtilisateur: this.lireIdentifiantUtilisateur(donnees, headers, 'idUtilisateur'),
      dateDebut: ValidationHttpPaiementsFacturation.lireChaineOptionnelle(donnees, 'dateDebut'),
      dateFin: ValidationHttpPaiementsFacturation.lireChaineOptionnelle(donnees, 'dateFin'),
    };
  }

  // Cette methode valide le corps HTTP de cloture d'une caisse.
  public static validerClotureCaisse(
    corps: unknown,
    headers: unknown,
  ): CloturerCaisseJourInput {
    const donnees = ValidationHttpPaiementsFacturation.obtenirObjet(corps, 'body');

    return {
      idOrganisation: this.lireIdentifiantOrganisation(donnees, headers),
      idEcole: this.lireIdentifiantEcole(donnees, headers),
      idCaisseJour: ValidationHttpPaiementsFacturation.lireChaineRequise(donnees, 'idCaisseJour'),
      montantPhysiqueDeclare:
        donnees.montantPhysiqueDeclare === undefined
          ? undefined
          : ValidationHttpPaiementsFacturation.lireMontantRequis(
            donnees,
            'montantPhysiqueDeclare',
          ),
      observation: ValidationHttpPaiementsFacturation.lireChaineOptionnelle(
        donnees,
        'observation',
      ),
      clotureePar: this.lireIdentifiantUtilisateur(donnees, headers, 'clotureePar'),
    };
  }

  // Cette methode retrouve l'ecole cible depuis le corps ou le header tenant.
  public static lireIdentifiantEcole(
    donnees: Record<string, unknown>,
    headers: unknown,
  ): string {
    return (
      ValidationHttpPaiementsFacturation.lireChaineOptionnelle(donnees, 'idEcole')
      ?? ValidationHttpPaiementsFacturation.lireHeaderChaine(headers, 'x-tenant-id')
      ?? this.creerErreurIdentifiant('idEcole')
    );
  }

  // Cette methode retrouve l'organisation cible depuis le corps ou le header.
  public static lireIdentifiantOrganisation(
    donnees: Record<string, unknown>,
    headers: unknown,
  ): string {
    return (
      ValidationHttpPaiementsFacturation.lireChaineOptionnelle(donnees, 'idOrganisation')
      ?? ValidationHttpPaiementsFacturation.lireHeaderChaine(headers, 'x-organisation-id')
      ?? this.creerErreurIdentifiant('idOrganisation')
    );
  }

  // Cette methode retrouve l'utilisateur courant depuis le corps ou le header.
  public static lireIdentifiantUtilisateur(
    donnees: Record<string, unknown>,
    headers: unknown,
    nomChamp: string,
  ): string {
    return (
      ValidationHttpPaiementsFacturation.lireChaineOptionnelle(donnees, nomChamp)
      ?? ValidationHttpPaiementsFacturation.lireHeaderChaine(headers, 'x-user-id')
      ?? this.creerErreurIdentifiant(nomChamp)
    );
  }

  // Cette methode leve une erreur simple lorsqu'un identifiant technique obligatoire manque.
  private static creerErreurIdentifiant(nomChamp: string): never {
    throw new Error(`Le champ "${nomChamp}" est obligatoire.`);
  }
}
