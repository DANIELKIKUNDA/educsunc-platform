import type { ContexteActifOutput, SessionOutput, UtilisateurAuthDTO } from 'shared/auth/application';
import type { NotificationContext } from '../../context';

// Ce fichier declare les types partages par le pont entre Auth et Notifications.

/** Cette interface represente le contexte Auth actif utile aux workflows Notifications. */
export interface NotificationAuthContexteActif {
  readonly utilisateurId: string;
  readonly acteurId: string;
  readonly sessionId?: string;
  readonly organisationId?: string;
  readonly ecoleId?: string;
  readonly deviceId?: string;
  readonly estOffline: boolean;
}

/** Cette interface represente une demande d'autorisation issue du module Notifications. */
export interface NotificationAuthDemandeAutorisation {
  readonly action: string;
  readonly utilisateurId?: string;
  readonly sessionId?: string;
  readonly organisationId?: string;
  readonly ecoleId?: string;
  readonly metadata: Readonly<Record<string, unknown>>;
}

/** Cette interface represente un evenement de session recu depuis Auth. */
export interface NotificationAuthEvenementSession {
  readonly type: 'SESSION_OUVERTE' | 'SESSION_FERMEE' | 'SESSION_REVOQUEE';
  readonly session: SessionOutput;
  readonly utilisateur?: UtilisateurAuthDTO;
  readonly deviceId?: string;
}

/** Cette interface represente une mise a jour du contexte actif issue d'Auth. */
export interface NotificationAuthMiseAJourContexte {
  readonly utilisateur: UtilisateurAuthDTO;
  readonly contexteActif: ContexteActifOutput;
  readonly session?: SessionOutput;
  readonly acteurId?: string;
  readonly deviceId?: string;
}

/** Cette interface represente une mise a jour des permissions utiles a Notifications. */
export interface NotificationAuthMiseAJourPermissions {
  readonly utilisateurId: string;
  readonly actionsAutorisees: readonly string[];
}

/** Cette interface represente les preferences Auth mises a disposition de Notifications. */
export interface NotificationAuthPreferences {
  readonly utilisateurId?: string;
  readonly sessionId?: string;
  readonly organisationId?: string;
  readonly ecoleId?: string;
  readonly estOffline: boolean;
  readonly canalPrefere?: NotificationContext['canal'];
  readonly metadata: Readonly<Record<string, unknown>>;
}

/** Cette interface represente le snapshot local du pont Auth vers Notifications. */
export interface NotificationAuthIntegrationSnapshot {
  readonly totalSessionsConnues: number;
  readonly totalUtilisateursAvecContexte: number;
  readonly totalUtilisateursAutorises: number;
  readonly contextesActifs: readonly NotificationAuthContexteActif[];
}
