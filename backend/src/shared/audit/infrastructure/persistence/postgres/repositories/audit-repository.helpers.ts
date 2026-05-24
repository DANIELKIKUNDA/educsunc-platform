import { randomUUID } from 'node:crypto';
import type { AuditEntry } from '../../../../domain/aggregates';
import type {
  AuditAnalyticsSnapshot,
  AuditArchiveRecord,
  AuditExportRecord,
  AuditForensicTrace,
  AuditPagination,
  AuditProjectionRecord,
  AuditSearchFilters,
  AuditSearchResult,
  AuditSyncConflictRecord,
} from '../../../../domain/repositories';

export interface AuditEntryView {
  idAuditEntry: string;
  typeAuditPrincipal: string;
  categoriesAudit: string[];
  niveauAudit: string;
  graviteAudit: string;
  resultatAudit: string;
  actionAudit: string;
  acteurId?: string;
  typeActeur: string;
  roleActif?: string;
  requestId?: string;
  correlationId?: string;
  sessionId?: string;
  organisationId?: string;
  ecoleId?: string;
  scope: string;
  typeRessource?: string;
  idRessource?: string;
  libelleRessource?: string;
  modeOffline: boolean;
  statutSynchronisation?: string;
  synchronise: boolean;
  replay: boolean;
  retry: boolean;
  enConflit: boolean;
  deviceId?: string;
  adresseIp?: string;
  sourceAudit: string;
  sourceRuntime: string;
  dateAction: Date;
  dateCreationAudit: Date;
  dateSynchronisation?: Date;
}

// Cette fonction aplati l'agregat pour des filtres repositories performants et lisibles.
export function construireVueAudit(entree: AuditEntry): AuditEntryView {
  const correlation = entree.obtenirAuditCorrelation();
  const offline = entree.obtenirAuditOfflineMetadata();
  const contexte = entree.obtenirContexteAudit();
  const acteur = entree.obtenirActeurAudit();
  const ressource = entree.obtenirRessourceAudit();
  const tenant = entree.obtenirTenantAudit();
  const horodatage = entree.obtenirHorodatageAudit();

  return {
    idAuditEntry: entree.obtenirId(),
    typeAuditPrincipal: entree.obtenirTypeAuditPrincipal().obtenirValeur(),
    categoriesAudit: entree.obtenirCategoriesAudit().map((categorie) => categorie.obtenirValeur()),
    niveauAudit: entree.obtenirNiveauAudit().obtenirValeur(),
    graviteAudit: entree.obtenirGraviteAudit().obtenirValeur(),
    resultatAudit: entree.obtenirResultatAudit().obtenirValeur(),
    actionAudit: entree.obtenirActionAudit().obtenirValeur(),
    acteurId: acteur.obtenirIdUtilisateur(),
    typeActeur: acteur.obtenirTypeActeur(),
    roleActif: acteur.obtenirRoleActif(),
    requestId: contexte.obtenirRequestId()?.obtenirValeur(),
    correlationId: correlation?.obtenirCorrelationId()?.obtenirValeur() ?? contexte.obtenirCorrelationId()?.obtenirValeur(),
    sessionId: contexte.obtenirSessionId(),
    organisationId: tenant.obtenirOrganisationId(),
    ecoleId: tenant.obtenirEcoleId(),
    scope: tenant.obtenirScope().obtenirValeur(),
    typeRessource: ressource.obtenirTypeRessource().obtenirValeur(),
    idRessource: ressource.obtenirIdentifiantRessource().obtenirValeur(),
    libelleRessource: ressource.obtenirLibelleRessource(),
    modeOffline: contexte.estOffline(),
    statutSynchronisation: offline?.obtenirStatutSynchronisation().obtenirValeur(),
    synchronise: offline?.estSynchronise() ?? false,
    replay: offline?.estReplay() ?? false,
    retry: offline?.estRetry() ?? false,
    enConflit: offline?.estConflit() ?? false,
    deviceId: contexte.obtenirDeviceId(),
    adresseIp: contexte.obtenirAdresseIp(),
    sourceAudit: contexte.obtenirSourceRuntime().obtenirValeur(),
    sourceRuntime: contexte.obtenirSourceRuntime().obtenirValeur(),
    dateAction: horodatage.obtenirDateAction(),
    dateCreationAudit: horodatage.obtenirDateCreationAudit(),
    dateSynchronisation: horodatage.obtenirDateSynchronisation(),
  };
}

export function appliquerFiltresAudit(entree: AuditEntry, filtres: AuditSearchFilters): boolean {
  const vue = construireVueAudit(entree);
  if (filtres.organisationId && vue.organisationId !== filtres.organisationId) { return false; }
  if (filtres.ecoleId && vue.ecoleId !== filtres.ecoleId) { return false; }
  if (filtres.scope && vue.scope !== filtres.scope) { return false; }
  if (filtres.acteurId && vue.acteurId !== filtres.acteurId) { return false; }
  if (filtres.typeActeur && vue.typeActeur !== filtres.typeActeur) { return false; }
  if (filtres.typeAuditPrincipal && vue.typeAuditPrincipal !== filtres.typeAuditPrincipal) { return false; }
  if (filtres.categorieAudit && !vue.categoriesAudit.includes(filtres.categorieAudit)) { return false; }
  if (filtres.actionAudit && vue.actionAudit !== filtres.actionAudit) { return false; }
  if (filtres.graviteAudit && vue.graviteAudit !== filtres.graviteAudit) { return false; }
  if (filtres.niveauAudit && vue.niveauAudit !== filtres.niveauAudit) { return false; }
  if (filtres.resultatAudit && entree.obtenirResultatAudit().obtenirValeur() !== filtres.resultatAudit) { return false; }
  if (filtres.typeRessource && vue.typeRessource !== filtres.typeRessource) { return false; }
  if (filtres.idRessource && vue.idRessource !== filtres.idRessource) { return false; }
  if (filtres.correlationId && vue.correlationId !== filtres.correlationId) { return false; }
  if (filtres.requestId && vue.requestId !== filtres.requestId) { return false; }
  if (filtres.sessionId && vue.sessionId !== filtres.sessionId) { return false; }
  if (filtres.deviceId && vue.deviceId !== filtres.deviceId) { return false; }
  if (filtres.adresseIp && vue.adresseIp !== filtres.adresseIp) { return false; }
  if (filtres.sourceAudit && vue.sourceAudit !== filtres.sourceAudit) { return false; }
  if (filtres.sourceRuntime && vue.sourceRuntime !== filtres.sourceRuntime) { return false; }
  if (typeof filtres.modeOffline === 'boolean' && vue.modeOffline !== filtres.modeOffline) { return false; }
  if (typeof filtres.synchronise === 'boolean' && vue.synchronise !== filtres.synchronise) { return false; }
  if (typeof filtres.replay === 'boolean' && vue.replay !== filtres.replay) { return false; }
  if (typeof filtres.retry === 'boolean' && vue.retry !== filtres.retry) { return false; }
  if (typeof filtres.enConflit === 'boolean' && vue.enConflit !== filtres.enConflit) { return false; }
  if (filtres.dateDebut && vue.dateAction.getTime() < filtres.dateDebut.getTime()) { return false; }
  if (filtres.dateFin && vue.dateAction.getTime() > filtres.dateFin.getTime()) { return false; }
  return true;
}

export function trierChronologiquementDesc(entrees: readonly AuditEntry[]): AuditEntry[] {
  return [...entrees].sort(
    (gauche, droite) =>
      droite.obtenirHorodatageAudit().obtenirDateAction().getTime()
      - gauche.obtenirHorodatageAudit().obtenirDateAction().getTime(),
  );
}

export function paginer<TElement>(elements: readonly TElement[], pagination?: AuditPagination): AuditSearchResult<TElement> {
  const page = pagination?.page ?? 1;
  const taillePage = pagination?.taillePage ?? (elements.length || 1);
  const offset = Math.max(0, (page - 1) * taillePage);
  const resultats = elements.slice(offset, offset + taillePage);
  return {
    resultats: [...resultats],
    total: elements.length,
    page,
    taillePage,
  };
}

export function construireTraceForensic(entree: AuditEntry, typeRelation?: string): AuditForensicTrace {
  const vue = construireVueAudit(entree);
  return {
    auditEntry: entree,
    correlationId: vue.correlationId,
    requestId: vue.requestId,
    acteurId: vue.acteurId,
    deviceId: vue.deviceId,
    adresseIp: vue.adresseIp,
    typeRelation,
  };
}

export function construireExportRecord(entree: AuditEntry, formatExport = 'JSON'): AuditExportRecord {
  const vue = construireVueAudit(entree);
  return {
    idAuditExport: randomUUID(),
    idAuditEntry: entree.obtenirId(),
    acteurId: vue.acteurId,
    formatExport,
    nombreElements: 1,
    dateGeneration: new Date(),
    organisationId: vue.organisationId,
    ecoleId: vue.ecoleId,
  };
}

export function construireArchiveRecord(entree: AuditEntry, typeArchive = 'LOGIQUE', raisonArchivage?: string): AuditArchiveRecord {
  const vue = construireVueAudit(entree);
  return {
    idArchive: randomUUID(),
    idAuditEntry: entree.obtenirId(),
    dateArchivage: new Date(),
    raisonArchivage,
    typeArchive,
    organisationId: vue.organisationId,
    ecoleId: vue.ecoleId,
  };
}

export function construireProjectionRecord(entree: AuditEntry, typeProjection: string): AuditProjectionRecord {
  const vue = construireVueAudit(entree);
  return {
    idProjection: randomUUID(),
    idAuditEntry: entree.obtenirId(),
    typeProjection,
    scope: vue.scope,
    actionAudit: vue.actionAudit,
    graviteAudit: vue.graviteAudit,
    resultatAudit: entree.obtenirResultatAudit().obtenirValeur(),
    dateAction: vue.dateAction,
    organisationId: vue.organisationId,
    ecoleId: vue.ecoleId,
    correlationId: vue.correlationId,
    acteurId: vue.acteurId,
    idRessource: vue.idRessource,
    donnees: { ...vue },
  };
}

export function construireAnalyticsSnapshot(cle: string, entrees: readonly AuditEntry[]): AuditAnalyticsSnapshot {
  const compteurs = entrees.reduce<Record<string, number>>((acc, entree) => {
    const vue = construireVueAudit(entree);
    acc.total = (acc.total ?? 0) + 1;
    acc[`gravite:${vue.graviteAudit}`] = (acc[`gravite:${vue.graviteAudit}`] ?? 0) + 1;
    acc[`action:${vue.actionAudit}`] = (acc[`action:${vue.actionAudit}`] ?? 0) + 1;
    if (vue.modeOffline) {
      acc.offline = (acc.offline ?? 0) + 1;
    }
    if (vue.enConflit) {
      acc.conflits = (acc.conflits ?? 0) + 1;
    }
    return acc;
  }, {});

  return {
    cle,
    dateReference: new Date().toISOString().slice(0, 10),
    compteurs,
    dimensions: {},
  };
}

export function construireConflitRecord(
  idAuditEntry: string,
  typeConflit: string,
  descriptionConflit?: string,
): AuditSyncConflictRecord {
  return {
    idAuditConflict: randomUUID(),
    idAuditEntry,
    typeConflit,
    descriptionConflit,
    dateDetection: new Date(),
    statutResolution: 'DETECTE',
  };
}
