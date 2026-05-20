export class ErreurModificationRole extends Error {
  constructor(message = 'Modification du role impossible') {
    super(message);
    this.name = 'ErreurModificationRole';
  }
}
