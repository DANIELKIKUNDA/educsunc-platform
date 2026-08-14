import type {
  AuditApiMeta,
  AuditEventDto,
  AuditEventViewModel,
  AuditHttpEnvelope,
  AuditMetadataField,
  AuditSuccessBody,
} from '../models/platform-audit.model';

const humanLabels: Readonly<Record<string, string>> = {
  SUCCESS: 'Réussi',
  FAILED: 'Échoué',
  RETRIED: 'Relancé',
  REPLAYED: 'Rejoué',
  IGNORED_DUPLICATE: 'Doublon ignoré',
  CONFLICT: 'Conflit',
  CANCELLED: 'Annulé',
  FAIBLE: 'Faible',
  MOYENNE: 'Moyenne',
  ELEVEE: 'Élevée',
  CRITIQUE: 'Critique',
  PLATEFORME: 'Plateforme',
  ORGANISATION: 'Organisation',
  ECOLE: 'École',
  SECURITE: 'Sécurité',
  ADMINISTRATIF: 'Administration',
  FINANCIER: 'Finances',
  PEDAGOGIQUE: 'Pédagogie',
  CONFORMITE: 'Conformité',
  SYSTEME: 'Système',
  EXPORT: 'Export',
  SYNCHRONISATION: 'Synchronisation',
};

function humanize(value: string): string {
  const normalized = value.trim();
  if (!normalized) return 'Non renseigné';
  const generic = normalized
    .toLocaleLowerCase('fr-FR')
    .replaceAll('_', ' ')
    .replace(/\bcree\b/gu, 'créé')
    .replace(/\bcreee\b/gu, 'créée')
    .replace(/\bmodifie\b/gu, 'modifié')
    .replace(/\bmodifiee\b/gu, 'modifiée')
    .replace(/\brevoquee\b/gu, 'révoquée')
    .replace(/\breussi\b/gu, 'réussi')
    .replace(/^./u, (character) => character.toLocaleUpperCase('fr-FR'));
  return humanLabels[normalized] ?? generic;
}

function displayDate(value: string): { dateLabel: string; timeLabel: string } {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return { dateLabel: 'Date indisponible', timeLabel: '' };
  }
  return {
    dateLabel: new Intl.DateTimeFormat('fr-CD', { dateStyle: 'medium' }).format(date),
    timeLabel: new Intl.DateTimeFormat('fr-CD', { timeStyle: 'medium' }).format(date),
  };
}

function displayScalar(value: unknown): string | null {
  if (typeof value === 'string') return value.trim() || null;
  if (typeof value === 'number') return new Intl.NumberFormat('fr-CD').format(value);
  if (typeof value === 'boolean') return value ? 'Oui' : 'Non';
  if (value === null) return 'Aucune valeur';
  return null;
}

function flattenMetadata(
  source: Readonly<Record<string, unknown>>,
  prefix = '',
): AuditMetadataField[] {
  const fields: AuditMetadataField[] = [];
  for (const [key, value] of Object.entries(source)) {
    const sensitiveKey = key.toLocaleLowerCase('fr-FR');
    if (['token', 'password', 'secret', 'apikey', 'api_key'].some((marker) => sensitiveKey.includes(marker))) {
      continue;
    }
    const path = prefix ? `${prefix}.${key}` : key;
    const scalar = displayScalar(value);
    if (scalar !== null) {
      fields.push({ key: path, label: humanize(key), value: scalar });
      continue;
    }
    if (Array.isArray(value)) {
      const values = value.map(displayScalar).filter((entry): entry is string => entry !== null);
      fields.push({ key: path, label: humanize(key), value: values.join(', ') || 'Liste structurée' });
      continue;
    }
    if (typeof value === 'object' && value !== null) {
      fields.push(...flattenMetadata(value as Readonly<Record<string, unknown>>, path));
    }
  }
  return fields;
}

export function mapAuditEvent(dto: AuditEventDto): AuditEventViewModel {
  const dateIso = dto.dateAction || dto.createdAt;
  const date = displayDate(dateIso);
  const actorId = dto.acteur.idUtilisateur ?? '';
  const resourceId = dto.ressource?.idRessource ?? '';
  const resourceType = dto.ressource?.typeRessource ?? '';
  const source = dto.contexte.sourceAudit;
  return {
    id: dto.idAuditEntry,
    dateIso,
    ...date,
    action: dto.action,
    actionLabel: humanize(dto.action),
    type: dto.typeAuditPrincipal || dto.typePrincipal,
    typeLabel: humanize(dto.typeAuditPrincipal || dto.typePrincipal),
    categories: dto.categories,
    categoryLabels: dto.categories.map(humanize),
    severity: dto.gravite,
    severityLabel: humanize(dto.gravite),
    result: dto.resultat,
    resultLabel: humanize(dto.resultat),
    actorId,
    actorLabel: dto.acteur.typeActeur ? humanize(dto.acteur.typeActeur) : actorId || 'Acteur non renseigné',
    actorRole: dto.acteur.roleActif ? humanize(dto.acteur.roleActif) : 'Rôle non renseigné',
    resourceId,
    resourceType,
    resourceLabel: dto.ressource?.libelle?.trim() || (resourceType ? humanize(resourceType) : 'Ressource non renseignée'),
    scope: dto.tenant.scope ?? 'PLATEFORME',
    scopeLabel: humanize(dto.tenant.scope ?? 'PLATEFORME'),
    organizationId: dto.tenant.organisationId ?? dto.organisationId ?? '',
    schoolId: dto.tenant.ecoleId ?? dto.ecoleId ?? '',
    requestId: dto.contexte.requestId ?? '',
    correlationId: dto.contexte.correlationId ?? dto.correlationId ?? '',
    sessionId: dto.contexte.sessionId ?? '',
    source,
    sourceLabel: humanize(source),
    offline: dto.contexte.modeOffline,
    metadata: flattenMetadata(dto.metadata ?? {}),
  };
}

export function unwrapAuditEnvelope<T>(payload: AuditHttpEnvelope<T>): { data: T; meta?: AuditApiMeta } {
  const body = payload.donnee;
  const data = typeof body === 'object'
    && body !== null
    && 'success' in body
    && body.success === true
    && 'data' in body
    ? (body as AuditSuccessBody<T>).data
    : body as T;
  return { data, meta: payload.meta };
}

export function mapAuditError(error: unknown): string {
  if (!(error instanceof Error)) return 'Une erreur inattendue empêche cette lecture.';
  const normalized = error.message.toLocaleLowerCase('fr-FR');
  if (normalized.includes('connexion') || normalized.includes('network')) {
    return 'La connexion au service d’audit est momentanément indisponible. Réessayez sans perdre vos filtres.';
  }
  if (normalized.includes('autorisé') || normalized.includes('permission') || normalized.includes('interdit')) {
    return 'Vous ne disposez pas des droits nécessaires pour cette action.';
  }
  if (normalized.includes('introuvable') || normalized.includes("n'existe pas")) {
    return 'Cet élément n’existe pas ou n’est plus accessible dans votre périmètre.';
  }
  if (normalized.includes('interrompue') || normalized.includes('cancel')) {
    return 'La demande a été interrompue. Vous pouvez la relancer.';
  }
  return 'La demande ne peut pas être terminée pour le moment. Vérifiez les informations saisies puis réessayez.';
}
