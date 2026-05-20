import { ErreurSecurite } from './ErreurSecurite';

export class ErreurContexteActifInvalide extends ErreurSecurite {
  constructor(message = 'Contexte actif invalide') {
    super(message);
    this.name = 'ErreurContexteActifInvalide';
  }
}
