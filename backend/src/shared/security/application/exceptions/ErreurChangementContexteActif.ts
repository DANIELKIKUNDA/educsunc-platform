export class ErreurChangementContexteActif extends Error {
  constructor(message = 'Changement du contexte actif impossible') {
    super(message);
    this.name = 'ErreurChangementContexteActif';
  }
}
