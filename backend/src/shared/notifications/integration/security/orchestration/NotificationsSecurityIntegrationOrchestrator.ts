import type { ContexteActifOutput, DecisionAutorisationOutput } from 'shared/security/application';
import type { NotificationContext } from '../../../context';
import type {
  NotificationSecurityDecision,
  NotificationSecurityDecisionRequest,
  NotificationSecurityEvent,
  NotificationSecurityIntegrationSnapshot,
} from '../NotificationsSecurityIntegrationTypes';
import { NotificationSecurityAnomalyBridge } from '../anomalies/NotificationSecurityAnomalyBridge';
import { NotificationSecurityForensicBridge } from '../forensic/NotificationSecurityForensicBridge';
import { NotificationSecurityEventMapper } from '../mappers/NotificationSecurityEventMapper';
import type { NotificationSecurityPolicyPort } from '../ports/NotificationSecurityPolicyPort';

// Ce fichier orchestre le pont entre Security et Notifications.

/** Cette classe centralise les decisions, anomalies et traces forensic de securite utiles a Notifications. */
export class NotificationsSecurityIntegrationOrchestrator implements NotificationSecurityPolicyPort {
  public readonly anomalies = new NotificationSecurityAnomalyBridge();
  public readonly forensic = new NotificationSecurityForensicBridge();

  private contexteActif?: ContexteActifOutput;
  private readonly decisions: NotificationSecurityDecision[] = [];

  /** Ce constructeur fixe la retention memoire des decisions locales. */
  constructor(private readonly retentionMaximale = 200) {}

  /** Cette methode synchronise le contexte actif issu du module Security. */
  public synchroniserContexteActif(contexteActif: ContexteActifOutput): void {
    this.contexteActif = { ...contexteActif };
  }

  /** Cette methode enregistre une decision Security deja resolue. */
  public enregistrerDecision(
    decision: DecisionAutorisationOutput,
    contexteNotification: NotificationContext,
    metadata: Readonly<Record<string, unknown>> = {},
  ): NotificationSecurityDecision {
    const decisionNormalisee = NotificationSecurityEventMapper.versDecision(
      {
        contexteActif: this.contexteActif,
        decision,
      },
      contexteNotification,
      metadata,
    );
    this.decisions.push(decisionNormalisee);
    if (this.decisions.length > this.retentionMaximale) {
      this.decisions.splice(0, this.decisions.length - this.retentionMaximale);
    }

    this.forensic.enregistrerDecision(decisionNormalisee, contexteNotification);

    if (!decisionNormalisee.autorise) {
      this.anomalies.enregistrer({
        code: 'SECURITY_DECISION_REFUSED',
        severite: 'WARN',
        message: decisionNormalisee.raisonRefus ?? 'Une action Notifications a ete refusee.',
        contexteNotification,
        metadata: {
          action: decisionNormalisee.action,
          scopeValide: decisionNormalisee.scopeValide,
          restrictionRespectee: decisionNormalisee.restrictionRespectee,
        },
      });
    }

    return decisionNormalisee;
  }

  /** Cette methode verifie une demande de securite a partir de regles locales de pont. */
  public async verifierDecision(
    demande: NotificationSecurityDecisionRequest,
  ): Promise<{
    readonly contexteActif?: ContexteActifOutput;
    readonly decision: DecisionAutorisationOutput;
  }> {
    const scopeValide = !demande.scopes || demande.scopes.length > 0;
    const restrictionRespectee =
      demande.contexteNotification.organisationId === undefined ||
      this.contexteActif?.idOrganisationActive === undefined ||
      demande.contexteNotification.organisationId === this.contexteActif.idOrganisationActive;

    const autorise = scopeValide && restrictionRespectee;
    return {
      contexteActif: this.contexteActif,
      decision: {
        autorise,
        permissionDemandee: demande.action,
        raisonRefus: autorise
          ? undefined
          : !scopeValide
            ? 'Aucun scope de securite exploitable n a ete fourni.'
            : 'Le tenant actif ne correspond pas au contexte Notification.',
        scopeValide,
        restrictionRespectee,
      },
    };
  }

  /** Cette methode signale un acces sensible au pont Security local. */
  public async notifierAccesSensible(
    action: string,
    contexteNotification: NotificationContext,
    details: Readonly<Record<string, unknown>> = {},
  ): Promise<void> {
    this.anomalies.enregistrer({
      code: 'SECURITY_SENSITIVE_ACCESS',
      severite: 'INFO',
      message: `Acces sensible observe pour l action ${action}.`,
      contexteNotification,
      metadata: { ...details },
    });
  }

  /** Cette methode absorbe un evenement emis par le module Security. */
  public async enregistrerEvenement(evenement: NotificationSecurityEvent): Promise<void> {
    if (evenement.idOrganisationActive || evenement.idEcoleActive) {
      this.contexteActif = {
        idOrganisationActive: evenement.idOrganisationActive ?? this.contexteActif?.idOrganisationActive,
        idEcoleActive: evenement.idEcoleActive ?? this.contexteActif?.idEcoleActive,
      };
    }
  }

  /** Cette methode expose un snapshot simple du pont Security vers Notifications. */
  public obtenirSnapshot(): NotificationSecurityIntegrationSnapshot {
    return {
      totalDecisions: this.decisions.length,
      totalAnomalies: this.anomalies.listerRecentes(this.retentionMaximale).length,
      totalRefus: this.decisions.filter((decision) => !decision.autorise).length,
      totalRecordsForensic: this.forensic.listerRecentes(this.retentionMaximale).length,
      contexteActif: this.contexteActif,
    };
  }
}
