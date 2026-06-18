import type { RealtimeBulletinsEvenement } from '../RealtimeBulletinsIntegrationTypes';

export class RealtimeBulletinsEventListener {
  public consommer(evenement: RealtimeBulletinsEvenement): RealtimeBulletinsEvenement {
    return evenement;
  }
}
