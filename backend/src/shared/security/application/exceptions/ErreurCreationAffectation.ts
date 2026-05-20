export class ErreurCreationAffectation extends Error {
  constructor(message = "Creation d'affectation impossible") {
    super(message);
    this.name = 'ErreurCreationAffectation';
  }
}
