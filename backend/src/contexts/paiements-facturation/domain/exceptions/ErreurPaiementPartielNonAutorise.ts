export class ErreurPaiementPartielNonAutorise extends Error {
  constructor(message = 'Le paiement partiel est interdit pour cette operation.') {
    super(message);
    this.name = 'ErreurPaiementPartielNonAutorise';
  }
}
