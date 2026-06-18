import type { AudienceTempsReel } from '../../domain';

export interface PortAudienceRealtime {
  resoudre(audience: AudienceTempsReel): Promise<readonly string[]>;
}
