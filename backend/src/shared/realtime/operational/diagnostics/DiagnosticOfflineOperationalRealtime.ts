import type { InitialiseurRuntimeRealtime } from '../../runtime';

export class DiagnosticOfflineOperationalRealtime {
  constructor(private readonly runtime: ReturnType<InitialiseurRuntimeRealtime['initialiser']>) {}

  public executer() {
    return {
      reconnexion: this.runtime.offline.reconnexion.reevaluer(),
      replay: this.runtime.offline.replay.executer(),
    };
  }
}
