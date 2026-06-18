import {
  FileDeadLetterNotificationsBullMq,
  FileEscaladeNotificationsBullMq,
  FileNotificationsBullMq,
  FileReplayNotificationsBullMq,
  FileRetryNotificationsBullMq,
} from '../../infrastructure/queues';
import {
  ComposantsRuntimeNotificationsBullMq,
  DependancesFabriqueRuntimeNotificationsBullMq,
  FabriqueRuntimeNotificationsBullMq,
  InitialiseurRuntimeNotificationsBullMq,
} from '../../runtime';
import { HealthcheckNotifications } from '../health/HealthcheckNotifications';
import { DiagnosticOperationalNotifications } from '../health/DiagnosticOperationalNotifications';
import { ManifestHealthNotifications } from '../manifests/ManifestHealthNotifications';
import { ManifestRuntimeNotifications } from '../manifests/ManifestRuntimeNotifications';
import { ManifestWorkersNotifications } from '../manifests/ManifestWorkersNotifications';
import { RunbookRecoveryNotifications } from '../runbooks/RunbookRecoveryNotifications';
import { RunbookReplayNotifications } from '../runbooks/RunbookReplayNotifications';
import { RunbookRuntimeNotifications } from '../runbooks/RunbookRuntimeNotifications';
import { ScriptMonitoringNotifications } from '../scripts/ScriptMonitoringNotifications';
import { ScriptQueuesBullMqNotifications } from '../scripts/ScriptQueuesBullMqNotifications';
import { ScriptRecoveryNotifications } from '../scripts/ScriptRecoveryNotifications';
import { ScriptReplayNotifications } from '../scripts/ScriptReplayNotifications';
import { ScriptRetryNotificationsBullMq } from '../scripts/ScriptRetryNotificationsBullMq';
import { ScriptRuntimeNotifications } from '../scripts/ScriptRuntimeNotifications';
import { ScriptWorkersBullMqNotifications } from '../scripts/ScriptWorkersBullMqNotifications';

// Ce fichier centralise le cablage operational BullMQ du module Notifications.

/** Cette interface represente les dependances minimales necessaires au bootstrap operational BullMQ. */
export interface DependancesOperationalNotificationsBullMq {
  readonly dependancesRuntimeBullMq: DependancesFabriqueRuntimeNotificationsBullMq;
  readonly fileNotificationsBullMq: FileNotificationsBullMq;
  readonly fileRetryNotificationsBullMq: FileRetryNotificationsBullMq;
  readonly fileReplayNotificationsBullMq: FileReplayNotificationsBullMq;
  readonly fileEscaladeNotificationsBullMq: FileEscaladeNotificationsBullMq;
  readonly fileDeadLetterNotificationsBullMq: FileDeadLetterNotificationsBullMq;
}

/** Cette interface represente le conteneur operational complet du module Notifications sur BullMQ. */
export interface ComposantsOperationalNotificationsBullMq {
  readonly runtime: ComposantsRuntimeNotificationsBullMq;
  readonly healthcheckNotifications: HealthcheckNotifications;
  readonly diagnosticOperationalNotifications: DiagnosticOperationalNotifications;
  readonly scriptRuntimeNotifications: ScriptRuntimeNotifications;
  readonly scriptReplayNotifications: ScriptReplayNotifications;
  readonly scriptRetryNotificationsBullMq: ScriptRetryNotificationsBullMq;
  readonly scriptRecoveryNotifications: ScriptRecoveryNotifications;
  readonly scriptMonitoringNotifications: ScriptMonitoringNotifications;
  readonly scriptQueuesBullMqNotifications: ScriptQueuesBullMqNotifications;
  readonly scriptWorkersBullMqNotifications: ScriptWorkersBullMqNotifications;
  readonly manifestRuntimeNotifications: ManifestRuntimeNotifications;
  readonly manifestWorkersNotifications: ManifestWorkersNotifications;
  readonly manifestHealthNotifications: ManifestHealthNotifications;
  readonly runbookRuntimeNotifications: RunbookRuntimeNotifications;
  readonly runbookReplayNotifications: RunbookReplayNotifications;
  readonly runbookRecoveryNotifications: RunbookRecoveryNotifications;
}

/** Cette classe construit les composants d exploitation locale du module Notifications sur BullMQ. */
export class FabriqueOperationalNotificationsBullMq {
  /** Ce constructeur permet d injecter la fabrique runtime BullMQ si le cablage doit etre customise. */
  constructor(
    private readonly fabriqueRuntimeNotificationsBullMq = new FabriqueRuntimeNotificationsBullMq(),
  ) {}

  /** Cette methode cree l ensemble operational autour du runtime BullMQ Notifications. */
  public creer(
    dependances: DependancesOperationalNotificationsBullMq,
  ): ComposantsOperationalNotificationsBullMq {
    const initialiseurRuntimeNotificationsBullMq = new InitialiseurRuntimeNotificationsBullMq(
      this.fabriqueRuntimeNotificationsBullMq,
    );
    const runtime = initialiseurRuntimeNotificationsBullMq.initialiser(
      dependances.dependancesRuntimeBullMq,
    );

    const healthcheckNotifications = new HealthcheckNotifications(
      runtime.santeRuntimeNotifications,
      runtime.runtimeMonitoringNotifications,
      runtime.registreRuntimeNotifications,
    );
    const diagnosticOperationalNotifications = new DiagnosticOperationalNotifications(
      runtime.diagnosticRuntimeNotifications,
      runtime.runtimeRecoveryProviders,
      runtime.runtimeRecoveryDeadLetters,
    );

    const scriptRuntimeNotifications = new ScriptRuntimeNotifications(
      runtime.coordinateurRuntimeNotifications,
      runtime.registreRuntimeNotifications,
    );
    const scriptReplayNotifications = new ScriptReplayNotifications(
      runtime.coordinateurWorkersNotifications,
      runtime.runtimeRecoveryDeadLetters,
    );
    const scriptRetryNotificationsBullMq = new ScriptRetryNotificationsBullMq(
      runtime.coordinateurWorkersNotifications,
      runtime.runtimeRateLimitingNotificationsBullMq,
      runtime.runtimeThrottlingNotifications,
    );
    const scriptRecoveryNotifications = new ScriptRecoveryNotifications(
      runtime.runtimeRecoveryNotifications,
      runtime.runtimeRecoveryDeadLetters,
      runtime.runtimeRecoveryProviders,
    );
    const scriptMonitoringNotifications = new ScriptMonitoringNotifications(
      runtime.runtimeMonitoringNotifications,
      runtime.runtimeSupervisionNotifications,
      healthcheckNotifications,
    );
    const scriptQueuesBullMqNotifications = new ScriptQueuesBullMqNotifications(
      dependances.fileNotificationsBullMq,
      dependances.fileRetryNotificationsBullMq,
      dependances.fileReplayNotificationsBullMq,
      dependances.fileEscaladeNotificationsBullMq,
      dependances.fileDeadLetterNotificationsBullMq,
    );
    const scriptWorkersBullMqNotifications = new ScriptWorkersBullMqNotifications(
      runtime.coordinateurWorkersNotifications,
      runtime.registreRuntimeNotifications,
    );

    const manifestRuntimeNotifications = new ManifestRuntimeNotifications();
    const manifestWorkersNotifications = new ManifestWorkersNotifications();
    const manifestHealthNotifications = new ManifestHealthNotifications();
    const runbookRuntimeNotifications = new RunbookRuntimeNotifications();
    const runbookReplayNotifications = new RunbookReplayNotifications();
    const runbookRecoveryNotifications = new RunbookRecoveryNotifications();

    return {
      runtime,
      healthcheckNotifications,
      diagnosticOperationalNotifications,
      scriptRuntimeNotifications,
      scriptReplayNotifications,
      scriptRetryNotificationsBullMq,
      scriptRecoveryNotifications,
      scriptMonitoringNotifications,
      scriptQueuesBullMqNotifications,
      scriptWorkersBullMqNotifications,
      manifestRuntimeNotifications,
      manifestWorkersNotifications,
      manifestHealthNotifications,
      runbookRuntimeNotifications,
      runbookReplayNotifications,
      runbookRecoveryNotifications,
    };
  }
}
