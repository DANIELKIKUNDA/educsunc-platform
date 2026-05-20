export class ErreurVerificationPermission extends Error {
  constructor(message = 'Verification de permission impossible') {
    super(message);
    this.name = 'ErreurVerificationPermission';
  }
}
