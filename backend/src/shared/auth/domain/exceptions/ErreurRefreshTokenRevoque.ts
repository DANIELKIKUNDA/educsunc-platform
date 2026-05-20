import { ErreurRefreshTokenInvalide } from './ErreurRefreshTokenInvalide';

// Cette erreur signale qu'un refresh token a deja ete revoque.
export class ErreurRefreshTokenRevoque extends ErreurRefreshTokenInvalide {
  constructor(message = 'Refresh token revoque') {
    super(message);
    this.name = 'ErreurRefreshTokenRevoque';
  }
}
