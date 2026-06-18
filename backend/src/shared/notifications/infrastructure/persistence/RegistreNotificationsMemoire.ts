import {
  ConsentementCommunication,
  EntreeChronologieNotification,
  ModeleNotification,
  Notification,
  PreferencesNotification,
} from '../../domain';
import {
  EnregistrementDeadLetterNotificationMemoire,
  EnregistrementNotificationMemoire,
} from './TypesPersistenceNotification';
import { LigneChronologieTechniqueNotification } from '../chronology';

// Ce fichier heberge le stockage technique memoire du bloc persistence Notifications.

/** Cette classe centralise les structures memoire partagees par les depots techniques. */
export class RegistreNotificationsMemoire {
  /** Cette map stocke les agregats Notification par identifiant metier. */
  public readonly notifications = new Map<string, Notification>();

  /** Cette map stocke un snapshot de lecture rapide des notifications. */
  public readonly enregistrements = new Map<string, EnregistrementNotificationMemoire>();

  /** Cette map stocke la chronologie append-only par notification. */
  public readonly chronologies = new Map<string, EntreeChronologieNotification[]>();

  /** Cette map stocke la projection technique de chronology par notification. */
  public readonly projectionsChronologie = new Map<string, LigneChronologieTechniqueNotification[]>();

  /** Cette map stocke les templates de notification resolubles. */
  public readonly modeles = new Map<string, ModeleNotification>();

  /** Cette map stocke les preferences par destinataire. */
  public readonly preferences = new Map<string, PreferencesNotification>();

  /** Cette map stocke les consentements par destinataire. */
  public readonly consentements = new Map<string, ConsentementCommunication[]>();

  /** Cette liste stocke les dead letters techniques. */
  public readonly deadLetters: EnregistrementDeadLetterNotificationMemoire[] = [];

  /** Cette methode genere la cle technique d'un template. */
  public construireCleModele(type: string, canal: string, organisationId?: string, ecoleId?: string): string {
    return [type, canal, organisationId ?? '*', ecoleId ?? '*'].join('::');
  }

  /** Cette methode enregistre un template dans le store memoire. */
  public enregistrerModele(
    modele: ModeleNotification,
    organisationId?: string,
    ecoleId?: string,
  ): void {
    this.modeles.set(
      this.construireCleModele(modele.typeNotification, modele.canal, organisationId, ecoleId),
      modele,
    );
  }

  /** Cette methode enregistre des preferences pour un destinataire. */
  public enregistrerPreferences(destinataireId: string, preferences: PreferencesNotification): void {
    this.preferences.set(destinataireId, preferences);
  }

  /** Cette methode enregistre les consentements d'un destinataire. */
  public enregistrerConsentements(destinataireId: string, consentements: ConsentementCommunication[]): void {
    this.consentements.set(destinataireId, [...consentements]);
  }
}
