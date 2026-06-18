import { ApplicationException } from './ApplicationException';

// Cette erreur signale que la colonne demandee n'est pas ouverte a l'encodage a la date de reference.
export class ErreurFenetreEncodageFermee extends ApplicationException {
  constructor(message: string, code = 'BULLETINS_FENETRE_ENCODOGE_FERMEE') {
    super(message, code);
    this.name = 'ErreurFenetreEncodageFermee';
  }
}
