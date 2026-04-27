import { RacineAgregat } from '../../../../shared/domain/AggregateRoot';
import { EvenementParcours } from '../entities/EvenementParcours';
import { EvenementParcoursAjoute } from '../events/EvenementParcoursAjoute';
import { ParcoursEleveReconstruit } from '../events/ParcoursEleveReconstruit';
import { TransitionParcoursRefusee } from '../events/TransitionParcoursRefusee';
import { ErreurParcoursIncoherent } from '../exceptions/ErreurParcoursIncoherent';
import { ErreurTransitionParcoursInterdite } from '../exceptions/ErreurTransitionParcoursInterdite';
import { TypeEvenementParcours } from '../value-objects/TypeEvenementParcours';
import { UUID } from '../value-objects/TypesPrimitifs';

// Ce fichier porte l'agregat ParcoursScolaireEleve, memoire immutable des evenements scolaires.
export interface ProprietesParcoursScolaireEleve {
  idParcoursScolaireEleve: UUID;
  idOrganisation: UUID;
  idEcole: UUID;
  idEleve: UUID;
  historique: EvenementParcours[];
  version: number;
}

/**
 * Cet agregat conserve l'historique complet d'un eleve et interdit la perte d'evenements.
 */
export class ParcoursScolaireEleve extends RacineAgregat<UUID> {
  private idOrganisation: UUID;
  private idEcole: UUID;
  private idEleve: UUID;
  private historique: EvenementParcours[];
  private version: number;

  // Ce constructeur reconstitue un parcours scolaire complet depuis son historique.
  constructor(proprietes: ProprietesParcoursScolaireEleve) {
    super(ParcoursScolaireEleve.nettoyerTexteObligatoire(proprietes.idParcoursScolaireEleve, 'idParcoursScolaireEleve'));
    this.idOrganisation = ParcoursScolaireEleve.nettoyerTexteObligatoire(proprietes.idOrganisation, 'idOrganisation');
    this.idEcole = ParcoursScolaireEleve.nettoyerTexteObligatoire(proprietes.idEcole, 'idEcole');
    this.idEleve = ParcoursScolaireEleve.nettoyerTexteObligatoire(proprietes.idEleve, 'idEleve');
    this.historique = [...proprietes.historique].sort((a, b) => a.obtenirDateEvenement().getTime() - b.obtenirDateEvenement().getTime());
    this.version = ParcoursScolaireEleve.validerVersion(proprietes.version);
    this.verifierOrdreChronologique();
  }

  /** Cree un parcours vide pour un eleve. */
  public static creer(idParcoursScolaireEleve: UUID, idOrganisation: UUID, idEcole: UUID, idEleve: UUID): ParcoursScolaireEleve {
    return new ParcoursScolaireEleve({
      idParcoursScolaireEleve,
      idOrganisation,
      idEcole,
      idEleve,
      historique: [],
      version: 1,
    });
  }

  /** Enregistre un nouvel evenement de parcours en respectant la chronologie. */
  public enregistrerEvenement(evenementParcours: EvenementParcours): void {
    this.verifierTransition(evenementParcours.obtenirTypeEvenement());
    this.historique.push(evenementParcours);
    this.verifierOrdreChronologique();
    this.version += 1;
    this.ajouterEvenement(new EvenementParcoursAjoute(this.idOrganisation, this.idEcole, evenementParcours.obtenirDeclenchePar(), evenementParcours.obtenirId()));
  }

  /** Reconstruit l'historique a partir d'une source fiable sans supprimer d'evenement existant. */
  public reconstruireParcours(historiqueReconstruit: EvenementParcours[], declenchePar: UUID): void {
    if (historiqueReconstruit.length < this.historique.length) {
      this.ajouterEvenement(new TransitionParcoursRefusee(this.idOrganisation, this.idEcole, declenchePar, this.obtenirId()));
      throw new ErreurParcoursIncoherent('Un parcours reconstruit ne peut pas perdre des evenements deja connus.');
    }

    this.historique = [...historiqueReconstruit].sort((a, b) => a.obtenirDateEvenement().getTime() - b.obtenirDateEvenement().getTime());
    this.verifierOrdreChronologique();
    this.version += 1;
    this.ajouterEvenement(new ParcoursEleveReconstruit(this.idOrganisation, this.idEcole, declenchePar, this.obtenirId()));
  }

  /** Liste les evenements attaches a une annee scolaire donnee. */
  public listerParAnnee(idAnneeScolaire: UUID): EvenementParcours[] {
    return this.historique.filter((evenement) => evenement.obtenirIdAnneeScolaire() === idAnneeScolaire);
  }

  /** Verifie qu'une transition de parcours reste coherent avec le dernier evenement connu. */
  public verifierTransition(typeEvenementSuivant: TypeEvenementParcours): void {
    const dernierEvenement = this.historique.at(-1);

    if (dernierEvenement === undefined) {
      return;
    }

    const dernierType = dernierEvenement.obtenirTypeEvenement();
    const transitionsInterditesApresDeces = dernierType === TypeEvenementParcours.DECES && typeEvenementSuivant !== TypeEvenementParcours.DECES;
    const affectationSansInscription = typeEvenementSuivant === TypeEvenementParcours.AFFECTATION
      && !this.historique.some((evenement) => evenement.obtenirTypeEvenement() === TypeEvenementParcours.VALIDATION_INSCRIPTION);

    if (transitionsInterditesApresDeces || affectationSansInscription) {
      throw new ErreurTransitionParcoursInterdite('La transition de parcours demandee est interdite.');
    }
  }

  /** Verifie que la version attendue correspond a la version courante. */
  public verifierConcurrence(versionAttendue: number): void {
    if (this.version !== versionAttendue) {
      throw new ErreurParcoursIncoherent(`La version attendue ${versionAttendue} ne correspond pas a la version courante ${this.version}.`);
    }
  }

  /** Interdit la suppression d'un evenement deja historise. */
  public supprimerEvenement(): never {
    throw new ErreurParcoursIncoherent('Un evenement de parcours ne peut pas etre supprime.');
  }

  /** Retourne l'organisation proprietaire du parcours. */
  public obtenirIdOrganisation(): UUID { return this.idOrganisation; }
  /** Retourne l'ecole de rattachement du parcours. */
  public obtenirIdEcole(): UUID { return this.idEcole; }
  /** Retourne l'eleve concerne par le parcours. */
  public obtenirIdEleve(): UUID { return this.idEleve; }
  /** Retourne une copie ordonnee de l'historique. */
  public listerHistorique(): EvenementParcours[] { return [...this.historique]; }
  /** Retourne la version courante du parcours. */
  public obtenirVersion(): number { return this.version; }

  /** Retourne toutes les proprietes metier pour les mappers futurs. */
  public versProprietes(): ProprietesParcoursScolaireEleve {
    return {
      idParcoursScolaireEleve: this.obtenirId(),
      idOrganisation: this.idOrganisation,
      idEcole: this.idEcole,
      idEleve: this.idEleve,
      historique: this.listerHistorique(),
      version: this.version,
    };
  }

  private verifierOrdreChronologique(): void {
    for (let indexEvenement = 1; indexEvenement < this.historique.length; indexEvenement += 1) {
      const datePrecedente = this.historique[indexEvenement - 1].obtenirDateEvenement().getTime();
      const dateCourante = this.historique[indexEvenement].obtenirDateEvenement().getTime();

      if (dateCourante < datePrecedente) {
        throw new ErreurParcoursIncoherent('Les evenements du parcours doivent rester ordonnes dans le temps.');
      }
    }
  }

  private static nettoyerTexteObligatoire(valeur: string, nomChamp: string): string {
    if (typeof valeur !== 'string' || valeur.trim().length === 0) {
      throw new ErreurParcoursIncoherent(`Le champ ${nomChamp} est obligatoire pour le parcours.`);
    }

    return valeur.trim();
  }

  private static validerVersion(version: number): number {
    if (!Number.isInteger(version) || version <= 0) {
      throw new ErreurParcoursIncoherent('La version du parcours doit etre un entier positif.');
    }

    return version;
  }
}
