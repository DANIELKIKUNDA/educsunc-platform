import {
  ATTEMPTS_BULLMQ_SHARED_PAR_DEFAUT,
  BACKOFF_BULLMQ_SHARED_PAR_DEFAUT_MS,
  CONCURRENCE_BULLMQ_SHARED_PAR_DEFAUT,
  PREFIXE_BULLMQ_SHARED_PAR_DEFAUT,
} from './ConstantesBullMqShared';
import type {
  ConfigurationQueueBullMqShared,
  ConfigurationWorkerBullMqShared,
} from './TypesBullMqShared';

// Ce fichier normalise la configuration commune du socle BullMQ partage.

/** Cette classe centralise la resolution des options BullMQ partagees. */
export class ConfigurationBullMqShared {
  /** Cette methode cree une configuration de queue partagee stable. */
  public static creerQueue(
    nom: string,
    surcharges: Partial<ConfigurationQueueBullMqShared> = {},
  ): ConfigurationQueueBullMqShared {
    return {
      nom,
      prefix: surcharges.prefix ?? PREFIXE_BULLMQ_SHARED_PAR_DEFAUT,
      attempts: surcharges.attempts ?? ATTEMPTS_BULLMQ_SHARED_PAR_DEFAUT,
      backoffMs: surcharges.backoffMs ?? BACKOFF_BULLMQ_SHARED_PAR_DEFAUT_MS,
      removeOnComplete: surcharges.removeOnComplete ?? true,
      removeOnFail: surcharges.removeOnFail ?? false,
    };
  }

  /** Cette methode cree une configuration de worker partagee stable. */
  public static creerWorker(
    nomQueue: string,
    surcharges: Partial<ConfigurationWorkerBullMqShared> = {},
  ): ConfigurationWorkerBullMqShared {
    return {
      nomQueue,
      concurrence: surcharges.concurrence ?? CONCURRENCE_BULLMQ_SHARED_PAR_DEFAUT,
      autoriserTraitementLocal: surcharges.autoriserTraitementLocal ?? true,
    };
  }
}
