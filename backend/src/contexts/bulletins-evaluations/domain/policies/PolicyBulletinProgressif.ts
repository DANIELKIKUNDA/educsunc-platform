import { EtatBulletin } from '../value-objects/EtatBulletin';

// Cette policy aide a maintenir le caractere progressif du bulletin.
export class PolicyBulletinProgressif {
  // Cette methode indique si le bulletin peut encore etre complete.
  public peutCompleter(etatBulletin: EtatBulletin): boolean {
    return etatBulletin !== EtatBulletin.FINALISE;
  }
}
