import type { AuditEntry } from '../../../../domain/aggregates';
import type { AuditProjectionRecord } from '../../../../domain/repositories';
import {
  construireProjectionRecord,
  construireVueAudit,
  type AuditEntryView,
} from '../repositories/audit-repository.helpers';
import { AUDIT_PROJECTION_FAMILIES, type AuditProjectionFamily } from './AuditProjectionFamilies';

export interface AuditProjectionEnvelope<TData> {
  readonly famille: AuditProjectionFamily;
  readonly projection: AuditProjectionRecord;
  readonly donnees: TData;
}

export function construireProjectionDeBase(entree: AuditEntry, famille: AuditProjectionFamily): AuditProjectionRecord {
  return construireProjectionRecord(entree, famille);
}

export function obtenirVueProjection(entree: AuditEntry): AuditEntryView {
  return construireVueAudit(entree);
}

export function enrichirProjection<TData>(
  entree: AuditEntry,
  famille: AuditProjectionFamily,
  donnees: TData,
): AuditProjectionEnvelope<TData> {
  const projection = construireProjectionDeBase(entree, famille);
  return {
    famille,
    projection: {
      ...projection,
      donnees: donnees as Record<string, unknown>,
    },
    donnees,
  };
}

export function estProjectionSecurite(vue: AuditEntryView): boolean {
  return (
    vue.typeAuditPrincipal.includes('SECURITE')
    || vue.actionAudit.includes('LOGIN')
    || vue.actionAudit.includes('ROLE')
    || vue.actionAudit.includes('PERMISSION')
    || vue.actionAudit.includes('REFUS')
    || vue.resultatAudit === 'REFUSE'
    || vue.resultatAudit === 'ECHEC'
    || vue.graviteAudit === 'CRITIQUE'
    || vue.graviteAudit === 'ELEVEE'
  );
}

export function estProjectionExport(vue: AuditEntryView): boolean {
  return vue.actionAudit.includes('EXPORT') || vue.typeAuditPrincipal.includes('EXPORT');
}

export function estProjectionOffline(vue: AuditEntryView): boolean {
  return vue.modeOffline || !!vue.statutSynchronisation || vue.replay || vue.retry || vue.enConflit;
}

export function estProjectionSupervision(vue: AuditEntryView): boolean {
  return (
    vue.graviteAudit === 'CRITIQUE'
    || vue.graviteAudit === 'ELEVEE'
    || vue.retry
    || vue.enConflit
    || estProjectionExport(vue)
  );
}

export function estProjectionForensic(vue: AuditEntryView): boolean {
  return !!(vue.correlationId || vue.requestId || vue.sessionId || vue.deviceId || vue.replay || vue.retry || vue.enConflit);
}

export function calculerCodeSecurite(vue: AuditEntryView): string {
  if (vue.actionAudit.includes('LOGIN') && vue.resultatAudit !== 'SUCCES') { return 'LOGIN_ECHEC'; }
  if (vue.actionAudit.includes('ROLE')) { return 'ROLE_CHANGE'; }
  if (vue.actionAudit.includes('PERMISSION')) { return 'PERMISSION_SENSIBLE'; }
  if (estProjectionExport(vue)) { return 'EXPORT_SUSPECT'; }
  return 'ACTIVITE_SECURITE';
}

export function construireResumeProjection(vue: AuditEntryView): string {
  const cible = vue.idRessource ?? vue.typeAuditPrincipal;
  return `${vue.actionAudit} sur ${cible} (${vue.graviteAudit})`;
}

export function familleToujoursPresente(): readonly AuditProjectionFamily[] {
  return [
    AUDIT_PROJECTION_FAMILIES.TIMELINE,
    AUDIT_PROJECTION_FAMILIES.ANALYTICS,
    AUDIT_PROJECTION_FAMILIES.USER_ACTIVITY,
    AUDIT_PROJECTION_FAMILIES.TENANT_ACTIVITY,
    AUDIT_PROJECTION_FAMILIES.VOLUMETRIE,
  ];
}

