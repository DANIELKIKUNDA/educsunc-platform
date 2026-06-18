import type { RealtimeSecurityEvenement, RealtimeSecurityProjection } from '../RealtimeSecurityIntegrationTypes';

export class RealtimeSecurityAudienceMapper {
  public static appliquer(
    _projection: RealtimeSecurityProjection,
    evenement: RealtimeSecurityEvenement,
  ): RealtimeSecurityProjection {
    return {
      autorise: evenement.autorise,
      scopes: [...evenement.scopes],
      permissions: [...evenement.permissions],
    };
  }
}
