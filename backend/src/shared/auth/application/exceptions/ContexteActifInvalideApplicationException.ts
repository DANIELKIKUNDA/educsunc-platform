// Cette exception applicative signale un contexte actif invalide ou absent.
export class ContexteActifInvalideApplicationException extends Error {
  constructor(message = 'Contexte actif invalide') {
    super(message);
    this.name = 'ContexteActifInvalideApplicationException';
  }
}
