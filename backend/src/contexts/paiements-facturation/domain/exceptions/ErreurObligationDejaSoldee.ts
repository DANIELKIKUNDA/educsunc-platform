export class ErreurObligationDejaSoldee extends Error {
  constructor(message = 'Cette obligation est deja soldee.') {
    super(message);
    this.name = 'ErreurObligationDejaSoldee';
  }
}
