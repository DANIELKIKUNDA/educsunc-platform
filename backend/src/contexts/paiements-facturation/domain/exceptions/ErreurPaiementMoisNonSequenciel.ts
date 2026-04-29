export class ErreurPaiementMoisNonSequenciel extends Error {
  constructor(message = 'Le paiement des mois scolaires doit respecter la sequence attendue.') {
    super(message);
    this.name = 'ErreurPaiementMoisNonSequenciel';
  }
}
