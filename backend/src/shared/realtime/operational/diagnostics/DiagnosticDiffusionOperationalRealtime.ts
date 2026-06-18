import type { InitialiseurRuntimeRealtime } from '../../runtime';

export class DiagnosticDiffusionOperationalRealtime {
  constructor(private readonly runtime: ReturnType<InitialiseurRuntimeRealtime['initialiser']>) {}

  public executer() {
    return {
      journal: this.runtime.broadcast.dispatch.journal(),
      canaux: this.runtime.broadcast.canaux.lister(),
    };
  }
}
