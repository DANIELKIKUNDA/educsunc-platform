import { ErreurSecurite } from './ErreurSecurite';

export class ErreurTitulariatInvalide extends ErreurSecurite {
  constructor(message = 'Titulariat invalide') {
    super(message);
    this.name = 'ErreurTitulariatInvalide';
  }
}
