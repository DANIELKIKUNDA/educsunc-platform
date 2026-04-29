export class ErreurCaisseDejaOuverte extends Error {
  constructor(message = 'Une caisse active existe deja pour cette ecole et cette date.') {
    super(message);
    this.name = 'ErreurCaisseDejaOuverte';
  }
}
