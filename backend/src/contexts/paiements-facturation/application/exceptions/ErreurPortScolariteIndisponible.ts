import { ErreurApplicationPaiements } from './ErreurApplicationPaiements';

export class ErreurPortScolariteIndisponible extends ErreurApplicationPaiements {
  constructor(message = 'Le port Scolarite Eleves est indisponible.') {
    super(message, 'ERREUR_PORT_SCOLARITE_INDISPONIBLE');
    this.name = 'ErreurPortScolariteIndisponible';
  }
}
