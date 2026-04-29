export class ErreurEleveInvalide extends Error {
  constructor(message = 'L eleve fourni est invalide pour cette operation.') {
    super(message);
    this.name = 'ErreurEleveInvalide';
  }
}
