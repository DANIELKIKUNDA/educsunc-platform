import { ErreurApplicationPaiements } from './ErreurApplicationPaiements';

export class ErreurDroitsInsuffisants extends ErreurApplicationPaiements {
  constructor(message = 'Les droits necessaires pour cette operation sont insuffisants.') {
    super(message, 'ERREUR_DROITS_INSUFFISANTS');
    this.name = 'ErreurDroitsInsuffisants';
  }
}
