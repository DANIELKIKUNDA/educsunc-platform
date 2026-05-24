import type { AuditEventEnvelope } from '../../event-bus';
import type { AuditIdempotencyKeyParts } from '../IdempotencyTypes';

function normaliser(value: string | undefined): string {
  return value?.trim() || 'NA';
}

// Les cles sont deterministes, tenant-aware et reutilisables pour event, sync, export et workers.
export class AuditIdempotencyKeyBuilder {
  public construire(parts: AuditIdempotencyKeyParts): string {
    return [
      'AUDIT',
      normaliser(parts.organisationId),
      normaliser(parts.ecoleId),
      normaliser(parts.scope),
      normaliser(parts.sourceTraitement),
      normaliser(parts.eventId),
      normaliser(parts.replayId),
      normaliser(parts.syncId),
      normaliser(parts.exportId),
      normaliser(parts.requestId),
      normaliser(parts.operationId),
    ].join('|');
  }

  public depuisEvenement(envelope: AuditEventEnvelope, sourceTraitement: string): string {
    return this.construire({
      eventId: envelope.metadata.eventId,
      replayId: envelope.metadata.replayId,
      syncId: envelope.metadata.syncId,
      requestId: envelope.metadata.requestId,
      organisationId: envelope.metadata.organisationId,
      ecoleId: envelope.metadata.ecoleId,
      scope: envelope.metadata.scope,
      sourceTraitement,
    });
  }

  public depuisProjection(args: {
    idProjection: string;
    idAuditEntry: string;
    organisationId?: string;
    ecoleId?: string;
    scope?: string;
  }): string {
    return this.construire({
      eventId: args.idAuditEntry,
      operationId: args.idProjection,
      organisationId: args.organisationId,
      ecoleId: args.ecoleId,
      scope: args.scope,
      sourceTraitement: 'PROJECTION_AUDIT',
    });
  }

  public depuisExport(args: {
    exportId: string;
    requestId?: string;
    organisationId?: string;
    ecoleId?: string;
    scope?: string;
  }): string {
    return this.construire({
      exportId: args.exportId,
      requestId: args.requestId,
      organisationId: args.organisationId,
      ecoleId: args.ecoleId,
      scope: args.scope,
      sourceTraitement: 'EXPORT_AUDIT',
    });
  }

  public depuisSynchronisation(args: {
    syncId: string;
    replayId?: string;
    requestId?: string;
    organisationId?: string;
    ecoleId?: string;
    scope?: string;
  }): string {
    return this.construire({
      syncId: args.syncId,
      replayId: args.replayId,
      requestId: args.requestId,
      organisationId: args.organisationId,
      ecoleId: args.ecoleId,
      scope: args.scope,
      sourceTraitement: 'SYNC_AUDIT',
    });
  }
}
