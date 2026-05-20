import { RestrictionRole } from '../entities/RestrictionRole';
import { PolicyRestrictionBulletin } from '../policies/PolicyRestrictionBulletin';
import { PolicyRestrictionCaisse } from '../policies/PolicyRestrictionCaisse';

// Ce moteur applique les grandes restrictions metier transverses du systeme scolaire.
export class MoteurRestrictionsMetier {
  public verifierCaisse(restrictions: readonly RestrictionRole[]): void {
    PolicyRestrictionCaisse.verifier(restrictions);
  }

  public verifierBulletins(restrictions: readonly RestrictionRole[]): void {
    PolicyRestrictionBulletin.verifier(restrictions);
  }
}
