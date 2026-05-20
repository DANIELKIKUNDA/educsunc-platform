export class ErreurContexteInvalide extends Error {
  constructor(message = 'Contexte actif invalide') {
    super(message);
    this.name = 'ErreurContexteInvalide';
  }
}
