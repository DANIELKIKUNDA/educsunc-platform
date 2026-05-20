export class ErreurRetraitPermission extends Error {
  constructor(message = 'Retrait de permission impossible') {
    super(message);
    this.name = 'ErreurRetraitPermission';
  }
}
