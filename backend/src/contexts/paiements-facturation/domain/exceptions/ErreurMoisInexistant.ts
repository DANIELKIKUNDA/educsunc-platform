export class ErreurMoisInexistant extends Error {
  constructor(message = 'Le mois scolaire cible est inexistant ou invalide.') {
    super(message);
    this.name = 'ErreurMoisInexistant';
  }
}
