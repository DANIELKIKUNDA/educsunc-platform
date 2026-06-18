import { AdaptateurMonitoringNotification } from '../../infrastructure/monitoring';
import {
  PlanificateurArchivageNotifications,
  PlanificateurExpirationNotifications,
  PlanificateurNotifications,
} from '../../infrastructure/scheduler';
import {
  RegulateurRateLimitingNotificationBullMq,
  RegulateurThrottlingNotificationRedis,
} from '../../infrastructure/throttling';
import {
  RecuperationDeadLetterNotifications,
  RecuperationProvidersNotifications,
  RecuperationQueuesNotifications,
  RecuperationStockageNotifications,
  RecuperationTenantNotifications,
} from '../../infrastructure/recovery';
import {
  WorkerArchivageNotificationBullMq,
  WorkerCleanupNotificationBullMq,
  WorkerDiffusionNotificationBullMq,
  WorkerEscaladeNotificationBullMq,
  WorkerMonitoringNotificationBullMq,
  WorkerRecoveryNotificationBullMq,
  WorkerReplayNotificationBullMq,
  WorkerRetryNotificationBullMq,
} from '../../infrastructure/workers';
import {
  WorkerArchivageNotificationsBullMq,
  WorkerCleanupNotificationsBullMq,
  WorkerDiffusionNotificationsBullMq,
  WorkerEscaladeNotificationsBullMq,
  WorkerMonitoringNotificationsBullMq,
  WorkerRecoveryNotificationsBullMq,
  WorkerReplayNotificationsBullMq,
  WorkerRetryNotificationsBullMq,
} from '../../workers';
import { CoordinateurFilesNotifications } from '../coordinators/CoordinateurFilesNotifications';
import { CoordinateurRuntimeNotifications } from '../coordinators/CoordinateurRuntimeNotifications';
import { CoordinateurWorkersNotifications } from '../coordinators/CoordinateurWorkersNotifications';
import { DiagnosticRuntimeNotifications } from '../health/DiagnosticRuntimeNotifications';
import { SanteRuntimeNotifications } from '../health/SanteRuntimeNotifications';
import { RuntimeMonitoringNotifications } from '../monitoring/RuntimeMonitoringNotifications';
import { RuntimeSupervisionNotifications } from '../monitoring/RuntimeSupervisionNotifications';
import { RuntimeRecoveryDeadLetters } from '../recovery/RuntimeRecoveryDeadLetters';
import { RuntimeRecoveryNotifications } from '../recovery/RuntimeRecoveryNotifications';
import { RuntimeRecoveryProviders } from '../recovery/RuntimeRecoveryProviders';
import { RegistreRuntimeNotifications } from '../registry/RegistreRuntimeNotifications';
import { RuntimeArchivageNotifications } from '../scheduler/RuntimeArchivageNotifications';
import { RuntimeExpirationNotifications } from '../scheduler/RuntimeExpirationNotifications';
import { RuntimePlanificationNotifications } from '../scheduler/RuntimePlanificationNotifications';
import { RuntimeRateLimitingNotificationsBullMq } from '../throttling/RuntimeRateLimitingNotificationsBullMq';
import { RuntimeThrottlingNotifications } from '../throttling/RuntimeThrottlingNotifications';

// Ce fichier declare la fabrique de cablage du runtime BullMQ des Notifications.

/** Cette interface represente les dependances techniques necessaires a la creation du runtime BullMQ. */
export interface DependancesFabriqueRuntimeNotificationsBullMq {
  readonly adaptateurMonitoringNotification: AdaptateurMonitoringNotification;
  readonly planificateurNotifications: PlanificateurNotifications;
  readonly planificateurExpirationNotifications: PlanificateurExpirationNotifications;
  readonly planificateurArchivageNotifications: PlanificateurArchivageNotifications;
  readonly regulateurThrottlingNotificationRedis: RegulateurThrottlingNotificationRedis;
  readonly regulateurRateLimitingNotificationBullMq: RegulateurRateLimitingNotificationBullMq;
  readonly recuperationQueuesNotifications: RecuperationQueuesNotifications;
  readonly recuperationStockageNotifications: RecuperationStockageNotifications;
  readonly recuperationProvidersNotifications: RecuperationProvidersNotifications;
  readonly recuperationTenantNotifications: RecuperationTenantNotifications;
  readonly recuperationDeadLetterNotifications: RecuperationDeadLetterNotifications;
  readonly workerDiffusionNotificationBullMq: WorkerDiffusionNotificationBullMq;
  readonly workerRetryNotificationBullMq: WorkerRetryNotificationBullMq;
  readonly workerReplayNotificationBullMq: WorkerReplayNotificationBullMq;
  readonly workerEscaladeNotificationBullMq: WorkerEscaladeNotificationBullMq;
  readonly workerMonitoringNotificationBullMq: WorkerMonitoringNotificationBullMq;
  readonly workerArchivageNotificationBullMq: WorkerArchivageNotificationBullMq;
  readonly workerCleanupNotificationBullMq: WorkerCleanupNotificationBullMq;
  readonly workerRecoveryNotificationBullMq: WorkerRecoveryNotificationBullMq;
}

/** Cette interface represente le runtime BullMQ cable pret a etre demarre. */
export interface ComposantsRuntimeNotificationsBullMq {
  readonly registreRuntimeNotifications: RegistreRuntimeNotifications;
  readonly coordinateurFilesNotifications: CoordinateurFilesNotifications;
  readonly coordinateurWorkersNotifications: CoordinateurWorkersNotifications;
  readonly coordinateurRuntimeNotifications: CoordinateurRuntimeNotifications;
  readonly runtimeMonitoringNotifications: RuntimeMonitoringNotifications;
  readonly runtimeSupervisionNotifications: RuntimeSupervisionNotifications;
  readonly runtimePlanificationNotifications: RuntimePlanificationNotifications;
  readonly runtimeExpirationNotifications: RuntimeExpirationNotifications;
  readonly runtimeArchivageNotifications: RuntimeArchivageNotifications;
  readonly runtimeThrottlingNotifications: RuntimeThrottlingNotifications;
  readonly runtimeRateLimitingNotificationsBullMq: RuntimeRateLimitingNotificationsBullMq;
  readonly runtimeRecoveryNotifications: RuntimeRecoveryNotifications;
  readonly runtimeRecoveryDeadLetters: RuntimeRecoveryDeadLetters;
  readonly runtimeRecoveryProviders: RuntimeRecoveryProviders;
  readonly santeRuntimeNotifications: SanteRuntimeNotifications;
  readonly diagnosticRuntimeNotifications: DiagnosticRuntimeNotifications;
}

/** Cette classe centralise le cablage runtime BullMQ a partir des briques infra deja posees. */
export class FabriqueRuntimeNotificationsBullMq {
  /** Cette methode construit l ensemble des composants runtime BullMQ Notifications. */
  public creer(
    dependances: DependancesFabriqueRuntimeNotificationsBullMq,
  ): ComposantsRuntimeNotificationsBullMq {
    const registreRuntimeNotifications = new RegistreRuntimeNotifications();

    const runtimeMonitoringNotifications = new RuntimeMonitoringNotifications(
      dependances.adaptateurMonitoringNotification,
    );
    const runtimeSupervisionNotifications = new RuntimeSupervisionNotifications(
      runtimeMonitoringNotifications,
    );
    const runtimePlanificationNotifications = new RuntimePlanificationNotifications(
      dependances.planificateurNotifications,
    );
    const runtimeExpirationNotifications = new RuntimeExpirationNotifications(
      dependances.planificateurExpirationNotifications,
    );
    const runtimeArchivageNotifications = new RuntimeArchivageNotifications(
      dependances.planificateurArchivageNotifications,
    );
    const runtimeThrottlingNotifications = new RuntimeThrottlingNotifications(
      dependances.regulateurThrottlingNotificationRedis,
    );
    const runtimeRateLimitingNotificationsBullMq = new RuntimeRateLimitingNotificationsBullMq(
      dependances.regulateurRateLimitingNotificationBullMq,
    );
    const runtimeRecoveryNotifications = new RuntimeRecoveryNotifications(
      dependances.recuperationQueuesNotifications,
      dependances.recuperationStockageNotifications,
      dependances.recuperationProvidersNotifications,
      dependances.recuperationTenantNotifications,
      dependances.recuperationDeadLetterNotifications,
    );
    const runtimeRecoveryDeadLetters = new RuntimeRecoveryDeadLetters(
      dependances.recuperationDeadLetterNotifications,
    );
    const runtimeRecoveryProviders = new RuntimeRecoveryProviders(
      dependances.recuperationProvidersNotifications,
    );

    const workerDiffusionNotifications = new WorkerDiffusionNotificationsBullMq(
      dependances.workerDiffusionNotificationBullMq,
    );
    const workerRetryNotifications = new WorkerRetryNotificationsBullMq(
      dependances.workerRetryNotificationBullMq,
    );
    const workerReplayNotifications = new WorkerReplayNotificationsBullMq(
      dependances.workerReplayNotificationBullMq,
    );
    const workerEscaladeNotifications = new WorkerEscaladeNotificationsBullMq(
      dependances.workerEscaladeNotificationBullMq,
    );
    const workerMonitoringNotifications = new WorkerMonitoringNotificationsBullMq(
      dependances.workerMonitoringNotificationBullMq,
    );
    const workerArchivageNotifications = new WorkerArchivageNotificationsBullMq(
      dependances.workerArchivageNotificationBullMq,
    );
    const workerCleanupNotifications = new WorkerCleanupNotificationsBullMq(
      dependances.workerCleanupNotificationBullMq,
    );
    const workerRecoveryNotifications = new WorkerRecoveryNotificationsBullMq(
      dependances.workerRecoveryNotificationBullMq,
    );

    const coordinateurFilesNotifications = new CoordinateurFilesNotifications(
      runtimePlanificationNotifications,
      runtimeThrottlingNotifications,
    );
    const coordinateurWorkersNotifications = new CoordinateurWorkersNotifications(
      registreRuntimeNotifications,
      workerDiffusionNotifications,
      workerRetryNotifications,
      workerReplayNotifications,
      workerEscaladeNotifications,
      workerMonitoringNotifications,
      workerArchivageNotifications,
      workerCleanupNotifications,
      workerRecoveryNotifications,
    );
    const coordinateurRuntimeNotifications = new CoordinateurRuntimeNotifications(
      registreRuntimeNotifications,
      coordinateurWorkersNotifications,
      runtimeMonitoringNotifications,
      runtimeRecoveryNotifications,
    );
    const santeRuntimeNotifications = new SanteRuntimeNotifications(
      registreRuntimeNotifications,
      runtimeSupervisionNotifications,
    );
    const diagnosticRuntimeNotifications = new DiagnosticRuntimeNotifications(
      santeRuntimeNotifications,
      registreRuntimeNotifications,
    );

    return {
      registreRuntimeNotifications,
      coordinateurFilesNotifications,
      coordinateurWorkersNotifications,
      coordinateurRuntimeNotifications,
      runtimeMonitoringNotifications,
      runtimeSupervisionNotifications,
      runtimePlanificationNotifications,
      runtimeExpirationNotifications,
      runtimeArchivageNotifications,
      runtimeThrottlingNotifications,
      runtimeRateLimitingNotificationsBullMq,
      runtimeRecoveryNotifications,
      runtimeRecoveryDeadLetters,
      runtimeRecoveryProviders,
      santeRuntimeNotifications,
      diagnosticRuntimeNotifications,
    };
  }
}
