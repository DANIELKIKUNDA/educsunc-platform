import { obtenirSharedEventBus } from '../../../../infrastructure/bus';
import { SecurityAuditEventMapper } from '../mappers/SecurityAuditEventMapper';
import type { SecurityAuditEvent } from '../SecurityAuditIntegrationTypes';

export class SecurityAuditEventPublisher {
  private readonly bus = obtenirSharedEventBus();

  public async publier(event: SecurityAuditEvent): Promise<void> {
    const mapped = SecurityAuditEventMapper.mapper(event);
    await this.bus.publier(mapped.eventName, mapped.payload, mapped.metadata);
  }
}
