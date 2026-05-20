export class ErreurActivationRole extends Error {
  constructor(message = 'Activation du role impossible') {
    super(message);
    this.name = 'ErreurActivationRole';
  }
}
