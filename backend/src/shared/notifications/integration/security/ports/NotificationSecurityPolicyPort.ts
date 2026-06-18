import type { ContexteActifOutput, DecisionAutorisationOutput } from 'shared/security/application';
import type { NotificationContext } from '../../../context';
import type { NotificationSecurityDecisionRequest } from '../NotificationsSecurityIntegrationTypes';

// Ce fichier declare le contrat local entre Notifications et le pont Security.

/** Cette interface expose les controles de securite utiles a Notifications sans couplage direct au module Security. */
export interface NotificationSecurityPolicyPort {
  /** Cette methode verifie une demande de securite et retourne la decision du module Security. */
  verifierDecision(
    demande: NotificationSecurityDecisionRequest,
  ): Promise<{
    readonly contexteActif?: ContexteActifOutput;
    readonly decision: DecisionAutorisationOutput;
  }>;

  /** Cette methode signale un acces sensible au pont Security. */
  notifierAccesSensible(
    action: string,
    contexteNotification: NotificationContext,
    details?: Readonly<Record<string, unknown>>,
  ): Promise<void>;
}
