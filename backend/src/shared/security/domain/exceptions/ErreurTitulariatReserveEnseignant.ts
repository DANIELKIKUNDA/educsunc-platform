import { ErreurSecurite } from './ErreurSecurite';

export class ErreurTitulariatReserveEnseignant extends ErreurSecurite {
  constructor(message = 'Le titulariat est reserve a un enseignant actif.') {
    super(message);
    this.name = 'ErreurTitulariatReserveEnseignant';
  }
}
