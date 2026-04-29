import { ErreurApplicationPaiements } from './ErreurApplicationPaiements';

export class ErreurCaisseIndisponible extends ErreurApplicationPaiements {
  constructor(message = 'La caisse demandee est indisponible.') {
    super(message, 'ERREUR_CAISSE_INDISPONIBLE');
    this.name = 'ErreurCaisseIndisponible';
  }
}
