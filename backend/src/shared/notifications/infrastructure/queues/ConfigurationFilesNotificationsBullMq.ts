import { ConfigurationBullMqShared } from 'shared/infrastructure/queues/bullmq';
import type { ConfigurationQueueBullMqShared } from 'shared/infrastructure/queues/bullmq';
import {
  NOM_FILE_NOTIFICATIONS_BULLMQ_DEAD_LETTER,
  NOM_FILE_NOTIFICATIONS_BULLMQ_DISPATCH,
  NOM_FILE_NOTIFICATIONS_BULLMQ_ESCALADE,
  NOM_FILE_NOTIFICATIONS_BULLMQ_REPLAY,
  NOM_FILE_NOTIFICATIONS_BULLMQ_RETRY,
  PREFIXE_FILES_NOTIFICATIONS_BULLMQ,
} from './ConstantesFilesNotificationsBullMq';

// Ce fichier centralise la configuration BullMQ des files techniques Notifications.

/** Cette classe normalise les options BullMQ specifiques au module Notifications. */
export class ConfigurationFilesNotificationsBullMq {
  /** Cette methode construit la configuration de la file principale. */
  public static creerDispatch(): ConfigurationQueueBullMqShared {
    return ConfigurationBullMqShared.creerQueue(NOM_FILE_NOTIFICATIONS_BULLMQ_DISPATCH, {
      prefix: PREFIXE_FILES_NOTIFICATIONS_BULLMQ,
    });
  }

  /** Cette methode construit la configuration de la file retry. */
  public static creerRetry(): ConfigurationQueueBullMqShared {
    return ConfigurationBullMqShared.creerQueue(NOM_FILE_NOTIFICATIONS_BULLMQ_RETRY, {
      prefix: PREFIXE_FILES_NOTIFICATIONS_BULLMQ,
    });
  }

  /** Cette methode construit la configuration de la file replay. */
  public static creerReplay(): ConfigurationQueueBullMqShared {
    return ConfigurationBullMqShared.creerQueue(NOM_FILE_NOTIFICATIONS_BULLMQ_REPLAY, {
      prefix: PREFIXE_FILES_NOTIFICATIONS_BULLMQ,
    });
  }

  /** Cette methode construit la configuration de la file d escalade. */
  public static creerEscalade(): ConfigurationQueueBullMqShared {
    return ConfigurationBullMqShared.creerQueue(NOM_FILE_NOTIFICATIONS_BULLMQ_ESCALADE, {
      prefix: PREFIXE_FILES_NOTIFICATIONS_BULLMQ,
    });
  }

  /** Cette methode construit la configuration de la dead-letter queue. */
  public static creerDeadLetter(): ConfigurationQueueBullMqShared {
    return ConfigurationBullMqShared.creerQueue(NOM_FILE_NOTIFICATIONS_BULLMQ_DEAD_LETTER, {
      prefix: PREFIXE_FILES_NOTIFICATIONS_BULLMQ,
      removeOnFail: false,
    });
  }
}
