import { ErreurMetier } from './ErreurMetier';

// Cette erreur signale que la colonne demandee n'est pas ouverte a l'encodage a la date de reference.
export class ErreurFenetreEncodageFermee extends ErreurMetier {
  constructor(message: string) {
    super(message);
    this.name = 'ErreurFenetreEncodageFermee';
  }
}
