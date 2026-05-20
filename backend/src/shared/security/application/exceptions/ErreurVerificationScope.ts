export class ErreurVerificationScope extends Error {
  constructor(message = 'Verification de scope impossible') {
    super(message);
    this.name = 'ErreurVerificationScope';
  }
}
