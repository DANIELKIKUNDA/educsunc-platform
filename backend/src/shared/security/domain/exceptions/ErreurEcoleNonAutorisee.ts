import { ErreurAutorisation } from './ErreurAutorisation';

export class ErreurEcoleNonAutorisee extends ErreurAutorisation {
  constructor(message = 'Ecole non autorisee') {
    super(message);
    this.name = 'ErreurEcoleNonAutorisee';
  }
}
