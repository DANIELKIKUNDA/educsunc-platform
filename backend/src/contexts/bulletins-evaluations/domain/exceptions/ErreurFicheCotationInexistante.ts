import { ErreurMetier } from './ErreurMetier';

// Cette erreur indique qu'une fiche de cotation est introuvable.
export class ErreurFicheCotationInexistante extends ErreurMetier {
  constructor(message = 'La fiche de cotation demandee est introuvable.') {
    super(message);
    this.name = 'ErreurFicheCotationInexistante';
  }
}
