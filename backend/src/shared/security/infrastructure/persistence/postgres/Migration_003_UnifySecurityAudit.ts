import type { PoolClient } from 'pg';
import type { MigrationPostgresSecurity } from './MigrationPostgresSecurity';

export class Migration_003_UnifySecurityAudit implements MigrationPostgresSecurity {
  public readonly version = 3;
  public readonly nom = 'unify_security_audit_with_audit_entries';

  public async executer(client: PoolClient): Promise<void> {
    const legacy = await client.query<{ existe: string | null }>(
      "SELECT to_regclass('security_audit_events')::text AS existe",
    );
    if (!legacy.rows[0]?.existe) return;
    await client.query(`
      INSERT INTO audit_entries (
        id_audit_entry,action,type_principal,gravite,niveau,resultat,
        correlation_id,acteur_id,type_acteur,role_actif,type_ressource,id_ressource,
        organisation_id,ecole_id,scope,source_audit,source_runtime,
        date_action,date_creation_audit,metadata
      )
      SELECT id_evenement,
        CASE WHEN succes THEN 'GOUVERNANCE_SECURITE_MODIFIEE' ELSE 'ACCES_REFUSE' END,
        'SECURITE',
        CASE WHEN succes THEN 'ELEVEE' ELSE 'MOYENNE' END,
        CASE WHEN succes THEN 'CRITIQUE' ELSE 'AVERTISSEMENT' END,
        CASE WHEN succes THEN 'SUCCESS' ELSE 'REFUSED' END,
        trace_id,auteur_id,CASE WHEN auteur_id IS NULL THEN 'SYSTEME' ELSE 'UTILISATEUR' END,
        CASE WHEN auteur_id IS NULL THEN NULL ELSE 'UTILISATEUR_AUTHENTIFIE' END,
        CASE
          WHEN type_cible IN ('UTILISATEUR','ROLE','PERMISSION','ORGANISATION','ECOLE') THEN type_cible
          ELSE 'UTILISATEUR'
        END,
        cible_id,organisation_id,ecole_id,
        CASE
          WHEN niveau_scope = 'ECOLE' AND ecole_id IS NOT NULL THEN 'ECOLE'
          WHEN niveau_scope = 'ORGANISATION' AND organisation_id IS NOT NULL THEN 'ORGANISATION'
          ELSE 'PLATEFORME'
        END,
        'MIGRATION','MIGRATION',cree_le,cree_le,
        COALESCE(details,'{}'::jsonb) || jsonb_build_object(
          'motif',motif,
          'actionLegacy',action,
          'sourceLegacy','security_audit_events',
          'migrationLegacy',true
        )
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
