import {
  CanalNotification,
  DepotChronologieNotification,
  DepotModelesNotification,
  DepotNotification,
  DepotPreferencesNotification,
  EntreeChronologieNotification,
  ModeleNotification,
  Notification,
  PreferencesNotification,
  TypeNotification,
} from '../../domain';
import {
  PortDepotChronologieNotification,
  PortDepotModelesNotification,
  PortDepotNotifications,
  PortDepotPreferencesNotification,
} from '../../application';
import { MappeurPersistenceNotification } from './MappeurPersistenceNotification';
import { RegistreNotificationsMemoire } from './RegistreNotificationsMemoire';

// Ce fichier regroupe les implementations memoire des depots applicatifs et domaine.

/** Cette classe persiste les agregats Notification dans un registre memoire. */
export class DepotNotificationsMemoire implements DepotNotification, PortDepotNotifications {
  /** Ce constructeur relie le depot au registre technique partage. */
  constructor(private readonly registreNotificationsMemoire: RegistreNotificationsMemoire) {}

  /** Cette methode persiste l'agregat et met a jour le snapshot de lecture. */
  public async sauvegarder(notification: Notification): Promise<void> {
    const identifiant = notification.obtenirIdentifiant().obtenirValeur();
    this.registreNotificationsMemoire.notifications.set(identifiant, notification);
    this.registreNotificationsMemoire.enregistrements.set(
      identifiant,
      MappeurPersistenceNotification.versEnregistrement(notification),
    );
    this.registreNotificationsMemoire.chronologies.set(identifiant, notification.obtenirTimeline());
  }

  /** Cette methode relit une notification par son identifiant metier. */
  public async rechercherParId(identifiantNotification: string): Promise<Notification | null> {
    return this.registreNotificationsMemoire.notifications.get(identifiantNotification) ?? null;
  }
}

/** Cette classe expose les templates de notification via un registre memoire. */
export class DepotModelesNotificationsMemoire implements DepotModelesNotification, PortDepotModelesNotification {
  /** Ce constructeur relie le depot au registre technique partage. */
  constructor(private readonly registreNotificationsMemoire: RegistreNotificationsMemoire) {}

  /** Cette methode recherche un modele adapte a un type et un canal. */
  public async rechercherParTypeEtCanal(
    typeNotification: TypeNotification,
    canal: CanalNotification,
    organisationId?: string,
    ecoleId?: string,
  ): Promise<ModeleNotification | null> {
    const cles = [
      this.registreNotificationsMemoire.construireCleModele(typeNotification, canal, organisationId, ecoleId),
      this.registreNotificationsMemoire.construireCleModele(typeNotification, canal, organisationId),
      this.registreNotificationsMemoire.construireCleModele(typeNotification, canal),
    ];

    for (const cle of cles) {
      const modele = this.registreNotificationsMemoire.modeles.get(cle);
      if (modele) {
        return modele;
      }
    }

    return null;
  }
}

/** Cette classe expose les preferences resolues via un registre memoire. */
export class DepotPreferencesNotificationsMemoire implements DepotPreferencesNotification, PortDepotPreferencesNotification {
  /** Ce constructeur relie le depot au registre technique partage. */
  constructor(private readonly registreNotificationsMemoire: RegistreNotificationsMemoire) {}

  /** Cette methode retrouve les preferences d'un destinataire. */
  public async rechercherPourDestinataire(destinataireId: string): Promise<PreferencesNotification | null> {
    return this.registreNotificationsMemoire.preferences.get(destinataireId) ?? null;
  }
}

/** Cette classe persiste la chronologie append-only dans le registre memoire. */
export class DepotChronologieNotificationsMemoire implements DepotChronologieNotification, PortDepotChronologieNotification {
  /** Ce constructeur relie le depot au registre technique partage. */
  constructor(private readonly registreNotificationsMemoire: RegistreNotificationsMemoire) {}

  /** Cette methode ajoute une entree append-only a la chronologie d'une notification. */
  public async ajouterEntree(
    identifiantNotification: string,
    entree: EntreeChronologieNotification,
  ): Promise<void> {
    const chronologie = this.registreNotificationsMemoire.chronologies.get(identifiantNotification) ?? [];
    chronologie.push(entree);
    this.registreNotificationsMemoire.chronologies.set(identifiantNotification, chronologie);
  }
}
