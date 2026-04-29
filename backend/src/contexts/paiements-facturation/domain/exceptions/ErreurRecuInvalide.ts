export class ErreurRecuInvalide extends Error {
  constructor(message = 'Le recu de paiement est invalide.') {
    super(message);
    this.name = 'ErreurRecuInvalide';
  }
}
