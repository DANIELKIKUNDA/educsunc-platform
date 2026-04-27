import { ErreurMetier } from './ErreurMetier';

/**
 * Cette exception metier represente le cas ErreurEcoleProvenanceInvalide.
 */
export class ErreurEcoleProvenanceInvalide extends ErreurMetier {
  constructor(message = 'ErreurEcoleProvenanceInvalide') {
    super(message, 'ERREURECOLEPROVENANCEINVALIDE');
    this.name = 'ErreurEcoleProvenanceInvalide';
  }
}
