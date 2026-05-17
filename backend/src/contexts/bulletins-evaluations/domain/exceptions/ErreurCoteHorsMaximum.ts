import { ErreurCoteInvalide } from './ErreurCoteInvalide';

// Cette erreur interdit une cote superieure a son maximum officiel.
export class ErreurCoteHorsMaximum extends ErreurCoteInvalide {
  constructor(message = 'La cote depasse le maximum officiel.') {
    super(message);
    this.name = 'ErreurCoteHorsMaximum';
  }
}
