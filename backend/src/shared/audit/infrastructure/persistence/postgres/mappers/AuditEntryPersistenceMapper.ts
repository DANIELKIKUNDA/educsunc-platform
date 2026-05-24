import { AuditEntry } from '../../../../domain/aggregates';
import {
  AuditMetadata,
  ContexteAudit,
  RessourceAudit,
} from '../../../../domain/entities';
import {
  ActionAudit,
  AuditTimestamp,
  GraviteAudit,
  IdentifiantRessourceAudit,
  NiveauAudit,
  ResultatAudit,
  TypeAudit,
  TypeRessourceAudit,
} from '../../../../domain/value-objects';
import type { AuditEntryOutput } from '../../../../application/dto/outputs/AuditEntryOutput';
import type { AuditEntryDetailsReadModel } from '../../../../application/read-models/consultation/AuditEntryDetailsReadModel';
import type { AuditSearchItemReadModel } from '../../../../application/read-models/search/AuditSearchItemReadModel';
import type { AuditCategoryRow, AuditEntryRow } from './AuditPersistenceRecords';
import { AuditActorPersistenceMapper } from './AuditActorPersistenceMapper';
import { AuditContextPersistenceMapper } from './AuditContextPersistenceMapper';
import { AuditOfflinePersistenceMapper } from './AuditOfflinePersistenceMapper';
import { AuditSnapshotPersistenceMapper } from './AuditSnapshotPersistenceMapper';
import { AuditTenantPersistenceMapper } from './AuditTenantPersistenceMapper';
import { AuditJsonbMapper } from './AuditJsonbMapper';

// Ce mapper principal relie PostgreSQL aux agregats et sorties applicatives Audit.
export class AuditEntryPersistenceMapper {
  public static versRows(entree: AuditEntry): { auditEntry: AuditEntryRow; categories: AuditCategoryRow[] } {
    const acteurAudit = entree.obtenirActeurAudit();
    const contexteAudit = entree.obtenirContexteAudit();
    const auditCorrelation = entree.obtenirAuditCorrelation();
    const auditMetadata = entree.obtenirAuditMetadata();
    const auditExecutionContext = entree.obtenirAuditExecutionContext();
    const tenantAudit = entree.obtenirTenantAudit();
    const auditOfflineMetadata = entree.obtenirAuditOfflineMetadata();
    const horodatage = entree.obtenirHorodatageAudit();
    const snapshots = AuditSnapshotPersistenceMapper.versJsonb(entree.obtenirAuditSnapshot());

    const acteurColonnes = AuditActorPersistenceMapper.versColonnes({
      idAuditEntry: entree.obtenirId(),
      acteurAudit,
      auditPermissionContext: entree.obtenirAuditPermissionContext(),
    });
    const contexteColonnes = AuditContextPersistenceMapper.versColonnes({
      idAuditEntry: entree.obtenirId(),
      contexteAudit,
      auditCorrelation,
      auditMetadata,
      auditExecutionContext,
    });
    const tenantColonnes = AuditTenantPersistenceMapper.versColonnes({
      idAuditEntry: entree.obtenirId(),
      tenantAudit,
    });
    const offlineColonnes = AuditOfflinePersistenceMapper.versColonnes({
      idAuditEntry: entree.obtenirId(),
      auditOfflineMetadata,
      dateAction: horodatage.obtenirDateAction(),
      dateSynchronisation: horodatage.obtenirDateSynchronisation(),
    });

    const ressource = entree.obtenirRessourceAudit();
    const auditEntry: AuditEntryRow = {
      id_audit_entry: entree.obtenirId(),
      action: entree.obtenirActionAudit().obtenirValeur(),
      type_principal: entree.obtenirTypeAuditPrincipal().obtenirValeur(),
      gravite: entree.obtenirGraviteAudit().obtenirValeur(),
      niveau: entree.obtenirNiveauAudit().obtenirValeur(),
      resultat: entree.obtenirResultatAudit().obtenirValeur(),
      request_id: contexteColonnes.request_id,
      correlation_id: contexteColonnes.correlation_id,
      session_id: contexteColonnes.session_id,
      sync_id: auditOfflineMetadata?.obtenirSourceOffline() ?? null,
      replay_id: auditOfflineMetadata?.estReplay() ? `${entree.obtenirId()}-replay` : null,
      acteur_id: acteurColonnes.acteur_id,
      type_acteur: acteurColonnes.type_acteur,
      role_actif: acteurColonnes.role_actif,
      type_ressource: ressource.obtenirTypeRessource().obtenirValeur(),
      id_ressource: ressource.obtenirIdentifiantRessource().obtenirValeur() ?? null,
      libelle_ressource: ressource.obtenirLibelleRessource() ?? null,
      organisation_id: tenantColonnes.organisation_id,
      ecole_id: tenantColonnes.ecole_id,
      scope: tenantColonnes.scope,
      mode_offline: offlineColonnes.mode_offline,
      statut_synchronisation: offlineColonnes.statut_synchronisation,
      retry_count: offlineColonnes.retry_count,
      est_replay: offlineColonnes.est_replay,
      est_retry: offlineColonnes.est_retry,
      adresse_ip: contexteColonnes.adresse_ip,
      user_agent: contexteColonnes.user_agent,
      device_id: contexteColonnes.device_id,
      source_audit: contexteColonnes.source_audit,
      source_runtime: contexteColonnes.source_runtime,
      version_application: contexteColonnes.version_application,
      date_action: horodatage.obtenirDateAction().toISOString(),
      date_creation_audit: horodatage.obtenirDateCreationAudit().toISOString(),
      date_synchronisation: offlineColonnes.date_synchronisation,
      ancien_etat: snapshots.ancien_etat,
      nouvel_etat: snapshots.nouvel_etat,
      metadata: contexteColonnes.metadata,
      contexte_permissions: acteurColonnes.contexte_permissions,
      contexte_execution: contexteColonnes.contexte_execution,
    };

    const categories = entree.obtenirCategoriesAudit().map((categorie, index) => ({
      id: index + 1,
      audit_entry_id: entree.obtenirId(),
      categorie: categorie.obtenirValeur(),
    }));

    return { auditEntry, categories };
  }

  public static depuisRows(row: AuditEntryRow, categoriesRows: readonly AuditCategoryRow[] = []): AuditEntry {
    const { acteurAudit, auditPermissionContext } = AuditActorPersistenceMapper.depuisColonnes(row);
    const { contexteAudit, auditCorrelation, auditMetadata, auditExecutionContext } = AuditContextPersistenceMapper.depuisColonnes(row);
    const tenantAudit = AuditTenantPersistenceMapper.depuisColonnes(row);
    const auditOfflineMetadata = AuditOfflinePersistenceMapper.depuisColonnes(row);
    const auditSnapshot = AuditSnapshotPersistenceMapper.depuisJsonb(
      row.id_audit_entry,
      row.ancien_etat,
      row.nouvel_etat,
      new Date(row.date_creation_audit),
    );
    const ressourceAudit = this.construireRessourceAudit(row);

    return new AuditEntry({
      idAuditEntry: row.id_audit_entry,
      typeAuditPrincipal: new TypeAudit(row.type_principal),
      categoriesAudit: (categoriesRows.length > 0 ? categoriesRows : [{ id: 0, audit_entry_id: row.id_audit_entry, categorie: row.type_principal }])
        .map((categorie) => new TypeAudit(categorie.categorie)),
      niveauAudit: new NiveauAudit(row.niveau),
      graviteAudit: new GraviteAudit(row.gravite),
      actionAudit: new ActionAudit(row.action),
      acteurAudit,
      contexteAudit: this.enrichirContexteAvecOffline(contexteAudit, row.mode_offline),
      tenantAudit,
      ressourceAudit,
      resultatAudit: new ResultatAudit(row.resultat),
      auditSnapshot,
      auditOfflineMetadata,
      auditMetadata: this.enrichirMetadataAvecSourceAudit(auditMetadata, row.source_audit),
      auditCorrelation,
      auditPermissionContext,
      auditExecutionContext,
      horodatageAudit: new AuditTimestamp({
        dateAction: new Date(row.date_action),
        dateCreationAudit: new Date(row.date_creation_audit),
        dateSynchronisation: row.date_synchronisation ? new Date(row.date_synchronisation) : undefined,
      }),
    });
  }

  public static versAuditEntryOutput(entree: AuditEntry): AuditEntryOutput {
    const tenant = entree.obtenirTenantAudit();
    const contexte = entree.obtenirContexteAudit();
    const ressource = entree.obtenirRessourceAudit();
    return {
      idAuditEntry: entree.obtenirId(),
      action: entree.obtenirActionAudit().obtenirValeur(),
      typePrincipal: entree.obtenirTypeAuditPrincipal().obtenirValeur(),
      typeAuditPrincipal: entree.obtenirTypeAuditPrincipal().obtenirValeur(),
      categories: entree.obtenirCategoriesAudit().map((categorie) => categorie.obtenirValeur()),
      gravite: entree.obtenirGraviteAudit().obtenirValeur(),
      resultat: entree.obtenirResultatAudit().obtenirValeur(),
      acteur: {
        idUtilisateur: entree.obtenirActeurAudit().obtenirIdUtilisateur(),
        typeActeur: entree.obtenirActeurAudit().obtenirTypeActeur(),
        roleActif: entree.obtenirActeurAudit().obtenirRoleActif(),
      },
      ressource: ressource.obtenirIdentifiantRessource().estRenseigne()
        ? {
          typeRessource: ressource.obtenirTypeRessource().obtenirValeur(),
          idRessource: ressource.obtenirIdentifiantRessource().obtenirValeur(),
          libelle: ressource.obtenirLibelleRessource(),
        }
        : undefined,
      tenant: {
        organisationId: tenant.obtenirOrganisationId(),
        ecoleId: tenant.obtenirEcoleId(),
        scope: tenant.obtenirScope().obtenirValeur(),
      },
      contexte: {
        requestId: contexte.obtenirRequestId()?.obtenirValeur(),
        correlationId: entree.obtenirAuditCorrelation()?.obtenirCorrelationId()?.obtenirValeur()
          ?? contexte.obtenirCorrelationId()?.obtenirValeur(),
        sessionId: contexte.obtenirSessionId(),
        sourceAudit: String(entree.obtenirAuditMetadata()?.obtenirMetadataAdditionnelle().sourceAuditOriginal ?? contexte.obtenirSourceRuntime().obtenirValeur()),
        modeOffline: contexte.estOffline(),
      },
      organisationId: tenant.obtenirOrganisationId(),
      ecoleId: tenant.obtenirEcoleId(),
      correlationId: entree.obtenirAuditCorrelation()?.obtenirCorrelationId()?.obtenirValeur()
        ?? contexte.obtenirCorrelationId()?.obtenirValeur(),
      metadata: AuditJsonbMapper.deserialiserObjet(
        AuditJsonbMapper.serialiser({
          ...(entree.obtenirAuditMetadata()?.obtenirMetadataAdditionnelle() ?? {}),
          ancienEtat: entree.obtenirAuditSnapshot()?.obtenirSnapshots().obtenirAncienEtat(),
          nouvelEtat: entree.obtenirAuditSnapshot()?.obtenirSnapshots().obtenirNouvelEtat(),
        }),
      ),
      createdAt: entree.obtenirHorodatageAudit().obtenirDateCreationAudit().toISOString(),
      dateAction: entree.obtenirHorodatageAudit().obtenirDateAction().toISOString(),
    };
  }

  public static versAuditSearchItem(entree: AuditEntry): AuditEntryOutput {
    return this.versAuditEntryOutput(entree);
  }

  public static versSearchReadModel(entree: AuditEntry): AuditSearchItemReadModel {
    return {
      idAuditEntry: entree.obtenirId(),
      action: entree.obtenirActionAudit().obtenirValeur(),
      typeAuditPrincipal: entree.obtenirTypeAuditPrincipal().obtenirValeur(),
      gravite: entree.obtenirGraviteAudit().obtenirValeur(),
      resultat: entree.obtenirResultatAudit().obtenirValeur(),
      dateAction: entree.obtenirHorodatageAudit().obtenirDateAction().toISOString(),
    };
  }

  public static versDetailsReadModel(entree: AuditEntry): AuditEntryDetailsReadModel {
    return {
      audit: this.versAuditEntryOutput(entree),
      ancienEtat: entree.obtenirAuditSnapshot()?.obtenirSnapshots().obtenirAncienEtat(),
      nouvelEtat: entree.obtenirAuditSnapshot()?.obtenirSnapshots().obtenirNouvelEtat(),
      metadata: entree.obtenirAuditMetadata()?.obtenirMetadataAdditionnelle(),
    };
  }

  private static construireRessourceAudit(row: AuditEntryRow): RessourceAudit {
    return new RessourceAudit({
      idRessourceAudit: `${row.id_audit_entry}-resource`,
      typeRessource: new TypeRessourceAudit(row.type_ressource ?? 'AUTRE'),
      identifiantRessource: new IdentifiantRessourceAudit(row.id_ressource),
      libelleRessource: row.libelle_ressource ?? undefined,
    });
  }

  private static enrichirContexteAvecOffline(contexte: ContexteAudit, modeOffline: boolean): ContexteAudit {
    if (contexte.estOffline() === modeOffline) {
      return contexte;
    }
    return new ContexteAudit({
      idContexteAudit: contexte.obtenirId(),
      requestId: contexte.obtenirRequestId(),
      correlationId: contexte.obtenirCorrelationId(),
      sessionId: contexte.obtenirSessionId(),
      adresseIp: contexte.obtenirAdresseIp(),
      userAgent: contexte.obtenirUserAgent(),
      deviceId: contexte.obtenirDeviceId(),
      modeOffline,
      sourceRuntime: contexte.obtenirSourceRuntime(),
      versionApplication: contexte.obtenirVersionApplication(),
      versionApi: contexte.obtenirVersionApi(),
      plateforme: contexte.obtenirPlateforme(),
      environnement: contexte.obtenirEnvironnement(),
    });
  }

  private static enrichirMetadataAvecSourceAudit(metadata: AuditMetadata | undefined, sourceAudit: string): AuditMetadata | undefined {
    if (!metadata) {
      return new AuditMetadata({
        idAuditMetadata: `metadata-${Date.now()}`,
        metadataAdditionnelle: { sourceAuditOriginal: sourceAudit },
      });
    }
    return new AuditMetadata({
      idAuditMetadata: metadata.obtenirId(),
      versionApi: metadata.obtenirVersionApi(),
      versionFrontend: metadata.obtenirVersionFrontend(),
      versionMobile: metadata.obtenirVersionMobile(),
      build: metadata.obtenirBuild(),
      region: metadata.obtenirRegion(),
      runtime: metadata.obtenirRuntime(),
      langue: metadata.obtenirLangue(),
      canal: metadata.obtenirCanal(),
      metadataAdditionnelle: {
        ...metadata.obtenirMetadataAdditionnelle(),
        sourceAuditOriginal: sourceAudit,
      },
    });
  }
}
