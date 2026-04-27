import { ErreurMetier } from './ErreurMetier';

/**
 * Cette exception metier represente le cas ErreurClasseEtInscriptionIncoherentes.
 */
export class ErreurClasseEtInscriptionIncoherentes extends ErreurMetier {
  constructor(message = 'ErreurClasseEtInscriptionIncoherentes') {
    super(message, 'ERREURCLASSEETINSCRIPTIONINCOHERENTES');
    this.name = 'ErreurClasseEtInscriptionIncoherentes';
  }
}
