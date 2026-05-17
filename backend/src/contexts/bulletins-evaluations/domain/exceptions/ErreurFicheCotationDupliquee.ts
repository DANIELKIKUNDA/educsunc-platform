import { ErreurMetier } from './ErreurMetier';

// Cette erreur signale la duplication d'une fiche de cotation.
export class ErreurFicheCotationDupliquee extends ErreurMetier {
  constructor(message = 'Une fiche de cotation existe deja pour cet eleve, ce cours et cette annee.') {
    super(message);
    this.name = 'ErreurFicheCotationDupliquee';
  }
}
