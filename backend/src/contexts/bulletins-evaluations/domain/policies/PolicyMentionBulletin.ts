import { MentionBulletin, calculerMentionBulletin } from '../value-objects/MentionBulletin';

// Cette policy convertit les pourcentages ou points en mention du bulletin.
export class PolicyMentionBulletin {
  // Cette methode convertit une valeur numerique en mention officielle.
  public convertir(valeur: number): MentionBulletin {
    return calculerMentionBulletin(valeur);
  }
}
