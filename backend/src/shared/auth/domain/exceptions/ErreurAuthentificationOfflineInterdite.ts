import { ErreurAuthentification } from './ErreurAuthentification';

// Cette erreur signale qu'un utilisateur n'est pas autorise a travailler hors ligne.
export class ErreurAuthentificationOfflineInterdite extends ErreurAuthentification {
  constructor(message = 'Authentification offline interdite') {
    super(message);
    this.name = 'ErreurAuthentificationOfflineInterdite';
  }
}
