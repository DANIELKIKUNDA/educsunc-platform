export type AuditActorCode =
  | 'MANAGER_SYSTEME'
  | 'OPERATEUR_SYSTEME'
  | 'SUPPORT_SYSTEME'
  | 'PROMOTEUR_ORGANISATION'
  | 'GESTIONNAIRE_ORGANISATION'
  | 'ADMINISTRATEUR_ECOLE'
  | 'CAISSIER'
  | 'COMPTABLE'
  | 'ADMIN_SYSTEME_ECOLE'
  | 'ENSEIGNANT'
  | 'PREFET_ETUDES'
  | 'DIRECTEUR_ETUDES'
  | 'DIRECTEUR_DISCIPLINE'
  | 'DIRECTEUR_PRIMAIRE'
  | 'DIRECTEUR_MATERNELLE';

export interface AuditApiContext {
  organisationId: string | null;
  ecoleId: string | null;
  utilisateurId: string | null;
}

export interface AuditMetaEnvelope {
  requestId?: string;
  correlationId?: string;
  organisationId?: string;
  ecoleId?: string;
  durationMs?: number;
}

export interface AuditEntryViewModel {
  id: string;
  action: string;
  category: string;
  severity: string;
  result: string;
  actor: string;
  resource: string;
  timestamp: string;
  comment: string;
  correlationId: string;
  raw: Record<string, unknown>;
}

export interface AuditTimelineViewModel {
  correlationId: string;
  actor: string;
  resource: string;
  entries: AuditEntryViewModel[];
}

export interface AuditSummaryCard {
  label: string;
  value: string;
  helper: string;
}

export interface AuditMetricViewModel {
  label: string;
  value: string;
  helper: string;
}

export interface AuditRecordTableRow {
  id: string;
  columns: Record<string, string>;
  raw: Record<string, unknown>;
}

export interface AuditListFilters {
  page?: number;
  taillePage?: number;
  action?: string;
  typeAuditPrincipal?: string;
  categorieAudit?: string;
  gravite?: string;
  resultat?: string;
  acteurId?: string;
  ressourceId?: string;
  correlationId?: string;
}

export interface AuditAnalyticsFilters {
  periode?: string;
  ecoleId?: string;
  typeAuditPrincipal?: string;
}

export interface AuditMonitoringFilters {
  periode?: string;
  metrique?: string;
  correlationId?: string;
}

export interface AuditPedagogicalFilters {
  idFicheCotationEleveCours?: string;
  idResultatBulletinEleve?: string;
  idBulletinEleve?: string;
  idClassePedagogique?: string;
  idAnneeScolaire?: string;
  codeColonne?: string;
}

export const authorizedPlatformAuditActors: AuditActorCode[] = [
  'MANAGER_SYSTEME',
  'OPERATEUR_SYSTEME',
  'SUPPORT_SYSTEME',
];

export const authorizedOrganizationAuditActors: AuditActorCode[] = [
  'PROMOTEUR_ORGANISATION',
  'GESTIONNAIRE_ORGANISATION',
];

export const authorizedSchoolFinancialAuditActors: AuditActorCode[] = [
  'ADMINISTRATEUR_ECOLE',
  'CAISSIER',
  'COMPTABLE',
];

export const authorizedSchoolTechnicalAuditActors: AuditActorCode[] = [
  'ADMIN_SYSTEME_ECOLE',
];

export const authorizedPedagogicalAuditActors: AuditActorCode[] = [
  'ENSEIGNANT',
  'PREFET_ETUDES',
  'DIRECTEUR_ETUDES',
  'DIRECTEUR_DISCIPLINE',
  'DIRECTEUR_PRIMAIRE',
  'DIRECTEUR_MATERNELLE',
  'ADMINISTRATEUR_ECOLE',
  'PROMOTEUR_ORGANISATION',
];

interface AuditHttpSuccessBody<TData> {
  success?: boolean;
  data?: TData;
}

interface AuditHttpEnvelope<TData> {
  donnee?: TData | AuditHttpSuccessBody<TData>;
  meta?: AuditMetaEnvelope;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function readRecord(value: unknown, fallback: Record<string, unknown> = {}): Record<string, unknown> {
  return isRecord(value) ? value : fallback;
}

function readString(value: unknown, fallback = '-'): string {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : fallback;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  return fallback;
}

function readMaybeString(value: unknown): string | null {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  return null;
}

function readArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function readNestedString(source: Record<string, unknown>, path: string[]): string | null {
  let current: unknown = source;

  for (const segment of path) {
    if (!isRecord(current)) {
      return null;
    }

    current = current[segment];
  }

  return readMaybeString(current);
}

export function unwrapAuditData<TData>(payload: unknown): { data: TData; meta?: AuditMetaEnvelope } {
  const envelope = readRecord(payload) as AuditHttpEnvelope<TData>;
  const outer = envelope.donnee;

  if (isRecord(outer) && 'data' in outer) {
    return {
      data: (outer as AuditHttpSuccessBody<TData>).data as TData,
      meta: envelope.meta,
    };
  }

  return {
    data: outer as TData,
    meta: envelope.meta,
  };
}

export function normalizeAuditEntries(source: unknown): AuditEntryViewModel[] {
  return readArray(source).map((item, index) => {
    const row = readRecord(item);
    const actorRecord = readRecord(row.acteur);
    const resourceRecord = readRecord(row.ressource);

    return {
      id:
        readMaybeString(row.id)
        ?? readMaybeString(row.idAudit)
        ?? readMaybeString(row.idRessource)
        ?? `audit-${index + 1}`,
      action:
        readMaybeString(row.action)
        ?? readMaybeString(row.actionAudit)
        ?? readMaybeString(row.typeEvenement)
        ?? 'ACTION_AUDIT',
      category:
        readMaybeString(row.categorieAudit)
        ?? readMaybeString(row.typeAuditPrincipal)
        ?? readMaybeString(row.categorie)
        ?? 'NON_CATEGORISE',
      severity:
        readMaybeString(row.gravite)
        ?? readMaybeString(row.severite)
        ?? 'STANDARD',
      result:
        readMaybeString(row.resultat)
        ?? readMaybeString(row.statut)
        ?? 'TRACE',
      actor:
        readNestedString(actorRecord, ['nom'])
        ?? readNestedString(actorRecord, ['displayName'])
        ?? readMaybeString(actorRecord.idActeur)
        ?? readMaybeString(row.idUtilisateur)
        ?? readMaybeString(row.acteurId)
        ?? '-',
      resource:
        readNestedString(resourceRecord, ['identifiantRessource'])
        ?? readNestedString(resourceRecord, ['id'])
        ?? readMaybeString(row.ressourceId)
        ?? readMaybeString(row.idRessource)
        ?? '-',
      timestamp:
        readMaybeString(row.dateAction)
        ?? readMaybeString(row.creeLe)
        ?? readMaybeString(row.timestamp)
        ?? readMaybeString(row.dateHeure)
        ?? '-',
      comment:
        readMaybeString(row.commentaire)
        ?? readMaybeString(row.message)
        ?? readMaybeString(row.description)
        ?? '-',
      correlationId:
        readMaybeString(row.correlationId)
        ?? readNestedString(readRecord(row.contexteTechnique), ['correlationId'])
        ?? '-',
      raw: row,
    };
  });
}

export function normalizeAuditTimeline(source: unknown): AuditTimelineViewModel {
  const payload = readRecord(source);

  return {
    correlationId: readString(payload.correlationId, '-'),
    actor: readString(payload.acteur, '-'),
    resource: readString(payload.ressource, '-'),
    entries: normalizeAuditEntries(payload.timeline),
  };
}

export function normalizeSummaryCards(
  counters: Record<string, unknown> | undefined,
): AuditSummaryCard[] {
  if (!counters) {
    return [];
  }

  return Object.entries(counters).map(([label, value]) => ({
    label,
    value: readString(value, '0'),
    helper: 'Compteur backend',
  }));
}

export function normalizeMetricRows(source: unknown): AuditMetricViewModel[] {
  return readArray(source).map((item, index) => {
    const row = readRecord(item);
    const keys = Object.keys(row);
    const primaryKey = keys[0] ?? `metric-${index + 1}`;
    const secondaryKey = keys[1];

    return {
      label: readString(row.nom ?? row.label ?? row.metrique ?? primaryKey, primaryKey),
      value: readString(row.valeur ?? row.value ?? row.total ?? row[secondaryKey ?? primaryKey], '-'),
      helper: readString(row.unite ?? row.status ?? row.etat ?? row.description, 'Mesure backend'),
    };
  });
}

export function normalizeTableRows(source: unknown): AuditRecordTableRow[] {
  return readArray(source).map((item, index) => {
    const row = readRecord(item);
    const columns: Record<string, string> = {};

    Object.entries(row).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        columns[key] = value.map((entry) => readString(entry)).join(', ');
        return;
      }

      if (isRecord(value)) {
        columns[key] = Object.entries(value)
          .map(([childKey, childValue]) => `${childKey}: ${readString(childValue)}`)
          .join(' | ');
        return;
      }

      columns[key] = readString(value);
    });

    return {
      id: readMaybeString(row.id) ?? readMaybeString(row.code) ?? `row-${index + 1}`,
      columns,
      raw: row,
    };
  });
}

export function serializeAuditTableRows(rows: AuditRecordTableRow[]): string {
  if (rows.length === 0) {
    return '';
  }

  const headers = Object.keys(rows[0].columns);
  return [headers, ...rows.map((row) => headers.map((header) => row.columns[header] ?? ''))]
    .map((line) => line.map((value) => `"${value.replace(/"/g, '""')}"`).join(';'))
    .join('\n');
}
