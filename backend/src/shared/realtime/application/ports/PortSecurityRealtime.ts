import type { AudienceTempsReel, ContexteTempsReel } from '../../domain';

export interface PortSecurityRealtime {
  autoriserAudience(audience: AudienceTempsReel, contexte: ContexteTempsReel): Promise<boolean>;
}
