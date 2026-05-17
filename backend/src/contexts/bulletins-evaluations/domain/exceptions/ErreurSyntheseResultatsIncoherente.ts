import { ErreurMetier } from './ErreurMetier';

// Cette erreur signale une incoherence dans la synthese globale des resultats.
export class ErreurSyntheseResultatsIncoherente extends ErreurMetier {
  constructor(message = 'La synthese des resultats de l ecole est incoherente.') {
    super(message);
    this.name = 'ErreurSyntheseResultatsIncoherente';
  }
}
