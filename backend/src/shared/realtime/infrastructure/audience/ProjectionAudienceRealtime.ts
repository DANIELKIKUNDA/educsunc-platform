import type { AudienceTempsReel } from '../../domain';

export class ProjectionAudienceRealtime {
  public projeter(audience: AudienceTempsReel) {
    return {
      organisationId: audience.organisationId,
      ecoleId: audience.ecoleId,
      totalUtilisateurs: audience.utilisateurIds.length,
      permissions: audience.permissionsRequises.map((permission) => permission.value),
    };
  }
}
