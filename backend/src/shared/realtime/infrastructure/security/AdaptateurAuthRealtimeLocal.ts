import type { PortAuthRealtime } from '../../application';
import type { ContexteTempsReel } from '../../domain';

export class AdaptateurAuthRealtimeLocal implements PortAuthRealtime {
  public async validerContexte(contexte: ContexteTempsReel): Promise<boolean> {
    return Boolean(contexte.utilisateurId && contexte.sessionId);
  }
}
