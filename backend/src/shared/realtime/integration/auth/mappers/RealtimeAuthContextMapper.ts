import type { RealtimeAuthEvenement, RealtimeAuthProjection } from '../RealtimeAuthIntegrationTypes';

export class RealtimeAuthContextMapper {
  public static appliquer(
    projection: RealtimeAuthProjection,
    evenement: RealtimeAuthEvenement,
  ): RealtimeAuthProjection {
    return {
      ...projection,
      sessionActive: evenement.sessionActive,
      utilisateurId: evenement.utilisateurId,
      organisationId: evenement.organisationId,
      ecoleId: evenement.ecoleId,
      permissions: [...evenement.permissions],
    };
  }
}
