import { ObjetValeur } from '../../../domain/ValueObject';
import { GranulariteChronologie } from '../enumerations';

/**
 * Cet objet-valeur represente la politique de chronology locale d'une notification.
 */
export class ChronologieNotification extends ObjetValeur<{
  granularite: GranulariteChronologie;
  correlationId?: string;
  requestId?: string;
  appendOnly: boolean;
}> {
  /**
   * Ce constructeur fixe la granularite et les identifiants transverses de chronology.
   */
  constructor(granularite: GranulariteChronologie, correlationId?: string, requestId?: string, appendOnly = true) {
    super({
      granularite,
      correlationId: ChronologieNotification.nettoyer(correlationId),
      requestId: ChronologieNotification.nettoyer(requestId),
      appendOnly,
    });
  }

  /** Cette methode expose la granularite demandee pour la chronology. */
  public obtenirGranularite(): GranulariteChronologie { return this.proprietes.granularite; }

  /** Cette methode expose le correlationId associe au workflow global. */
  public obtenirCorrelationId(): string | undefined { return this.proprietes.correlationId; }

  /** Cette methode expose le requestId associe a l'execution locale. */
  public obtenirRequestId(): string | undefined { return this.proprietes.requestId; }

  /** Cette methode indique si la chronology reste append-only. */
  public estAppendOnly(): boolean { return this.proprietes.appendOnly; }

  /** Cette methode normalise les champs textuels optionnels. */
  private static nettoyer(valeur?: string): string | undefined {
    const propre = String(valeur ?? '').trim();
    return propre.length > 0 ? propre : undefined;
  }
}
