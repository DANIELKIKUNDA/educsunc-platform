import { ErreurSession } from './ErreurSession';

// Cette erreur signale qu'une session revoquee n'est plus utilisable.
export class ErreurSessionRevoquee extends ErreurSession {
  constructor(message = 'Session revoquee') {
    super(message);
    this.name = 'ErreurSessionRevoquee';
  }
}
