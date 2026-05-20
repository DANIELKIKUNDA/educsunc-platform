import { ErreurRefreshTokenInvalide } from '../exceptions/ErreurRefreshTokenInvalide';

// Cette policy garantit qu'un refresh token technique n'entre pas en collision.
export class PolicyRefreshTokenUnique {
  public static verifier(existeDeja: boolean): void {
    if (existeDeja) {
      throw new ErreurRefreshTokenInvalide('Collision de refresh token detectee.');
    }
  }
}
