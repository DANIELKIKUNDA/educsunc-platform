import { ErreurAuthentificationOfflineInterdite } from '../exceptions/ErreurAuthentificationOfflineInterdite';

// Cette policy controle l'ouverture et la reprise d'une authentification offline.
export class PolicyOfflineAuth {
  public static verifier(authOfflineAutorisee: boolean, modeOffline: boolean): void {
    if (modeOffline && !authOfflineAutorisee) {
      throw new ErreurAuthentificationOfflineInterdite();
    }
  }
}
