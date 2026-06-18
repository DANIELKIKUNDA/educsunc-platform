import {
  ComposantsRuntimeNotifications,
  DependancesFabriqueRuntimeNotifications,
  FabriqueRuntimeNotifications,
  InitialiseurRuntimeNotifications,
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
import { ScriptRecoveryNotifications } from '../scripts/ScriptRecoveryNotifications';
import { ScriptReplayNotifications } from '../scripts/ScriptReplayNotifications';
import { ScriptRetryNotifications } from '../scripts/ScriptRetryNotifications';
import { ScriptRuntimeNotifications } from '../scripts/ScriptRuntimeNotifications';

// Ce fichier centralise le cablage operational du module Notifications.

/** Cette interface represente les dependances minimales necessaires au bootstrap operational. */
export interface DependancesOperationalNotifications {
  readonly dependancesRuntime: DependancesFabriqueRuntimeNotifications;
}

/** Cette interface represente le conteneur operational complet du module Notifications. */
export interface ComposantsOperationalNotifications {
  readonly runtime: ComposantsRuntimeNotifications;
  readonly healthcheckNotifications: HealthcheckNotifications;
  readonly diagnosticOperationalNotifications: DiagnosticOperationalNotifications;
  readonly scriptRuntimeNotifications: ScriptRuntimeNotifications;
  readonly scriptReplayNotifications: ScriptReplayNotifications;
  readonly scriptRetryNotifications: ScriptRetryNotifications;
  readonly scriptRecoveryNotifications: ScriptRecoveryNotifications;
  readonly scriptMonitoringNotifications: ScriptMonitoringNotifications;
  readonly manifestRuntimeNotifications: ManifestRuntimeNotifications;
  readonly manifestWorkersNotifications: ManifestWorkersNotifications;
  readonly manifestHealthNotifications: ManifestHealthNotifications;
  readonly runbookRuntimeNotifications: RunbookRuntimeNotifications;
  readonly runbookReplayNotifications: RunbookReplayNotifications;
  readonly runbookRecoveryNotifications: RunbookRecoveryNotifications;
}

/** Cette classe construit les composants d exploitation locale du module Notifications. */
export class FabriqueOperationalNotifications {
  /** Ce constructeur permet d injecter la fabrique runtime si le cablage doit etre customise. */
  constructor(
    private readonly fabriqueRuntimeNotifications = new FabriqueRuntimeNotifications(),
  ) {}

  /** Cette methode cree l ensemble operational autour du runtime Notifications. */
  public creer(
    dependances: DependancesOperationalNotifications,
  ): ComposantsOperationalNotifications {
    const initialiseurRuntimeNotifications = new InitialiseurRuntimeNotifications(
      this.fabriqueRuntimeNotifications,
    );
    const runtime = initialiseurRuntimeNotifications.initialiser(
      dependances.dependancesRuntime,
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
    const scriptRetryNotifications = new ScriptRetryNotifications(
      runtime.coordinateurWorkersNotifications,
      runtime.runtimeRateLimitingNotifications,
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
      scriptRetryNotifications,
      scriptRecoveryNotifications,
      scriptMonitoringNotifications,
      manifestRuntimeNotifications,
      manifestWorkersNotifications,
      manifestHealthNotifications,
      runbookRuntimeNotifications,
      runbookReplayNotifications,
      runbookRecoveryNotifications,
    };
  }
}
