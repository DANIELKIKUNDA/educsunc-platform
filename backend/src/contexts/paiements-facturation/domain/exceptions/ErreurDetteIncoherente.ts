export class ErreurDetteIncoherente extends Error {
  constructor(message = 'La dette calculee est incoherente.') {
    super(message);
    this.name = 'ErreurDetteIncoherente';
  }
}
