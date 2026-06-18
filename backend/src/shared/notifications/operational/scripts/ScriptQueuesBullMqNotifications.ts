import { SnapshotQueueBullMqShared } from 'shared/infrastructure/queues/bullmq';
import {
  FileDeadLetterNotificationsBullMq,
  FileEscaladeNotificationsBullMq,
  FileNotificationsBullMq,
  FileReplayNotificationsBullMq,
  FileRetryNotificationsBullMq,
} from '../../infrastructure/queues';

// Ce fichier expose les operations locales d observation des queues BullMQ du module Notifications.

/** Cette classe retourne des snapshots lisibles des files BullMQ du module Notifications. */
export class ScriptQueuesBullMqNotifications {
  /** Ce constructeur relie le script aux adapters BullMQ des files du module. */
  constructor(
    private readonly fileNotificationsBullMq: FileNotificationsBullMq,
    private readonly fileRetryNotificationsBullMq: FileRetryNotificationsBullMq,
    private readonly fileReplayNotificationsBullMq: FileReplayNotificationsBullMq,
    private readonly fileEscaladeNotificationsBullMq: FileEscaladeNotificationsBullMq,
    private readonly fileDeadLetterNotificationsBullMq: FileDeadLetterNotificationsBullMq,
  ) {}

  /** Cette methode retourne l etat courant de toutes les queues BullMQ du module. */
  public observerToutes(): {
    readonly dispatch: SnapshotQueueBullMqShared;
    readonly retry: SnapshotQueueBullMqShared;
    readonly replay: SnapshotQueueBullMqShared;
    readonly escalade: SnapshotQueueBullMqShared;
    readonly deadLetter: SnapshotQueueBullMqShared;
  } {
    return {
      dispatch: this.fileNotificationsBullMq.observerQueue(),
      retry: this.fileRetryNotificationsBullMq.observerQueue(),
      replay: this.fileReplayNotificationsBullMq.observerQueue(),
      escalade: this.fileEscaladeNotificationsBullMq.observerQueue(),
      deadLetter: this.fileDeadLetterNotificationsBullMq.observerQueue(),
    };
  }
}
