import { ErreurApplicationPaiements } from './ErreurApplicationPaiements';

export class ErreurPaiementDejaTraite extends ErreurApplicationPaiements {
  constructor(message = 'Ce paiement a deja ete traite avec la meme cle idempotente.') {
    super(message, 'ERREUR_PAIEMENT_DEJA_TRAITE');
    this.name = 'ErreurPaiementDejaTraite';
  }
}
