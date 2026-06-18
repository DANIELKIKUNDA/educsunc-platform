import type { SessionOutput } from 'shared/auth/application';
import type { NotificationAuthContextPort } from '../ports/NotificationAuthContextPort';
import type {
  NotificationAuthContexteActif,
  NotificationAuthDemandeAutorisation,
} from '../NotificationsAuthIntegrationTypes';
import { NotificationAuthContextMapper } from '../mappers/NotificationAuthContextMapper';

// Ce fichier maintient une vue memoire des sessions Auth utiles au module Notifications.

/** Cette classe conserve les sessions et autorisations Auth sans importer la logique metier d'Auth. */
export class NotificationAuthSessionBridge implements NotificationAuthContextPort {
  private readonly contextesParUtilisateur = new Map<string, NotificationAuthContexteActif>();
  private readonly utilisateurParSession = new Map<string, string>();
  private readonly actionsParUtilisateur = new Map<string, Set<string>>();

  /** Cette methode synchronise un contexte actif provenant d'Auth. */
  public synchroniserContexte(contexteActif: NotificationAuthContexteActif): void {
    this.contextesParUtilisateur.set(contexteActif.utilisateurId, { ...contexteActif });
    if (contexteActif.sessionId) {
      this.utilisateurParSession.set(contexteActif.sessionId, contexteActif.utilisateurId);
    }
  }

  /** Cette methode memorise une session ouverte ou rafraichie. */
  public ouvrirSession(session: SessionOutput, contexteActif?: NotificationAuthContexteActif): void {
    this.utilisateurParSession.set(session.sessionId, session.utilisateurId);

    const existant = contexteActif ?? this.contextesParUtilisateur.get(session.utilisateurId);
    if (existant) {
      this.contextesParUtilisateur.set(session.utilisateurId, {
        ...existant,
        sessionId: session.sessionId,
        organisationId: session.organisationActiveId ?? existant.organisationId,
        ecoleId: session.ecoleActiveId ?? existant.ecoleId,
        estOffline: session.estOffline,
      });
      return;
    }

    const contexteMinimal = NotificationAuthContextMapper.depuisAuth(
      { idUtilisateur: session.utilisateurId, nomComplet: '', email: '', etatCompte: 'ACTIF' },
      {
        organisationActiveId: session.organisationActiveId,
        ecoleActiveId: session.ecoleActiveId,
      },
      session,
    );
    this.contextesParUtilisateur.set(session.utilisateurId, contexteMinimal);
  }

  /** Cette methode oublie une session fermee ou revoquee. */
  public fermerSession(sessionId: string): void {
    const utilisateurId = this.utilisateurParSession.get(sessionId);
    if (!utilisateurId) {
      return;
    }

    this.utilisateurParSession.delete(sessionId);
    const contexte = this.contextesParUtilisateur.get(utilisateurId);
    if (contexte?.sessionId === sessionId) {
      this.contextesParUtilisateur.set(utilisateurId, {
        ...contexte,
        sessionId: undefined,
      });
    }
  }

  /** Cette methode remplace la liste d'actions autorisees pour un utilisateur. */
  public synchroniserActions(utilisateurId: string, actions: readonly string[]): void {
    this.actionsParUtilisateur.set(utilisateurId, new Set(actions));
  }

  /** Cette methode retourne le contexte actif d'un utilisateur ou d'une session. */
  public async rechercherContexteActif(params: {
    readonly utilisateurId?: string;
    readonly sessionId?: string;
  }): Promise<NotificationAuthContexteActif | null> {
    if (params.utilisateurId) {
      return this.contextesParUtilisateur.get(params.utilisateurId) ?? null;
    }

    if (!params.sessionId) {
      return null;
    }

    const utilisateurId = this.utilisateurParSession.get(params.sessionId);
    if (!utilisateurId) {
      return null;
    }

    return this.contextesParUtilisateur.get(utilisateurId) ?? null;
  }

  /** Cette methode verifie une autorisation en utilisant le contrat applicatif Notifications. */
  public async estAutorise(
    action: string,
    contexte: Readonly<Record<string, unknown>>,
  ): Promise<boolean> {
    return this.estAutorisePourDemande(
      NotificationAuthContextMapper.versDemandeAutorisation(action, contexte),
    );
  }

  /** Cette methode verifie une demande d'autorisation deja normalisee. */
  public async estAutorisePourDemande(
    demande: NotificationAuthDemandeAutorisation,
  ): Promise<boolean> {
    const utilisateurId =
      demande.utilisateurId ??
      (demande.sessionId ? this.utilisateurParSession.get(demande.sessionId) : undefined);

    if (!utilisateurId) {
      return false;
    }

    const contexteActif = this.contextesParUtilisateur.get(utilisateurId);
    if (!contexteActif) {
      return false;
    }

    if (demande.organisationId && contexteActif.organisationId !== demande.organisationId) {
      return false;
    }

    if (demande.ecoleId && contexteActif.ecoleId !== demande.ecoleId) {
      return false;
    }

    const actions = this.actionsParUtilisateur.get(utilisateurId);
    if (!actions || actions.size === 0) {
      return false;
    }

    return actions.has(demande.action) || actions.has('*');
  }

  /** Cette methode expose un snapshot simple du bridge de sessions Auth. */
  public obtenirSnapshot(): {
    readonly totalSessionsConnues: number;
    readonly totalUtilisateursAvecContexte: number;
    readonly totalUtilisateursAutorises: number;
    readonly contextesActifs: readonly NotificationAuthContexteActif[];
  } {
    return {
      totalSessionsConnues: this.utilisateurParSession.size,
      totalUtilisateursAvecContexte: this.contextesParUtilisateur.size,
      totalUtilisateursAutorises: this.actionsParUtilisateur.size,
      contextesActifs: [...this.contextesParUtilisateur.values()],
    };
  }
}
