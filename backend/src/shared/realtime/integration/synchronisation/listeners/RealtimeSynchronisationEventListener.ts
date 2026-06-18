import type { RealtimeSynchronisationEvenement } from '../RealtimeSynchronisationIntegrationTypes';

export class RealtimeSynchronisationEventListener {
  public consommer(
    evenement: RealtimeSynchronisationEvenement,
  ): RealtimeSynchronisationEvenement {
    return evenement;
  }
}
