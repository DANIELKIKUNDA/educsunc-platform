import { randomUUID } from 'node:crypto';
import type { AuditSecurityPort } from '../../application';
import { SecurityAuditIntegrationOrchestrator } from '../../integration';
import type { SqlQueryClient } from '../../../infrastructure/persistence/SqlQueryClient';
import { obtenirClientPostgresAuth } from '../../../auth/infrastructure/persistence/postgres/ClientPoolPostgresAuth';

type ClientTransactionnel = SqlQueryClient & { dansTransaction?<T>(operation: () => Promise<T>): Promise<T> };

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

const CHAMPS_SENSIBLES = /password|mot.?de.?passe|token|jwt|cookie|secret|hash|authorization/i;

function nettoyerDetails(valeur: unknown): unknown {
  if (Array.isArray(valeur)) return valeur.map(nettoyerDetails);
  if (valeur && typeof valeur === 'object') {
    return Object.fromEntries(Object.entries(valeur as Record<string, unknown>)
      .filter(([cle]) => !CHAMPS_SENSIBLES.test(cle))
      .map(([cle, contenu]) => [cle, nettoyerDetails(contenu)]));
  }
  return valeur;
}

export class SecurityAuditInfrastructureService implements AuditSecurityPort {
  private static orchestrateur: SecurityAuditIntegrationOrchestrator | null = null;
  constructor(private readonly clientSql: ClientTransactionnel = obtenirClientPostgresAuth()) {}

  public async journaliser(params: {
    action: string; idUtilisateur?: string; succes: boolean; details?: Record<string, unknown>;
  }): Promise<void> {
    const details = nettoyerDetails(params.details ?? {}) as Record<string, unknown>;
    const id = randomUUID();
    const maintenant = new Date().toISOString();
    const scope = typeof details.niveauScope === 'string' ? details.niveauScope : 'PLATEFORME';
    await this.dansTransaction(async () => {
      await this.clientSql.executer(
        `INSERT INTO audit_entries (
           id_audit_entry,action,type_principal,gravite,niveau,resultat,
           correlation_id,acteur_id,type_acteur,type_ressource,id_ressource,
           organisation_id,ecole_id,scope,source_audit,source_runtime,
           date_action,date_creation_audit,metadata
         ) VALUES ($1,$2,'SECURITE',$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,
           'SECURITY','BACKEND',$14,$14,$15::jsonb)`,
        [id,params.action,params.succes ? 'INFO' : 'ATTENTION',scope,
          params.succes ? 'SUCCES' : 'ECHEC',
          typeof details.traceId === 'string' ? details.traceId : null,
          params.idUtilisateur ?? null,params.idUtilisateur ? 'UTILISATEUR' : 'SYSTEME',
          typeof details.typeCible === 'string' ? details.typeCible : 'SECURITE',
          typeof details.cibleId === 'string' ? details.cibleId : null,
          typeof details.organisationId === 'string' ? details.organisationId : null,
          typeof details.ecoleId === 'string' ? details.ecoleId : null,scope,maintenant,
          JSON.stringify(details)],
      );
      await this.clientSql.executer(
        `INSERT INTO audit_categories(audit_entry_id,categorie) VALUES ($1,'SECURITE')`, [id],
      );
    });
    await SecurityAuditInfrastructureService.obtenirOrchestrateur().publier({...params, details});
  }

  public async lister(params: { succes?: boolean; limite?: number } = {}): Promise<readonly SecurityAuditRecord[]> {
    const limite = Math.min(Math.max(params.limite ?? 100, 1), 500);
    const resultat = await this.clientSql.executer<SecurityAuditRecord>(
      `SELECT id_audit_entry AS id_evenement,acteur_id AS auteur_id,action,
         id_ressource AS cible_id,type_ressource AS type_cible,scope AS niveau_scope,
         organisation_id,ecole_id,(resultat='SUCCES') AS succes,
         metadata->>'motif' AS motif,correlation_id AS trace_id,
         metadata AS details,date_creation_audit AS cree_le
       FROM audit_entries
       WHERE type_principal='SECURITE'
         AND ($1::boolean IS NULL OR (resultat='SUCCES')=$1)
       ORDER BY date_action DESC LIMIT $2`, [params.succes ?? null, limite],
    );
    return resultat.lignes;
  }

  private async dansTransaction<T>(operation: () => Promise<T>): Promise<T> {
    return this.clientSql.dansTransaction ? this.clientSql.dansTransaction(operation) : operation();
  }

  private static obtenirOrchestrateur(): SecurityAuditIntegrationOrchestrator {
    if (!this.orchestrateur) this.orchestrateur = new SecurityAuditIntegrationOrchestrator();
    return this.orchestrateur;
  }
}
