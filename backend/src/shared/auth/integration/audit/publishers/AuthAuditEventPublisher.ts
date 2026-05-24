import { obtenirSharedEventBus } from '../../../../infrastructure/bus';
import { AuthAuditEventMapper } from '../mappers/AuthAuditEventMapper';
import type {
  AuthAuditConnectionEvent,
  AuthAuditFailureEvent,
  AuthAuditSecurityAction,
} from '../AuthAuditIntegrationTypes';

export class AuthAuditEventPublisher {
  private readonly bus = obtenirSharedEventBus();

  public async publierConnexion(event: AuthAuditConnectionEvent): Promise<void> {
    const mapped = AuthAuditEventMapper.depuisConnexion(event);
    await this.bus.publier(mapped.eventName, mapped.payload, mapped.metadata);
  }

  public async publierEchec(event: AuthAuditFailureEvent): Promise<void> {
    const mapped = AuthAuditEventMapper.depuisEchec(event);
    await this.bus.publier(mapped.eventName, mapped.payload, mapped.metadata);
  }

  public async publierAction(action: AuthAuditSecurityAction): Promise<void> {
    const mapped = AuthAuditEventMapper.depuisAction(action);
    await this.bus.publier(mapped.eventName, mapped.payload, mapped.metadata);
  }
}
