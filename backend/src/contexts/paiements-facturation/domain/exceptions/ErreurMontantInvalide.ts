export class ErreurMontantInvalide extends Error {
  constructor(message = 'Le montant financier fourni est invalide.') {
    super(message);
    this.name = 'ErreurMontantInvalide';
  }
}
