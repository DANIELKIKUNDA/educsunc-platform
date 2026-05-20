export class ErreurScopeAffectation extends Error {
  constructor(message = "Gestion du scope d'affectation impossible") {
    super(message);
    this.name = 'ErreurScopeAffectation';
  }
}
