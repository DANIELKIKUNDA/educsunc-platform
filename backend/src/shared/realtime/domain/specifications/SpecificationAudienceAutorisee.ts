import type { AudienceTempsReel } from '../entities';

export class SpecificationAudienceAutorisee {
  public estSatisfaitePar(audience: AudienceTempsReel): boolean {
    return audience.utilisateurIds.length > 0 && audience.permissionsRequises.length > 0;
  }
}
