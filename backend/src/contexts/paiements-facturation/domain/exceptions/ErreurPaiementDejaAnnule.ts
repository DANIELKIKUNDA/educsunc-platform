export class ErreurPaiementDejaAnnule extends Error {
  constructor(message = 'Le paiement a deja ete annule.') {
    super(message);
    this.name = 'ErreurPaiementDejaAnnule';
  }
}
