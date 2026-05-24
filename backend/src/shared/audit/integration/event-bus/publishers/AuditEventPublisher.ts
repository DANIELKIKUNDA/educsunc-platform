import { obtenirSharedEventBus } from '../../../../infrastructure/bus';
import { AuditEventChronologyService } from '../chronology/AuditEventChronologyService';
import { AuditEventForensicPropagator } from '../forensic/AuditEventForensicPropagator';
import { AuditEventContextMapper } from '../mappers/AuditEventContextMapper';
import type { AuditIntegrationPublishRequest } from '../IntegrationEventBusTypes';

// Ce publisher publie les evenements Audit en preservant correlation, tenant, chronology et forensic metadata.
export class AuditEventPublisher {
  private readonly bus = obtenirSharedEventBus();
  private readonly chronology = new AuditEventChronologyService();
  private readonly forensic = new AuditEventForensicPropagator();

  public async publier(request: AuditIntegrationPublishRequest) {
    const payloadChronologique = this.chronology.enrichir(request.payload, request.auditContext);
    const payloadForensic = this.forensic.enrichir(payloadChronologique, request.auditContext);
    return this.bus.publier(
      request.name,
      payloadForensic,
      AuditEventContextMapper.versMetadata(request.auditContext),
    );
  }
}

