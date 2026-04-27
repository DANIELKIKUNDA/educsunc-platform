import { Entite } from '../../../../shared/domain/Entity';
import { ErreurEvenementParcoursInvalide } from '../exceptions/ErreurEvenementParcoursInvalide';
import { TypeEvenementParcours } from '../value-objects/TypeEvenementParcours';
import { Instant, UUID } from '../value-objects/TypesPrimitifs';

// Ce fichier definit l'entite immutable qui compose l'historique du parcours scolaire.
export interface ProprietesEvenementParcours {
  idEvenementParcours: UUID;
  typeEvenement: TypeEvenementParcours;
  dateEvenement: Instant;
  idAnneeScolaire?: UUID;
  idClassePedagogique?: UUID;
  referenceMetier?: string;
  description?: string;
  declenchePar: UUID;
}

/**
 * Cette entite trace un evenement majeur et non supprimable de la vie scolaire d'un eleve.
 */
export class EvenementParcours extends Entite<UUID> {
  constructor(
    idEvenementParcours: UUID,
    private typeEvenement: TypeEvenementParcours,
    private dateEvenement: Instant,
    private idAnneeScolaire: UUID | undefined,
    private idClassePedagogique: UUID | undefined,
    private referenceMetier: string | undefined,
    private description: string | undefined,
    private declenchePar: UUID
  ) {
    super(idEvenementParcours);
    this.typeEvenement = this.validerTypeEvenement(typeEvenement);
    this.dateEvenement = this.validerDate(dateEvenement, 'dateEvenement');
    this.idAnneeScolaire = this.nettoyerIdentifiantOptionnel(idAnneeScolaire);
    this.idClassePedagogique = this.nettoyerIdentifiantOptionnel(idClassePedagogique);
    this.referenceMetier = this.nettoyerTexteOptionnel(referenceMetier);
    this.description = this.nettoyerTexteOptionnel(description);
    this.declenchePar = this.nettoyerIdentifiantObligatoire(declenchePar, 'declenchePar');
  }

  /** Cree un evenement de parcours a partir de proprietes nommees. */
  public static creer(proprietes: ProprietesEvenementParcours): EvenementParcours {
    return new EvenementParcours(
      proprietes.idEvenementParcours,
      proprietes.typeEvenement,
      proprietes.dateEvenement,
      proprietes.idAnneeScolaire,
      proprietes.idClassePedagogique,
      proprietes.referenceMetier,
      proprietes.description,
      proprietes.declenchePar,
    );
  }

  /** Retourne le type metier de l'evenement de parcours. */
  public obtenirTypeEvenement(): TypeEvenementParcours {
    return this.typeEvenement;
  }

  /** Retourne la date precise de l'evenement. */
  public obtenirDateEvenement(): Instant {
    return new Date(this.dateEvenement.getTime());
  }

  /** Retourne l'annee scolaire associee quand l'evenement en porte une. */
  public obtenirIdAnneeScolaire(): UUID | undefined {
    return this.idAnneeScolaire;
  }

  /** Retourne la classe pedagogique associee quand l'evenement en porte une. */
  public obtenirIdClassePedagogique(): UUID | undefined {
    return this.idClassePedagogique;
  }

  /** Retourne une reference metier lisible pour relier l'evenement a une operation. */
  public obtenirReferenceMetier(): string | undefined {
    return this.referenceMetier;
  }

  /** Retourne la description administrative de l'evenement quand elle existe. */
  public obtenirDescription(): string | undefined {
    return this.description;
  }

  /** Retourne l'acteur qui a declenche l'evenement. */
  public obtenirDeclenchePar(): UUID {
    return this.declenchePar;
  }

  /** Retourne une copie simple des proprietes pour les mappers futurs. */
  public versProprietes(): ProprietesEvenementParcours {
    return {
      idEvenementParcours: this.obtenirId(),
      typeEvenement: this.typeEvenement,
      dateEvenement: this.obtenirDateEvenement(),
      idAnneeScolaire: this.idAnneeScolaire,
      idClassePedagogique: this.idClassePedagogique,
      referenceMetier: this.referenceMetier,
      description: this.description,
      declenchePar: this.declenchePar,
    };
  }

  private validerTypeEvenement(typeEvenement: TypeEvenementParcours): TypeEvenementParcours {
    if (!Object.values(TypeEvenementParcours).includes(typeEvenement)) {
      throw new ErreurEvenementParcoursInvalide('Le type d evenement de parcours est invalide.');
    }

    return typeEvenement;
  }

  private validerDate(date: Instant, nomChamp: string): Instant {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
      throw new ErreurEvenementParcoursInvalide(`Le champ ${nomChamp} doit etre une date valide.`);
    }

    return new Date(date.getTime());
  }

  private nettoyerIdentifiantObligatoire(valeur: UUID, nomChamp: string): UUID {
    if (typeof valeur !== 'string' || valeur.trim().length === 0) {
      throw new ErreurEvenementParcoursInvalide(`Le champ ${nomChamp} est obligatoire.`);
    }

    return valeur.trim();
  }

  private nettoyerIdentifiantOptionnel(valeur?: UUID): UUID | undefined {
    if (valeur === undefined) {
      return undefined;
    }

    const valeurNettoyee = valeur.trim();

    return valeurNettoyee.length === 0 ? undefined : valeurNettoyee;
  }

  private nettoyerTexteOptionnel(valeur?: string): string | undefined {
    if (valeur === undefined) {
      return undefined;
    }

    const valeurNettoyee = valeur.trim();

    return valeurNettoyee.length === 0 ? undefined : valeurNettoyee;
  }
}
