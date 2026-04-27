import { ErreurMetier } from './ErreurMetier';

/**
 * Cette exception metier represente le cas ErreurSuppressionPhysiqueInterdite.
 */
export class ErreurSuppressionPhysiqueInterdite extends ErreurMetier {
  constructor(message = 'ErreurSuppressionPhysiqueInterdite') {
    super(message, 'ERREURSUPPRESSIONPHYSIQUEINTERDITE');
    this.name = 'ErreurSuppressionPhysiqueInterdite';
  }
}
