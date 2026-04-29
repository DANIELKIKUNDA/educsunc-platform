export class ErreurGrilleTarificationInexistante extends Error {
  constructor(message = 'La grille de tarification demandee est introuvable.') {
    super(message);
    this.name = 'ErreurGrilleTarificationInexistante';
  }
}
