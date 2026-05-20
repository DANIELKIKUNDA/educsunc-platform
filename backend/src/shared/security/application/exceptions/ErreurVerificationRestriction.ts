export class ErreurVerificationRestriction extends Error {
  constructor(message = 'Verification de restriction impossible') {
    super(message);
    this.name = 'ErreurVerificationRestriction';
  }
}
