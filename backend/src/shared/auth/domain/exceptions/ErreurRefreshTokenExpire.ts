import { ErreurRefreshTokenInvalide } from './ErreurRefreshTokenInvalide';

// Cette erreur signale qu'un refresh token a deja expire.
export class ErreurRefreshTokenExpire extends ErreurRefreshTokenInvalide {
  constructor(message = 'Refresh token expire') {
    super(message);
    this.name = 'ErreurRefreshTokenExpire';
  }
}
