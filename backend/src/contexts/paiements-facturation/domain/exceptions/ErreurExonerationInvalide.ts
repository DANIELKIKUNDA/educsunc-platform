export class ErreurExonerationInvalide extends Error {
  constructor(message = 'L exoneration fournie est invalide.') {
    super(message);
    this.name = 'ErreurExonerationInvalide';
  }
}
