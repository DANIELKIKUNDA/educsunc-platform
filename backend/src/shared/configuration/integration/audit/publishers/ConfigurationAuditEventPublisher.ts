import { obtenirSharedEventBus } from 'shared/infrastructure/bus';
import type { ConfigurationAuditPublishRequest } from '../ConfigurationAuditIntegrationTypes';
import { ConfigurationAuditContextMapper } from '../mappers/ConfigurationAuditContextMapper';
import { obtenirConfigurationAuditMemoryStore } from '../store/ConfigurationAuditMemoryStore';

export class ConfigurationAuditEventPublisher {
  private readonly bus = obtenirSharedEventBus();

  public async publier(request: ConfigurationAuditPublishRequest) {
    obtenirConfigurationAuditMemoryStore().records.push({
      name: request.name,
      configurationId: request.configurationContext.configurationId,
      scopeLevel: request.configurationContext.scopeLevel,
      organisationId: request.configurationContext.organisationId,
      ecoleId: request.configurationContext.ecoleId,
      correlationId: request.configurationContext.correlationId,
      requestId: request.configurationContext.requestId,
      actorId: request.configurationContext.actorId,
      previousVersion: request.configurationContext.previousVersion,
      nextVersion: request.configurationContext.nextVersion,
      rollbackVersion: request.configurationContext.rollbackVersion,
      replayId: request.configurationContext.replayId,
      retryCount: request.configurationContext.retryCount ?? 0,
      changedAt: request.configurationContext.changedAt,
    });

    return this.bus.publier(
      request.name,
      {
        configurationId: request.configurationContext.configurationId,
        scopeLevel: request.configurationContext.scopeLevel,
        previousVersion: request.configurationContext.previousVersion,
        nextVersion: request.configurationContext.nextVersion,
        rollbackVersion: request.configurationContext.rollbackVersion,
        ...request.payload,
      },
      ConfigurationAuditContextMapper.versMetadata(request.configurationContext),
    );
  }
}
