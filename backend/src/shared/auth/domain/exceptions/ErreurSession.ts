import { ErreurAuth } from './ErreurAuth';

// Cette erreur racine specialise les problemes lies aux sessions utilisateur.
export class ErreurSession extends ErreurAuth {
  constructor(message = 'Erreur de session utilisateur') {
    super(message);
    this.name = 'ErreurSession';
  }
}
