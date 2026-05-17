import { ErreurMetier } from './ErreurMetier';

// Cette erreur signale une incoherence interne dans une fiche de cotation.
export class ErreurFicheCotationIncoherente extends ErreurMetier {
  constructor(message = 'La fiche de cotation est incoherente.') {
    super(message);
    this.name = 'ErreurFicheCotationIncoherente';
  }
}
