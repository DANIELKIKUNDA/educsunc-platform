import { ErreurMetier } from './ErreurMetier';

// Cette erreur signale une incoherence dans la proclamation de classe.
export class ErreurProclamationIncoherente extends ErreurMetier {
  constructor(message = 'La proclamation de classe est incoherente.') {
    super(message);
    this.name = 'ErreurProclamationIncoherente';
  }
}
