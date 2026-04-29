export class ErreurEcoleInvalide extends Error {
  constructor(message = 'L ecole fournie est invalide pour cette operation.') {
    super(message);
    this.name = 'ErreurEcoleInvalide';
  }
}
