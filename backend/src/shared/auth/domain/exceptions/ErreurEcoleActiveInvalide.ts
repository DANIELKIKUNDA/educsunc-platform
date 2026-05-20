import { ErreurContexteActifInvalide } from './ErreurContexteActifInvalide';

// Cette erreur signale qu'une ecole active demandee n'est pas autorisee.
export class ErreurEcoleActiveInvalide extends ErreurContexteActifInvalide {
  constructor(message = 'Ecole active invalide') {
    super(message);
    this.name = 'ErreurEcoleActiveInvalide';
  }
}
