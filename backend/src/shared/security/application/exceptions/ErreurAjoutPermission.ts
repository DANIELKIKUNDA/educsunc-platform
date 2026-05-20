export class ErreurAjoutPermission extends Error {
  constructor(message = "Ajout de permission impossible") {
    super(message);
    this.name = 'ErreurAjoutPermission';
  }
}
