export class ErreurActivationAffectation extends Error {
  constructor(message = "Activation d'affectation impossible") {
    super(message);
    this.name = 'ErreurActivationAffectation';
  }
}
