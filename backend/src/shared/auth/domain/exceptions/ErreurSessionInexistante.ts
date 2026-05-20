import { ErreurSession } from './ErreurSession';

// Cette erreur signale qu'aucune session demandee n'a ete retrouvee.
export class ErreurSessionInexistante extends ErreurSession {
  constructor(message = 'Session inexistante') {
    super(message);
    this.name = 'ErreurSessionInexistante';
  }
}
