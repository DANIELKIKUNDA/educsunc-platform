export class ErreurTrancheNonSequencielle extends Error {
  constructor(message = 'Le paiement des tranches Etat doit respecter la sequence attendue.') {
    super(message);
    this.name = 'ErreurTrancheNonSequencielle';
  }
}
