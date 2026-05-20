import { ErreurRestrictionBulletin } from '../exceptions/ErreurRestrictionBulletin';

export class PolicyBulletinConditionPaiement {
  public static verifier(bulletinAccessible: boolean): void {
    if (!bulletinAccessible) {
      throw new ErreurRestrictionBulletin('Le bulletin reste verrouille selon les regles de paiement.');
    }
  }
}
