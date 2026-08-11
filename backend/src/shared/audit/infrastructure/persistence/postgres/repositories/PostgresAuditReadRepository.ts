import type {
  AuditReadFilters,
  AuditReadPage,
  AuditReadPageRequest,
  AuditReadRepositoryPort,
  AuditReadStatistics,
} from '../../../../application/ports/outbound/AuditReadRepositoryPort';
import type { AuditEntryOutput } from '../../../../application/dto/outputs/AuditEntryOutput';
import type { SqlQueryClient } from '../../../../../infrastructure/persistence/SqlQueryClient';
import { obtenirClientPostgresAuth } from '../../../../../auth/infrastructure/persistence/postgres/ClientPoolPostgresAuth';
import { AuditEntryPersistenceMapper } from '../mappers/AuditEntryPersistenceMapper';
import type { AuditCategoryRow, AuditEntryRow } from '../mappers/AuditPersistenceRecords';

interface AuditListRow {
  id_audit_entry: string;
  action: string;
  type_principal: string;
  gravite: string;
  resultat: string;
  request_id: string | null;
  correlation_id: string | null;
  acteur_id: string | null;
  type_acteur: string;
  role_actif: string | null;
  type_ressource: string | null;
  id_ressource: string | null;
  libelle_ressource: string | null;
  organisation_id: string | null;
  ecole_id: string | null;
  scope: string;
  mode_offline: boolean;
  source_audit: string;
  date_action: string | Date;
  date_creation_audit: string | Date;
  categories: string[] | null;
}

type AuditDetailRow = AuditEntryRow & { categories: string[] | null };

export class PostgresAuditReadRepository implements AuditReadRepositoryPort {
  public constructor(private readonly clientSql: SqlQueryClient = obtenirClientPostgresAuth()) {}

  public async rechercher(filtres: AuditReadFilters, pagination: AuditReadPageRequest): Promise<AuditReadPage> {
    const { clauses, valeurs } = this.construireWhere(filtres);
    if (pagination.position) {
      valeurs.push(pagination.position.dateAction, pagination.position.idAuditEntry);
      clauses.push(`(e.date_action,e.id_audit_entry) < ($${valeurs.length - 1}::timestamptz,$${valeurs.length}::text)`);
    }
    valeurs.push(pagination.limite + 1);
    const resultat = await this.clientSql.executer<AuditListRow>(
      `SELECT
         e.id_audit_entry,e.action,e.type_principal,e.gravite,e.resultat,
         e.request_id,e.correlation_id,e.acteur_id,e.type_acteur,e.role_actif,
         e.type_ressource,e.id_ressource,e.libelle_ressource,e.organisation_id,
         e.ecole_id,e.scope,e.mode_offline,e.source_audit,e.date_action,e.date_creation_audit,
         ARRAY(SELECT c.categorie FROM audit_categories c
               WHERE c.audit_entry_id=e.id_audit_entry ORDER BY c.id) AS categories
       FROM audit_entries e
       WHERE ${clauses.length > 0 ? clauses.join(' AND ') : 'TRUE'}
       ORDER BY e.date_action DESC,e.id_audit_entry DESC
       LIMIT $${valeurs.length}`,
      valeurs,
    );
    const hasNextPage = resultat.lignes.length > pagination.limite;
    const lignes = hasNextPage ? resultat.lignes.slice(0, pagination.limite) : resultat.lignes;
    return { items: lignes.map((ligne) => this.versSortieListe(ligne)), hasNextPage };
  }

  public async obtenirParId(filtres: AuditReadFilters): Promise<AuditEntryOutput | null> {
    const { clauses, valeurs } = this.construireWhere(filtres);
    const resultat = await this.clientSql.executer<AuditDetailRow>(
      `SELECT e.*,
         ARRAY(SELECT c.categorie FROM audit_categories c
               WHERE c.audit_entry_id=e.id_audit_entry ORDER BY c.id) AS categories
       FROM audit_entries e
       WHERE ${clauses.length > 0 ? clauses.join(' AND ') : 'FALSE'}
       LIMIT 1`,
      valeurs,
    );
    const ligne = resultat.lignes[0];
    if (!ligne) return null;
    const categories: AuditCategoryRow[] = (ligne.categories ?? []).map((categorie, index) => ({
      id: index + 1,
      audit_entry_id: ligne.id_audit_entry,
      categorie,
    }));
    return AuditEntryPersistenceMapper.versAuditEntryOutput(
      AuditEntryPersistenceMapper.depuisRows(ligne, categories),
    );
  }

  public async compter(filtres: AuditReadFilters): Promise<AuditReadStatistics> {
    const { clauses, valeurs } = this.construireWhere(filtres);
    const resultat = await this.clientSql.executer<{
      total: string | number;
      critiques: string | number;
      echecs: string | number;
      exports: string | number;
      securite: string | number;
      replays: string | number;
      retries: string | number;
    }>(
      `SELECT
         COUNT(*) AS total,
         COUNT(*) FILTER (WHERE e.gravite IN ('CRITIQUE','ELEVEE')) AS critiques,
         COUNT(*) FILTER (WHERE e.resultat IN ('ECHEC','REFUS')) AS echecs,
         COUNT(*) FILTER (WHERE EXISTS(
           SELECT 1 FROM audit_categories c WHERE c.audit_entry_id=e.id_audit_entry AND c.categorie='EXPORT'
         )) AS exports,
         COUNT(*) FILTER (WHERE EXISTS(
           SELECT 1 FROM audit_categories c WHERE c.audit_entry_id=e.id_audit_entry AND c.categorie='SECURITE'
         )) AS securite,
         COUNT(*) FILTER (WHERE e.est_replay=TRUE) AS replays,
         COUNT(*) FILTER (WHERE e.est_retry=TRUE) AS retries
       FROM audit_entries e
       WHERE ${clauses.length > 0 ? clauses.join(' AND ') : 'TRUE'}`,
      valeurs,
    );
    const ligne = resultat.lignes[0];
    const nombre = (valeur: string | number | undefined) => Number(valeur ?? 0);
    return {
      total: nombre(ligne?.total),
      critiques: nombre(ligne?.critiques),
      echecs: nombre(ligne?.echecs),
      exports: nombre(ligne?.exports),
      securite: nombre(ligne?.securite),
      replays: nombre(ligne?.replays),
      retries: nombre(ligne?.retries),
    };
  }

  private construireWhere(filtres: AuditReadFilters): { clauses: string[]; valeurs: unknown[] } {
    const clauses: string[] = [];
    const valeurs: unknown[] = [];
    const egal = (colonne: string, valeur: unknown) => {
      if (valeur === undefined) return;
      valeurs.push(valeur);
      clauses.push(`${colonne}=$${valeurs.length}`);
    };
    egal('e.id_audit_entry', filtres.idAuditEntry);
    egal('e.organisation_id', filtres.organisationId);
    egal('e.ecole_id', filtres.ecoleId);
    egal('e.acteur_id', filtres.acteurId);
    egal('e.type_principal', filtres.typeAuditPrincipal);
    egal('e.action', filtres.action);
    egal('e.gravite', filtres.gravite);
    egal('e.resultat', filtres.resultat);
    egal('e.type_ressource', filtres.typeRessource);
    egal('e.id_ressource', filtres.ressourceId);
    egal('e.correlation_id', filtres.correlationId);
    egal('e.request_id', filtres.requestId);
    egal('e.source_audit', filtres.sourceAudit);
    egal('e.adresse_ip', filtres.adresseIp);
    if (filtres.categorieAudit) {
      valeurs.push(filtres.categorieAudit);
      clauses.push(`EXISTS(SELECT 1 FROM audit_categories c
        WHERE c.audit_entry_id=e.id_audit_entry AND c.categorie=$${valeurs.length})`);
    }
    if (filtres.dateDebut) {
      valeurs.push(filtres.dateDebut);
      clauses.push(`e.date_action >= $${valeurs.length}::timestamptz`);
    }
    if (filtres.dateFin) {
      valeurs.push(filtres.dateFin);
      clauses.push(`e.date_action <= $${valeurs.length}::timestamptz`);
    }
    return { clauses, valeurs };
  }

  private versSortieListe(ligne: AuditListRow): AuditEntryOutput {
    const dateAction = this.iso(ligne.date_action);
    const ressource = ligne.id_ressource || ligne.type_ressource
      ? {
        typeRessource: ligne.type_ressource ?? undefined,
        idRessource: ligne.id_ressource ?? undefined,
        libelle: ligne.libelle_ressource ?? undefined,
      }
      : undefined;
    return {
      idAuditEntry: ligne.id_audit_entry,
      action: ligne.action,
      typePrincipal: ligne.type_principal,
      typeAuditPrincipal: ligne.type_principal,
      categories: ligne.categories?.length ? ligne.categories : [ligne.type_principal],
      gravite: ligne.gravite,
      resultat: ligne.resultat,
      acteur: {
        idUtilisateur: ligne.acteur_id ?? undefined,
        typeActeur: ligne.type_acteur,
        roleActif: ligne.role_actif ?? undefined,
      },
      ressource,
      tenant: {
        organisationId: ligne.organisation_id ?? undefined,
        ecoleId: ligne.ecole_id ?? undefined,
        scope: ligne.scope,
      },
      contexte: {
        requestId: ligne.request_id ?? undefined,
        correlationId: ligne.correlation_id ?? undefined,
        sourceAudit: ligne.source_audit,
        modeOffline: ligne.mode_offline,
      },
      organisationId: ligne.organisation_id ?? undefined,
      ecoleId: ligne.ecole_id ?? undefined,
      correlationId: ligne.correlation_id ?? undefined,
      createdAt: this.iso(ligne.date_creation_audit),
      dateAction,
    };
  }

  private iso(valeur: string | Date): string {
    return valeur instanceof Date ? valeur.toISOString() : new Date(valeur).toISOString();
  }
}
