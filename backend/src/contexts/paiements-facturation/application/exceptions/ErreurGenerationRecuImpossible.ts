import { ErreurApplicationPaiements } from './ErreurApplicationPaiements';

export class ErreurGenerationRecuImpossible extends ErreurApplicationPaiements {
  constructor(message = 'La generation du recu a echoue.') {
    super(message, 'ERREUR_GENERATION_RECU_IMPOSSIBLE');
    this.name = 'ErreurGenerationRecuImpossible';
  }
}
