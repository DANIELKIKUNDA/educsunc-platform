import { ErreurSession } from './ErreurSession';

// Cette erreur signale qu'un contexte actif de session est incoherent.
export class ErreurContexteActifInvalide extends ErreurSession {
  constructor(message = 'Contexte actif invalide') {
    super(message);
    this.name = 'ErreurContexteActifInvalide';
  }
}
