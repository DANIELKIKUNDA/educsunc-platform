import { ErreurSession } from './ErreurSession';

// Cette erreur signale qu'une session expiree n'est plus valable.
export class ErreurSessionExpiree extends ErreurSession {
  constructor(message = 'Session expiree') {
    super(message);
    this.name = 'ErreurSessionExpiree';
  }
}
