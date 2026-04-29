export class ErreurCaisseFermee extends Error {
  constructor(message = 'La caisse est deja cloturee pour cette operation.') {
    super(message);
    this.name = 'ErreurCaisseFermee';
  }
}
