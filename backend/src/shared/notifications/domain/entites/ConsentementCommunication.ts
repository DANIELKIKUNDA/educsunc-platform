import { Entite } from '../../../domain/Entity';
import { CanalNotification, StatutConsentementCommunication } from '../enumerations';

/**
 * Cette entite represente un consentement ou une obligation de communication pour un destinataire.
 */
export class ConsentementCommunication extends Entite<string> {
  public readonly destinataireId: string;
  public readonly canal: CanalNotification;
  private readonly statut: StatutConsentementCommunication;

  /**
   * Ce constructeur hydrate l'etat de consentement d'un destinataire sur un canal.
   */
  constructor(identifiant: string, destinataireId: string, canal: CanalNotification, statut: StatutConsentementCommunication) {
    super(identifiant);
    this.destinataireId = destinataireId.trim();
    this.canal = canal;
    this.statut = statut;
  }

  /** Cette methode expose le statut metier du consentement. */
  public obtenirStatut(): StatutConsentementCommunication { return this.statut; }
}
