import { ErreurMetier } from './ErreurMetier';

// Cette erreur signale des statistiques de proclamation invalides.
export class ErreurStatistiquesProclamationInvalides extends ErreurMetier {
  constructor(message = 'Les statistiques de proclamation sont invalides.') {
    super(message);
    this.name = 'ErreurStatistiquesProclamationInvalides';
  }
}
