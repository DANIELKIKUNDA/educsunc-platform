import type {
  AuditConfigurationScope,
  AuditInfrastructureConfiguration,
} from '../ConfigurationTypes';

export class AuditConfigurationValidationService {
  public validerScope(scope: AuditConfigurationScope): void {
    if (scope.niveau === 'ECOLE' && !scope.organisationId) {
      throw new Error('Une configuration ECOLE doit préciser organisationId.');
    }
    if (scope.niveau === 'ECOLE' && !scope.ecoleId) {
      throw new Error('Une configuration ECOLE doit préciser ecoleId.');
    }
    if (scope.niveau === 'ORGANISATION' && !scope.organisationId) {
      throw new Error('Une configuration ORGANISATION doit préciser organisationId.');
    }
  }

  public validerConfiguration(configuration: AuditInfrastructureConfiguration): void {
    this.validerBornes(configuration.runtime.batchSize, 1, 10_000, 'runtime.batchSize');
    this.validerBornes(configuration.runtime.retryLimit, 0, 100, 'runtime.retryLimit');
    this.validerBornes(configuration.runtime.replayLimit, 0, 100, 'runtime.replayLimit');
    this.validerBornes(configuration.runtime.queueSize, 1, 1_000_000, 'runtime.queueSize');
    this.validerBornes(configuration.runtime.exportExpirationHours, 1, 24 * 365, 'runtime.exportExpirationHours');
    this.validerBornes(configuration.retention.archivageApresJours, 1, 3650, 'retention.archivageApresJours');
    this.validerBornes(configuration.retention.coldStorageApresJours, 1, 3650, 'retention.coldStorageApresJours');
    this.validerBornes(configuration.retention.purgeDiffereeJours, 0, 3650, 'retention.purgeDiffereeJours');
    this.validerBornes(configuration.replay.replayBatch, 1, 10_000, 'replay.replayBatch');
    this.validerBornes(configuration.replay.replayWindowHours, 1, 24 * 365, 'replay.replayWindowHours');
    this.validerBornes(configuration.replay.replayDepth, 1, 100_000, 'replay.replayDepth');
    this.validerBornes(configuration.retry.retryLimit, 0, 100, 'retry.retryLimit');
    this.validerBornes(configuration.retry.retryBackoffMs, 0, 3_600_000, 'retry.retryBackoffMs');
    this.validerBornes(configuration.synchronization.syncIntervalSeconds, 1, 86_400, 'synchronization.syncIntervalSeconds');
    this.validerBornes(configuration.monitoring.alertLimit, 1, 100_000, 'monitoring.alertLimit');
    this.validerBornes(configuration.workers.concurrency, 1, 1_000, 'workers.concurrency');
    this.validerBornes(configuration.queues.limiteParQueue, 1, configuration.queues.limiteGlobale, 'queues.limiteParQueue');
    this.validerBornes(configuration.caching.ttlSeconds, 1, 86_400, 'caching.ttlSeconds');
    this.validerBornes(configuration.caching.maxEntries, 1, 1_000_000, 'caching.maxEntries');
    this.validerBornes(configuration.recovery.maxSnapshots, 1, 10_000, 'recovery.maxSnapshots');

    if (configuration.retry.retryLimit === 0 && configuration.retry.deadLetterAfter === 0) {
      throw new Error('retry.deadLetterAfter ne peut pas être nul quand retry.retryLimit vaut zéro.');
    }
    if (configuration.retention.coldStorageApresJours < configuration.retention.archivageApresJours) {
      throw new Error('retention.coldStorageApresJours doit être supérieur ou égal à archivageApresJours.');
    }
    if (configuration.retention.purgeDiffereeJours < configuration.retention.coldStorageApresJours) {
      throw new Error('retention.purgeDiffereeJours doit être supérieur ou égal à coldStorageApresJours.');
    }
    if (configuration.workers.retryLimit > configuration.retry.retryLimit) {
      throw new Error('workers.retryLimit ne peut pas dépasser retry.retryLimit.');
    }
    if (configuration.monitoring.healthRules.length === 0) {
      throw new Error('monitoring.healthRules doit contenir au moins une règle.');
    }
    if (configuration.exports.formatsAutorises.length === 0) {
      throw new Error('exports.formatsAutorises doit contenir au moins un format.');
    }
  }

  private validerBornes(valeur: number, min: number, max: number, champ: string): void {
    if (!Number.isFinite(valeur) || valeur < min || valeur > max) {
      throw new Error(`${champ} doit être compris entre ${min} et ${max}.`);
    }
  }
}
