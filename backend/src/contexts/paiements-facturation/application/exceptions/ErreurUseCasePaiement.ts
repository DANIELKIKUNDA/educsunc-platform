import { ErreurApplicationPaiements } from './ErreurApplicationPaiements';

export class ErreurUseCasePaiement extends ErreurApplicationPaiements {
  constructor(message: string, code = 'ERREUR_USE_CASE_PAIEMENT') {
    super(message, code);
    this.name = 'ErreurUseCasePaiement';
  }
}
