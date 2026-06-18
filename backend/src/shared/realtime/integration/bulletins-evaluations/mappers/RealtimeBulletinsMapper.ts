import type { RealtimeBulletinsEvenement } from '../RealtimeBulletinsIntegrationTypes';

export class RealtimeBulletinsMapper {
  public static mapper(evenement: RealtimeBulletinsEvenement): RealtimeBulletinsEvenement {
    return evenement;
  }
}
