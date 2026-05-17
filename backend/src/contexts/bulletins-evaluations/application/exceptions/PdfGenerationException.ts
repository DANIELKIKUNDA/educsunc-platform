import { ApplicationException } from './ApplicationException';

// Cette erreur signale un echec de preparation ou de generation du PDF officiel.
export class PdfGenerationException extends ApplicationException {
  constructor(message = 'Le PDF du bulletin n a pas pu etre prepare.') {
    super(message, 'BULLETINS_PDF_GENERATION_EXCEPTION');
    this.name = 'PdfGenerationException';
  }
}
