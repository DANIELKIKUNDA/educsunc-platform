import { AdaptateurMonitoringNotification } from '../../infrastructure/monitoring';
import {
  PlanificateurArchivageNotifications,
  PlanificateurExpirationNotifications,
  PlanificateurNotifications,
} from '../../infrastructure/scheduler';
import {
  RegulateurRateLimitingNotification,
  RegulateurThrottlingNotification,
} from '../../infrastructure/throttling';
import {
  RecuperationDeadLetterNotifications,
  RecuperationProvidersNotifications,
  RecuperationQueuesNotifications,
  RecuperationStockageNotifications,
  RecuperationTenantNotifications,
} from '../../infrastructure/recovery';
import {
  WorkerArchivageNotification,
  WorkerCleanupNotification,
  WorkerDiffusionNotification,
  WorkerEscaladeNotification,
  WorkerRecoveryNotification,
  WorkerReplayNotification,
  WorkerRetryNotification,
} from '../../infrastructure/workers';
import {
  WorkerArchivageNotifications,
  WorkerCleanupNotifications,
  WorkerDiffusionNotifications,
  WorkerEscaladeNotifications,
  WorkerMonitoringNotifications,
  WorkerRecoveryNotifications,
  WorkerReplayNotifications,
  WorkerRetryNotifications,
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
import { RuntimeRateLimitingNotifications } from '../throttling/RuntimeRateLimitingNotifications';
import { RuntimeThrottlingNotifications } from '../throttling/RuntimeThrottlingNotifications';

// Ce fichier declare la fabrique de cablage du runtime Notifications.

/** Cette interface represente les dependances techniques necessaires a la creation du runtime. */
export interface DependancesFabriqueRuntimeNotifications {
  readonly adaptateurMonitoringNotification: AdaptateurMonitoringNotification;
  readonly planificateurNotifications: PlanificateurNotifications;
  readonly planificateurExpirationNotifications: PlanificateurExpirationNotifications;
  readonly planificateurArchivageNotifications: PlanificateurArchivageNotifications;
  readonly regulateurThrottlingNotification: RegulateurThrottlingNotification;
  readonly regulateurRateLimitingNotification: RegulateurRateLimitingNotification;
  readonly recuperationQueuesNotifications: RecuperationQueuesNotifications;
  readonly recuperationStockageNotifications: RecuperationStockageNotifications;
  readonly recuperationProvidersNotifications: RecuperationProvidersNotifications;
  readonly recuperationTenantNotifications: RecuperationTenantNotifications;
  readonly recuperationDeadLetterNotifications: RecuperationDeadLetterNotifications;
  readonly workerDiffusionNotification: WorkerDiffusionNotification;
  readonly workerRetryNotification: WorkerRetryNotification;
  readonly workerReplayNotification: WorkerReplayNotification;
  readonly workerEscaladeNotification: WorkerEscaladeNotification;
  readonly workerArchivageNotification: WorkerArchivageNotification;
  readonly workerCleanupNotification: WorkerCleanupNotification;
  readonly workerRecoveryNotification: WorkerRecoveryNotification;
}

// Ce fichier expose le resultat complet de creation du runtime Notifications.

/** Cette interface represente le runtime cable pret a etre demarre. */
export interface ComposantsRuntimeNotifications {
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
  readonly runtimeRateLimitingNotifications: RuntimeRateLimitingNotifications;
  readonly runtimeRecoveryNotifications: RuntimeRecoveryNotifications;
  readonly runtimeRecoveryDeadLetters: RuntimeRecoveryDeadLetters;
  readonly runtimeRecoveryProviders: RuntimeRecoveryProviders;
  readonly santeRuntimeNotifications: SanteRuntimeNotifications;
  readonly diagnosticRuntimeNotifications: DiagnosticRuntimeNotifications;
}

/** Cette classe centralise le cablage runtime a partir des briques infra deja posees. */
export class FabriqueRuntimeNotifications {
  /** Cette methode construit l'ensemble des composants runtime Notifications. */
  public creer(
    dependances: DependancesFabriqueRuntimeNotifications,
  ): ComposantsRuntimeNotifications {
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
      dependances.regulateurThrottlingNotification,
    );
    const runtimeRateLimitingNotifications = new RuntimeRateLimitingNotifications(
      dependances.regulateurRateLimitingNotification,
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

    const workerDiffusionNotifications = new WorkerDiffusionNotifications(
      dependances.workerDiffusionNotification,
    );
    const workerRetryNotifications = new WorkerRetryNotifications(
      dependances.workerRetryNotification,
    );
    const workerReplayNotifications = new WorkerReplayNotifications(
      dependances.workerReplayNotification,
    );
    const workerEscaladeNotifications = new WorkerEscaladeNotifications(
      dependances.workerEscaladeNotification,
    );
    const workerMonitoringNotifications = new WorkerMonitoringNotifications(
      dependances.adaptateurMonitoringNotification,
    );
    const workerArchivageNotifications = new WorkerArchivageNotifications(
      dependances.workerArchivageNotification,
    );
    const workerCleanupNotifications = new WorkerCleanupNotifications(
      dependances.workerCleanupNotification,
    );
    const workerRecoveryNotifications = new WorkerRecoveryNotifications(
      dependances.workerRecoveryNotification,
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
      runtimeRateLimitingNotifications,
      runtimeRecoveryNotifications,
      runtimeRecoveryDeadLetters,
      runtimeRecoveryProviders,
      santeRuntimeNotifications,
      diagnosticRuntimeNotifications,
    };
  }
}
