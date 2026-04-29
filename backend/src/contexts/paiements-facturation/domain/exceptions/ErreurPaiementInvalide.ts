export class ErreurPaiementInvalide extends Error {
  constructor(message = 'Le paiement fourni est invalide.') {
    super(message);
    this.name = 'ErreurPaiementInvalide';
  }
}
