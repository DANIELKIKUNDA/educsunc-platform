import type { ContexteActifOutput, DecisionAutorisationOutput } from 'shared/security/application';
import type { NotificationContext } from '../../context';

// Ce fichier declare les types partages du pont entre Security et Notifications.

/** Cette interface represente une demande de controle de securite emise par Notifications. */
export interface NotificationSecurityDecisionRequest {
  readonly action: string;
  readonly contexteNotification: NotificationContext;
  readonly scopes?: readonly string[];
  readonly metadata: Readonly<Record<string, unknown>>;
}

/** Cette interface represente une decision de securite normalisee pour Notifications. */
export interface NotificationSecurityDecision {
  readonly autorise: boolean;
  readonly action: string;
  readonly raisonRefus?: string;
  readonly scopeValide: boolean;
  readonly restrictionRespectee: boolean;
  readonly organisationId?: string;
  readonly ecoleId?: string;
  readonly acteurId?: string;
  readonly correlationId?: string;
  readonly requestId?: string;
  readonly metadata: Readonly<Record<string, unknown>>;
}

/** Cette interface represente une anomalie de securite reliee au moteur Notifications. */
export interface NotificationSecurityAnomaly {
  readonly code: string;
  readonly severite: 'INFO' | 'WARN' | 'ERROR';
  readonly message: string;
  readonly contexteNotification: NotificationContext;
  readonly metadata: Readonly<Record<string, unknown>>;
  readonly detecteeLe: Date;
}

/** Cette interface represente une entree forensic emise par le pont Security. */
export interface NotificationSecurityForensicRecord {
  readonly action: string;
  readonly notificationId: string;
  readonly organisationId?: string;
  readonly ecoleId?: string;
  readonly correlationId?: string;
  readonly requestId?: string;
  readonly acteurId?: string;
  readonly autorise: boolean;
  readonly raisonRefus?: string;
  readonly metadata: Readonly<Record<string, unknown>>;
  readonly observeLe: string;
}

/** Cette interface represente un evenement recu depuis le module Security. */
export interface NotificationSecurityEvent {
  readonly type: 'ACCES_SENSIBLE' | 'PERMISSION_REFUSEE' | 'RESTRICTION_DETECTEE' | 'ANOMALIE';
  readonly action: string;
  readonly idUtilisateur?: string;
  readonly idOrganisationActive?: string;
  readonly idEcoleActive?: string;
  readonly succes: boolean;
  readonly details?: Record<string, unknown>;
}

/** Cette interface represente le snapshot local du pont Security vers Notifications. */
export interface NotificationSecurityIntegrationSnapshot {
  readonly totalDecisions: number;
  readonly totalAnomalies: number;
  readonly totalRefus: number;
  readonly totalRecordsForensic: number;
  readonly contexteActif?: ContexteActifOutput;
}

/** Cette interface represente un couple contexte/decision venant du module Security. */
export interface NotificationSecurityDecisionEnvelope {
  readonly contexteActif?: ContexteActifOutput;
  readonly decision: DecisionAutorisationOutput;
}
