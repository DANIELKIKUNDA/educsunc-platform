import { randomUUID } from 'node:crypto';
import type { AuditSecurityPort } from '../../application';
import { SecurityAuditIntegrationOrchestrator } from '../../integration';
import type { SqlQueryClient } from '../../../infrastructure/persistence/SqlQueryClient';
import { obtenirClientPostgresAuth } from '../../../auth/infrastructure/persistence/postgres/ClientPoolPostgresAuth';
import {
  CanonicalAuditProducer,
  type CanonicalAuditProducerInput,
} from '../../../audit/infrastructure/producers';

export interface SecurityAuditRecord {
  id_evenement: string;
  auteur_id?: string;
  action: string;
  cible_id?: string;
  type_cible?: string;
  niveau_scope?: string;
  organisation_id?: string;
  ecole_id?: string;
  succes: boolean;
  motif?: string;
  trace_id?: string;
  details?: Record<string, unknown>;
  cree_le: string;
}

export class SecurityAuditInfrastructureService implements AuditSecurityPort {
  private static orchestrateur: SecurityAuditIntegrationOrchestrator | null = null;
  constructor(
    private readonly clientSql: SqlQueryClient = obtenirClientPostgresAuth(),
    private readonly producteurCanonique = new CanonicalAuditProducer(),
  ) {}

  public async journaliser(params: {
    action: string; idUtilisateur?: string; succes: boolean; details?: Record<string, unknown>;
  }): Promise<void> {
    const details = params.details ?? {};
    const mapping = this.mapperAction(params.action, params.succes);
    if (mapping) {
      const correlationId = this.texte(details.traceId)
        ?? this.texte(details.correlationId)
        ?? this.texte(details.sessionId)
        ?? randomUUID();
      await this.producteurCanonique.produire({
        action: mapping.action,
        resultat: mapping.resultat,
        acteur: { id: params.idUtilisateur },
        tenant: this.resoudreTenant(details),
        ressource: {
          type: mapping.typeRessource,
          id: this.texte(details.cibleId) ?? params.idUtilisateur,
          libelle: params.action,
        },
        contexte: { correlationId, sessionId: this.texte(details.sessionId), source: 'HTTP_API' },
        nouvelEtat: mapping.snapshot ? details.apres ?? details : undefined,
        metadata: { ...details, actionSource: params.action },
        idempotencyKey: `SECURITY:${mapping.action}:${correlationId}`,
      });
    }
    await SecurityAuditInfrastructureService.obtenirOrchestrateur().publier({ ...params, details });
  }

  public async lister(params: { succes?: boolean; limite?: number } = {}): Promise<readonly SecurityAuditRecord[]> {
    const limite = Math.min(Math.max(params.limite ?? 100, 1), 500);
    const resultat = await this.clientSql.executer<SecurityAuditRecord>(
      `SELECT id_audit_entry AS id_evenement,acteur_id AS auteur_id,action,
         id_ressource AS cible_id,type_ressource AS type_cible,scope AS niveau_scope,
         organisation_id,ecole_id,(resultat='SUCCESS') AS succes,
         metadata->>'motif' AS motif,correlation_id AS trace_id,
         metadata AS details,date_creation_audit AS cree_le
       FROM audit_entries
       WHERE type_principal='SECURITE'
         AND ($1::boolean IS NULL OR (resultat='SUCCESS')=$1)
       ORDER BY date_action DESC LIMIT $2`, [params.succes ?? null, limite],
    );
    return resultat.lignes;
  }

  private mapperAction(action: string, succes: boolean): {
    action: CanonicalAuditProducerInput['action'];
    resultat: CanonicalAuditProducerInput['resultat'];
    typeRessource: CanonicalAuditProducerInput['ressource']['type'];
    snapshot: boolean;
  } | undefined {
    if (!succes || [
      'SECURITY_PERMISSION_DENIED',
      'SECURITY_SCOPE_DENIED',
      'SECURITY_RESTRICTION_TRIGGERED',
      'SECURITY_INCIDENT_DETECTED',
    ].includes(action)) {
      return { action: 'ACCES_REFUSE', resultat: 'REFUSED', typeRessource: 'UTILISATEUR', snapshot: false };
    }
    if (action === 'SESSION_REVOQUEE' || action === 'SESSIONS_REVOQUEES_GLOBALEMENT') {
      return { action: 'SESSION_REVOQUEE', resultat: 'SUCCESS', typeRessource: 'UTILISATEUR', snapshot: false };
    }
    if (action === 'AFFECTATION_CREEE' || action === 'AFFECTATION_REACTIVEE' || action === 'SECURITY_TITULARIAT_ATTRIBUE') {
      return { action: 'ROLE_ATTRIBUE', resultat: 'SUCCESS', typeRessource: 'ROLE', snapshot: true };
    }
    if (action === 'PERMISSION_AJOUTEE_ROLE') {
      return { action: 'PERMISSION_AJOUTEE', resultat: 'SUCCESS', typeRessource: 'PERMISSION', snapshot: true };
    }
    if (action === 'SECURITY_PERMISSION_GRANTED' || action === 'SECURITY_SCOPE_GRANTED') return undefined;
    return { action: 'GOUVERNANCE_SECURITE_MODIFIEE', resultat: 'SUCCESS', typeRessource: 'UTILISATEUR', snapshot: true };
  }

  private resoudreTenant(details: Record<string, unknown>): CanonicalAuditProducerInput['tenant'] {
    const organisationId = this.texte(details.organisationId);
    const ecoleId = this.texte(details.ecoleId);
    const niveau = this.texte(details.niveauScope);
    if (niveau === 'ECOLE' && organisationId && ecoleId) return { scope: 'ECOLE', organisationId, ecoleId };
    if (niveau === 'ORGANISATION' && organisationId) return { scope: 'ORGANISATION', organisationId };
    return { scope: 'PLATEFORME' };
  }

  private texte(valeur: unknown): string | undefined {
    return typeof valeur === 'string' && valeur.trim() ? valeur.trim() : undefined;
  }

  private static obtenirOrchestrateur(): SecurityAuditIntegrationOrchestrator {
    if (!this.orchestrateur) this.orchestrateur = new SecurityAuditIntegrationOrchestrator();
    return this.orchestrateur;
  }
}
