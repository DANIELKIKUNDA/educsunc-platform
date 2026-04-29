export class ErreurAucuneObligationAPayer extends Error {
  constructor(message = 'Aucune obligation valable n a ete trouvee pour ce paiement.') {
    super(message);
    this.name = 'ErreurAucuneObligationAPayer';
  }
}
