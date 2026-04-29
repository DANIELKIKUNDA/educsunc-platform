export class ErreurObligationInexistante extends Error {
  constructor(message = 'L obligation financiere demandee est introuvable.') {
    super(message);
    this.name = 'ErreurObligationInexistante';
  }
}
