import type { PortSecurityRealtime } from '../../application';
import type { AudienceTempsReel, ContexteTempsReel } from '../../domain';
import { PolitiqueAccesRealtimeLocal } from './PolitiqueAccesRealtimeLocal';

export class AdaptateurSecurityRealtimeLocal implements PortSecurityRealtime {
  private readonly politique = new PolitiqueAccesRealtimeLocal();

  public async autoriserAudience(
    audience: AudienceTempsReel,
    contexte: ContexteTempsReel,
  ): Promise<boolean> {
    return this.politique.autoriser(audience, contexte);
  }
}
