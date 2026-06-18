import type { AudienceTempsReel } from '../../domain';
import type { PortAudienceRealtime } from '../../application';

export class ResolveurAudienceRealtimeLocal implements PortAudienceRealtime {
  public async resoudre(audience: AudienceTempsReel): Promise<readonly string[]> {
    return [...audience.utilisateurIds];
  }
}
