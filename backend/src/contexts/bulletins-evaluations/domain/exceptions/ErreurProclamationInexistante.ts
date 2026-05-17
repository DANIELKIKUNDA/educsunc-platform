import { ErreurMetier } from './ErreurMetier';

// Cette erreur signale une proclamation introuvable.
export class ErreurProclamationInexistante extends ErreurMetier {
  constructor(message = 'La proclamation demandee est introuvable.') {
    super(message);
    this.name = 'ErreurProclamationInexistante';
  }
}
