import type { AudienceTempsReel } from '../entities';
import type { ContexteTempsReel } from '../value-objects';

export class PolitiqueIsolationRealtime {
  public respecter(audience: AudienceTempsReel, contexte: ContexteTempsReel): boolean {
    if (audience.organisationId && contexte.organisationId) {
      if (audience.organisationId !== contexte.organisationId) {
        return false;
      }
    }
    if (audience.ecoleId && contexte.ecoleId) {
      if (audience.ecoleId !== contexte.ecoleId) {
        return false;
      }
    }
    return true;
  }
}
