export class ErreurTenantInvalide extends Error {
  constructor(message = 'Le contexte tenant financier est invalide.') {
    super(message);
    this.name = 'ErreurTenantInvalide';
  }
}
