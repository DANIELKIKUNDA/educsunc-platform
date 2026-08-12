import { SecurityAuditPort } from '../../../application/ports/security/SecurityAuditPort';
import { AuthAuditIntegrationOrchestrator } from '../../../integration';
import { CanonicalAuditProducer } from '../../../../audit/infrastructure/producers';
import type { CanonicalAuditProducerInput } from '../../../../audit/infrastructure/producers';

type EvenementAuditAuth = {
  action: string;
  utilisateurId?: string;
  succes: boolean;
  details?: Record<string, unknown>;
};

// Cet adaptateur publie les evenements d'audit AUTH vers un systeme technique externe.
export class SecurityAuditAdapter implements SecurityAuditPort {
  private readonly producteurCanonique?: CanonicalAuditProducer;

  constructor(
    private readonly enregistrer?: (evenement: EvenementAuditAuth) => Promise<void>,
    producteurCanonique?: CanonicalAuditProducer,
  ) {
    this.producteurCanonique = producteurCanonique ?? (enregistrer ? undefined : new CanonicalAuditProducer());
  }

  private static orchestrateur: AuthAuditIntegrationOrchestrator | null = null;

  public async publierAuditSecurite(params: {
    action: string;
    utilisateurId?: string;
    succes: boolean;
    details?: Record<string, unknown>;
  }): Promise<void> {
    await SecurityAuditAdapter.obtenirOrchestrateur().publierAction(params);
    await this.enregistrer?.(params);
    await this.produireActionGenerique(params);
  }

  public async journaliserConnexion(params: {
    utilisateurId: string;
    sessionId: string;
    organisationActiveId?: string;
    ecoleActiveId?: string;
    estOffline: boolean;
    deviceId?: string;
    adresseIp?: string;
    userAgent?: string;
  }): Promise<void> {
    await SecurityAuditAdapter.obtenirOrchestrateur().publierConnexion(params);
    await this.enregistrer?.({
      action: 'AUTH_LOGIN',
      utilisateurId: params.utilisateurId,
      succes: true,
      details: params,
    });
    await this.producteurCanonique?.produire({
      action: 'LOGIN_REUSSI',
      resultat: 'SUCCESS',
      acteur: { id: params.utilisateurId },
      tenant: this.resoudreTenant(params.organisationActiveId, params.ecoleActiveId),
      ressource: { type: 'UTILISATEUR', id: params.utilisateurId, libelle: 'Connexion utilisateur' },
      contexte: {
        sessionId: params.sessionId,
        correlationId: params.sessionId,
        adresseIp: params.adresseIp,
        userAgent: params.userAgent,
        deviceId: params.deviceId,
        source: params.estOffline ? 'OFFLINE_DEVICE' : 'HTTP_API',
      },
      metadata: { estOffline: params.estOffline },
      idempotencyKey: `AUTH:LOGIN_REUSSI:${params.sessionId}`,
    });
  }

  public async journaliserEchec(params: {
    email?: string;
    utilisateurId?: string;
    raison: string;
    sessionId?: string;
    organisationActiveId?: string;
    ecoleActiveId?: string;
    deviceId?: string;
    adresseIp?: string;
    userAgent?: string;
  }): Promise<void> {
    await SecurityAuditAdapter.obtenirOrchestrateur().publierEchec(params);
    await this.enregistrer?.({
      action: 'AUTH_FAILURE',
      utilisateurId: params.utilisateurId,
      succes: false,
      details: params,
    });
    const correlationId = params.sessionId ?? `${Date.now()}-${params.utilisateurId ?? 'ANONYME'}`;
    await this.producteurCanonique?.produire({
      action: 'LOGIN_ECHOUE',
      resultat: 'FAILED',
      acteur: { id: params.utilisateurId },
      tenant: this.resoudreTenant(params.organisationActiveId, params.ecoleActiveId),
      ressource: { type: 'UTILISATEUR', id: params.utilisateurId, libelle: 'Tentative de connexion' },
      contexte: {
        sessionId: params.sessionId,
        correlationId,
        adresseIp: params.adresseIp,
        userAgent: params.userAgent,
        deviceId: params.deviceId,
        source: 'HTTP_API',
      },
      metadata: { raison: params.raison },
      idempotencyKey: `AUTH:LOGIN_ECHOUE:${correlationId}`,
    });
  }

  private async produireActionGenerique(params: EvenementAuditAuth): Promise<void> {
    const definition = this.mapperAction(params.action, params.succes);
    if (!definition || !this.producteurCanonique) return;

    const details = params.details ?? {};
    const organisationId = this.texte(details.organisationId) ?? this.texte(details.organisationActiveId);
    const ecoleId = this.texte(details.ecoleId) ?? this.texte(details.ecoleActiveId);
    const correlationId = this.texte(details.traceId)
      ?? this.texte(details.correlationId)
      ?? this.texte(details.sessionId)
      ?? `${Date.now()}-${params.utilisateurId ?? 'SYSTEME'}`;
    await this.producteurCanonique.produire({
      action: definition.action,
      resultat: definition.resultat,
      acteur: { id: params.utilisateurId },
      tenant: this.resoudreTenant(organisationId, ecoleId),
      ressource: {
        type: definition.typeRessource,
        id: this.texte(details.cibleId) ?? params.utilisateurId,
        libelle: params.action,
      },
      contexte: {
        sessionId: this.texte(details.sessionId),
        correlationId,
        source: 'HTTP_API',
      },
      metadata: { ...details, actionSource: params.action },
      idempotencyKey: `AUTH:${definition.action}:${correlationId}`,
    });
  }

  private mapperAction(action: string, succes: boolean): {
    action: CanonicalAuditProducerInput['action'];
    resultat: CanonicalAuditProducerInput['resultat'];
    typeRessource: CanonicalAuditProducerInput['ressource']['type'];
  } | undefined {
    if (action === 'AUTH_LOGOUT') return { action: 'LOGOUT', resultat: 'SUCCESS', typeRessource: 'UTILISATEUR' };
    if (action === 'AUTH_REVOKE_ALL_SESSIONS' || action === 'AUTH_REFRESH_REPLAY' || action === 'AUTH_REFRESH_REVOKED') {
      return { action: 'SESSION_REVOQUEE', resultat: succes ? 'SUCCESS' : 'FAILED', typeRessource: 'UTILISATEUR' };
    }
    return undefined;
  }

  private resoudreTenant(organisationId?: string, ecoleId?: string): CanonicalAuditProducerInput['tenant'] {
    if (organisationId && ecoleId) return { scope: 'ECOLE', organisationId, ecoleId };
    if (organisationId) return { scope: 'ORGANISATION', organisationId };
    return { scope: 'PLATEFORME' };
  }

  private texte(valeur: unknown): string | undefined {
    return typeof valeur === 'string' && valeur.trim() ? valeur.trim() : undefined;
  }

  private static obtenirOrchestrateur(): AuthAuditIntegrationOrchestrator {
    if (!this.orchestrateur) {
      this.orchestrateur = new AuthAuditIntegrationOrchestrator();
    }

    return this.orchestrateur;
  }
}
