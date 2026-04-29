export class ErreurGrilleTarificationIncoherente extends Error {
  constructor(message = 'La grille de tarification est incoherente.') {
    super(message);
    this.name = 'ErreurGrilleTarificationIncoherente';
  }
}
