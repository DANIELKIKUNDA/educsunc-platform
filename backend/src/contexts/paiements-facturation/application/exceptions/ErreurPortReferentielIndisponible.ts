import { ErreurApplicationPaiements } from './ErreurApplicationPaiements';

export class ErreurPortReferentielIndisponible extends ErreurApplicationPaiements {
  constructor(message = 'Le port Referentiel Academique est indisponible.') {
    super(message, 'ERREUR_PORT_REFERENTIEL_INDISPONIBLE');
    this.name = 'ErreurPortReferentielIndisponible';
  }
}
