import { ErreurMetier } from './ErreurMetier';

// Cette erreur interdit la suppression physique des donnees du BC.
export class ErreurSuppressionPhysiqueInterdite extends ErreurMetier {
  constructor(message = 'La suppression physique est interdite pour cette ressource.') {
    super(message);
    this.name = 'ErreurSuppressionPhysiqueInterdite';
  }
}
