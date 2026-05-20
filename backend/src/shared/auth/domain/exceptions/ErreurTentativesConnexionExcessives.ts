import { ErreurAuthentification } from './ErreurAuthentification';

// Cette erreur signale qu'un compte doit etre bloque apres trop d'echecs.
export class ErreurTentativesConnexionExcessives extends ErreurAuthentification {
  constructor(message = 'Trop de tentatives de connexion') {
    super(message);
    this.name = 'ErreurTentativesConnexionExcessives';
  }
}
