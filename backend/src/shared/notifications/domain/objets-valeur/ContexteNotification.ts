import { ObjetValeur } from '../../../domain/ValueObject';
import { SourceNotification } from '../enumerations';

/**
 * Cet objet-valeur represente le contexte technique et metier qui a declenche la notification.
 */
export class ContexteNotification extends ObjetValeur<{
  organisationId?: string;
  ecoleId?: string;
  utilisateurId?: string;
  destinataireId?: string;
  evenementSource?: string;
  source: SourceNotification;
  acteurId?: string;
  correlationId?: string;
  requestId?: string;
  metadonneesChronologie: Record<string, unknown>;
}> {
  /**
   * Ce constructeur capture les metadonnees stables associees a la cause de notification.
   */
  constructor(
    source: SourceNotification,
    organisationId?: string,
    ecoleId?: string,
    utilisateurId?: string,
    destinataireId?: string,
    evenementSource?: string,
    acteurId?: string,
    correlationId?: string,
    requestId?: string,
    metadonneesChronologie: Record<string, unknown> = {},
  ) {
    super({
      organisationId: ContexteNotification.nettoyer(organisationId),
      ecoleId: ContexteNotification.nettoyer(ecoleId),
      utilisateurId: ContexteNotification.nettoyer(utilisateurId),
      destinataireId: ContexteNotification.nettoyer(destinataireId),
      evenementSource: ContexteNotification.nettoyer(evenementSource),
      source,
      acteurId: ContexteNotification.nettoyer(acteurId),
      correlationId: ContexteNotification.nettoyer(correlationId),
      requestId: ContexteNotification.nettoyer(requestId),
      metadonneesChronologie: { ...metadonneesChronologie },
    });
  }

  /** Cette methode expose l'organisation de rattachement de la notification. */
  public obtenirOrganisationId(): string | undefined { return this.proprietes.organisationId; }

  /** Cette methode expose l'ecole de rattachement de la notification. */
  public obtenirEcoleId(): string | undefined { return this.proprietes.ecoleId; }

  /** Cette methode expose l'identifiant de correlation transversal. */
  public obtenirCorrelationId(): string | undefined { return this.proprietes.correlationId; }

  /** Cette methode expose l'identifiant de requete locale a un traitement donne. */
  public obtenirRequestId(): string | undefined { return this.proprietes.requestId; }

  /** Cette methode expose l'acteur qui a initie le workflow si l'information existe. */
  public obtenirActeurId(): string | undefined { return this.proprietes.acteurId; }

  /** Cette methode expose les metadonnees qui alimentent la chronology locale. */
  public obtenirMetadonneesChronologie(): Record<string, unknown> {
    return { ...this.proprietes.metadonneesChronologie };
  }

  /** Cette methode normalise les champs textuels optionnels. */
  private static nettoyer(valeur?: string): string | undefined {
    const propre = String(valeur ?? '').trim();
    return propre.length > 0 ? propre : undefined;
  }
}
