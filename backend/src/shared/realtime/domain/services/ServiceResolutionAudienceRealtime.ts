import type { AudienceTempsReel } from '../entities';

export class ServiceResolutionAudienceRealtime {
  public resoudre(audience: AudienceTempsReel): readonly string[] {
    return [...audience.utilisateurIds];
  }
}
