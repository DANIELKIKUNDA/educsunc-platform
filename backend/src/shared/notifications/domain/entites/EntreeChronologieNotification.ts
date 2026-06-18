import { Entite } from '../../../domain/Entity';
import { SourceNotification, StatutNotification } from '../enumerations';

/**
 * Cette entite represente une entree append-only de la timeline locale d'une notification.
 */
export class EntreeChronologieNotification extends Entite<string> {
  private readonly horodatage: Date;
  private readonly typeEvenement: string;
  public readonly origine: SourceNotification;
  public readonly statutAvant?: StatutNotification;
  private readonly statutApres: StatutNotification;
  public readonly correlationId?: string;
  public readonly requestId?: string;
  public readonly acteur?: string;
  public readonly metadonnees: Record<string, unknown>;
  public readonly metadonneesForensic: Record<string, unknown>;

  /**
   * Ce constructeur hydrate une entree de chronology complete.
   */
  constructor(
    identifiant: string,
    horodatage: Date,
    typeEvenement: string,
    origine: SourceNotification,
    statutAvant: StatutNotification | undefined,
    statutApres: StatutNotification,
    correlationId?: string,
    requestId?: string,
    acteur?: string,
    metadonnees: Record<string, unknown> = {},
    metadonneesForensic: Record<string, unknown> = {},
  ) {
    super(identifiant);
    this.horodatage = horodatage;
    this.typeEvenement = typeEvenement.trim();
    this.origine = origine;
    this.statutAvant = statutAvant;
    this.statutApres = statutApres;
    this.correlationId = EntreeChronologieNotification.nettoyer(correlationId);
    this.requestId = EntreeChronologieNotification.nettoyer(requestId);
    this.acteur = EntreeChronologieNotification.nettoyer(acteur);
    this.metadonnees = { ...metadonnees };
    this.metadonneesForensic = { ...metadonneesForensic };
  }

  /**
   * Cette fabrique facilite la creation d'une entree timeline depuis un objet simple.
   */
  public static creer(parametres: {
    identifiant: string;
    horodatage: Date;
    typeEvenement: string;
    origine: SourceNotification;
    statutAvant?: StatutNotification;
    statutApres: StatutNotification;
    correlationId?: string;
    requestId?: string;
    acteur?: string;
    metadonnees?: Record<string, unknown>;
    metadonneesForensic?: Record<string, unknown>;
  }): EntreeChronologieNotification {
    return new EntreeChronologieNotification(
      parametres.identifiant,
      parametres.horodatage,
      parametres.typeEvenement,
      parametres.origine,
      parametres.statutAvant,
      parametres.statutApres,
      parametres.correlationId,
      parametres.requestId,
      parametres.acteur,
      parametres.metadonnees ?? {},
      parametres.metadonneesForensic ?? {},
    );
  }

  /** Cette methode expose l'instant exact de l'entree timeline. */
  public obtenirHorodatage(): Date { return this.horodatage; }

  /** Cette methode expose le type logique de l'evenement de timeline. */
  public obtenirTypeEvenement(): string { return this.typeEvenement; }

  /** Cette methode expose le statut resultant de l'entree. */
  public obtenirStatutApres(): StatutNotification { return this.statutApres; }

  /** Cette methode normalise les valeurs textuelles optionnelles. */
  private static nettoyer(valeur?: string): string | undefined {
    const propre = String(valeur ?? '').trim();
    return propre.length > 0 ? propre : undefined;
  }
}
