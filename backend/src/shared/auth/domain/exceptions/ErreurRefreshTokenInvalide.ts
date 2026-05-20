import { ErreurAuthentification } from './ErreurAuthentification';

// Cette erreur signale qu'un refresh token ne peut pas etre accepte.
export class ErreurRefreshTokenInvalide extends ErreurAuthentification {
  constructor(message = 'Refresh token invalide') {
    super(message);
    this.name = 'ErreurRefreshTokenInvalide';
  }
}
