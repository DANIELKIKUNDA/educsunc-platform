import { ErreurConcurrenceDomaine } from '../exceptions/ErreurConcurrenceDomaine';

// Cette policy oriente la synchronisation offline avec idempotence et gestion de conflit.
export class PolicyOfflineSyncCotation {
  // Cette methode verifie qu'une synchronisation offline porte bien une cle d'idempotence.
  public verifier(cleIdempotence?: string): void {
    if (typeof cleIdempotence !== 'string' || cleIdempotence.trim().length === 0) {
      throw new ErreurConcurrenceDomaine('Une synchronisation offline exige une cle d idempotence.');
    }
  }
}
