import type { PoolClient } from 'pg';
import type { MigrationPostgresSecurity } from './MigrationPostgresSecurity';

export class Migration_003_UnifySecurityAudit implements MigrationPostgresSecurity {
  public readonly version = 3;
  public readonly nom = 'unify_security_audit_with_audit_entries';

  public async executer(client: PoolClient): Promise<void> {
    const legacy = await client.query<{ existe: string | null }>(
      "SELECT to_regclass('public.security_audit_events')::text AS existe",
    );
    if (!legacy.rows[0]?.existe) return;
    await client.query(`
      INSERT INTO audit_entries (
        id_audit_entry,action,type_principal,gravite,niveau,resultat,
        correlation_id,acteur_id,type_acteur,type_ressource,id_ressource,
        organisation_id,ecole_id,scope,source_audit,source_runtime,
        date_action,date_creation_audit,metadata
      )
      SELECT id_evenement,action,'SECURITE',
        CASE WHEN succes THEN 'INFO' ELSE 'ATTENTION' END,
        COALESCE(niveau_scope,'PLATEFORME'),
        CASE WHEN succes THEN 'SUCCES' ELSE 'ECHEC' END,
        trace_id,auteur_id,CASE WHEN auteur_id IS NULL THEN 'SYSTEME' ELSE 'UTILISATEUR' END,
        COALESCE(type_cible,'SECURITE'),cible_id,organisation_id,ecole_id,
        COALESCE(niveau_scope,'PLATEFORME'),'SECURITY','BACKEND',cree_le,cree_le,
        COALESCE(details,'{}'::jsonb) || jsonb_build_object('motif',motif)
      FROM security_audit_events
      ON CONFLICT (id_audit_entry) DO NOTHING
    `);
    await client.query(`
      INSERT INTO audit_categories(audit_entry_id,categorie)
      SELECT id_evenement,'SECURITE' FROM security_audit_events
      ON CONFLICT (audit_entry_id,categorie) DO NOTHING
    `);
    await client.query('DROP TABLE security_audit_events');
  }
}
