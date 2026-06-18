import type {
  RealtimeSynchronisationEvenement,
  RealtimeSynchronisationProjection,
} from '../RealtimeSynchronisationIntegrationTypes';

export class RealtimeSynchronisationMapper {
  public static appliquer(
    projection: RealtimeSynchronisationProjection,
    evenement: RealtimeSynchronisationEvenement,
  ): RealtimeSynchronisationProjection {
    return {
      dernierEtat: evenement.type,
      totalSynchronisations: projection.totalSynchronisations + 1,
    };
  }
}
