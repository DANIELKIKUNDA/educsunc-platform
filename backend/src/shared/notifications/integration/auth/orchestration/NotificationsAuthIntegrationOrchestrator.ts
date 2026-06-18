import type { NotificationContext } from '../../../context';
import type {
  NotificationAuthContexteActif,
  NotificationAuthEvenementSession,
  NotificationAuthIntegrationSnapshot,
  NotificationAuthMiseAJourContexte,
  NotificationAuthMiseAJourPermissions,
  NotificationAuthPreferences,
} from '../NotificationsAuthIntegrationTypes';
import { NotificationAuthContextMapper } from '../mappers/NotificationAuthContextMapper';
import { NotificationAuthPreferencesBridge } from '../preferences/NotificationAuthPreferencesBridge';
import { NotificationAuthSessionBridge } from '../sessions/NotificationAuthSessionBridge';

// Ce fichier orchestre le pont entre le module Auth et le module Notifications.

/** Cette classe centralise la synchronisation du contexte Auth utile aux workflows Notifications. */
export class NotificationsAuthIntegrationOrchestrator {
  public readonly sessions = new NotificationAuthSessionBridge();
  public readonly preferences = new NotificationAuthPreferencesBridge();

  /** Cette methode enregistre un evenement de session venant du module Auth. */
  public async enregistrerEvenementSession(
    evenement: NotificationAuthEvenementSession,
  ): Promise<void> {
    if (evenement.type === 'SESSION_FERMEE' || evenement.type === 'SESSION_REVOQUEE') {
      this.sessions.fermerSession(evenement.session.sessionId);
      return;
    }

    const contexte =
      evenement.utilisateur
        ? NotificationAuthContextMapper.depuisAuth(
            evenement.utilisateur,
            {
              organisationActiveId: evenement.session.organisationActiveId,
              ecoleActiveId: evenement.session.ecoleActiveId,
            },
            evenement.session,
            evenement.utilisateur.idUtilisateur,
            evenement.deviceId,
          )
        : undefined;
    this.sessions.ouvrirSession(evenement.session, contexte);
  }

  /** Cette methode synchronise un contexte actif recu depuis Auth. */
  public async synchroniserContexteActif(
    miseAJour: NotificationAuthMiseAJourContexte,
  ): Promise<void> {
    const contexte = NotificationAuthContextMapper.depuisAuth(
      miseAJour.utilisateur,
      miseAJour.contexteActif,
      miseAJour.session,
      miseAJour.acteurId,
      miseAJour.deviceId,
    );
    this.sessions.synchroniserContexte(contexte);

    if (miseAJour.session) {
      this.sessions.ouvrirSession(miseAJour.session, contexte);
    }
  }

  /** Cette methode synchronise la liste d'actions autorisees venant d'Auth. */
  public async synchroniserPermissions(
    miseAJour: NotificationAuthMiseAJourPermissions,
  ): Promise<void> {
    this.sessions.synchroniserActions(miseAJour.utilisateurId, miseAJour.actionsAutorisees);
  }

  /** Cette methode resolve le contexte Auth actif d'un utilisateur ou d'une session. */
  public async rechercherContexteActif(params: {
    readonly utilisateurId?: string;
    readonly sessionId?: string;
  }): Promise<NotificationAuthContexteActif | null> {
    return this.sessions.rechercherContexteActif(params);
  }

  /** Cette methode verifie si une action Notifications est autorisee via le pont Auth. */
  public async estAutorise(
    action: string,
    contexte: Readonly<Record<string, unknown>>,
  ): Promise<boolean> {
    return this.sessions.estAutorise(action, contexte);
  }

  /** Cette methode construit un contexte Notifications enrichi par Auth. */
  public async resoudreContexteNotification(
    base: Omit<
      NotificationContext,
      'utilisateurId' | 'acteurId' | 'sessionId' | 'deviceId' | 'organisationId' | 'ecoleId'
    > & {
      readonly utilisateurId?: string;
      readonly sessionId?: string;
    },
  ): Promise<NotificationContext> {
    const contexteActif = await this.sessions.rechercherContexteActif({
      utilisateurId: base.utilisateurId,
      sessionId: base.sessionId,
    });

    if (!contexteActif) {
      return {
        ...base,
        utilisateurId: base.utilisateurId,
      };
    }

    return NotificationAuthContextMapper.versContexteNotification(base, contexteActif);
  }

  /** Cette methode construit une vue preferences a partir du contexte Auth courant. */
  public async construirePreferencesAuth(params: {
    readonly utilisateurId?: string;
    readonly sessionId?: string;
    readonly metadata?: Readonly<Record<string, unknown>>;
  }): Promise<NotificationAuthPreferences> {
    const contexteActif = await this.sessions.rechercherContexteActif({
      utilisateurId: params.utilisateurId,
      sessionId: params.sessionId,
    });
    return this.preferences.construireDepuisContexte(contexteActif, params.metadata);
  }

  /** Cette methode expose un snapshot memoire simple du pont Auth vers Notifications. */
  public obtenirSnapshot(): NotificationAuthIntegrationSnapshot {
    return this.sessions.obtenirSnapshot();
  }
}
