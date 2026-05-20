export class ErreurCreationRole extends Error {
  constructor(message = 'Creation du role impossible') {
    super(message);
    this.name = 'ErreurCreationRole';
  }
}
