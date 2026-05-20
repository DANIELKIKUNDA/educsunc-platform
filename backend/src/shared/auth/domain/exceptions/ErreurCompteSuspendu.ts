import { ErreurAuthentification } from './ErreurAuthentification';

// Cette erreur signale qu'un compte suspendu ne peut pas se connecter.
export class ErreurCompteSuspendu extends ErreurAuthentification {
  constructor(message = 'Compte suspendu') {
    super(message);
    this.name = 'ErreurCompteSuspendu';
  }
}
