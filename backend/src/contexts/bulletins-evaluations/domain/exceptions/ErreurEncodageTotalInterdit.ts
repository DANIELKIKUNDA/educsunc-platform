import { ErreurMetier } from './ErreurMetier';

// Cette erreur interdit l'encodage manuel d'une colonne total.
export class ErreurEncodageTotalInterdit extends ErreurMetier {
  constructor(message = 'Une colonne total ne peut pas etre encodee manuellement.') {
    super(message);
    this.name = 'ErreurEncodageTotalInterdit';
  }
}
