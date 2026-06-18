import {
  DiagnosticRuntimeNotifications,
  RuntimeRecoveryDeadLetters,
  RuntimeRecoveryProviders,
} from '../../runtime';

// Ce fichier expose le diagnostic operational consolide du module Notifications.

/** Cette classe enrichit le diagnostic runtime avec des signaux de recovery exploitables. */
export class DiagnosticOperationalNotifications {
  /** Ce constructeur relie le diagnostic aux briques runtime utiles au support local. */
  constructor(
    private readonly diagnosticRuntimeNotifications: DiagnosticRuntimeNotifications,
    private readonly runtimeRecoveryProviders: RuntimeRecoveryProviders,
    private readonly runtimeRecoveryDeadLetters: RuntimeRecoveryDeadLetters,
  ) {}

  /** Cette methode construit un diagnostic etendu utile au support et au debug local. */
  public async diagnostiquer(): Promise<{
    readonly runtime: Awaited<ReturnType<DiagnosticRuntimeNotifications['diagnostiquer']>>;
    readonly providersRecuperables: number;
    readonly deadLettersEnAttente: number;
    readonly collecteLe: Date;
  }> {
    const runtime = await this.diagnosticRuntimeNotifications.diagnostiquer();
    const providersRecuperables = await this.runtimeRecoveryProviders.listerRecuperables();
    const deadLetters = this.runtimeRecoveryDeadLetters.observer();

    return {
      runtime,
      providersRecuperables: providersRecuperables.length,
      deadLettersEnAttente: deadLetters.elementsTraites,
      collecteLe: new Date(),
    };
  }
}
