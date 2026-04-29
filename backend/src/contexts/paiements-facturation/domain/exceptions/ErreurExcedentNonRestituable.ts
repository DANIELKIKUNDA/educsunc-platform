export class ErreurExcedentNonRestituable extends Error {
  constructor(message = 'L excedent constate ne peut etre ni affecte ni restitue.') {
    super(message);
    this.name = 'ErreurExcedentNonRestituable';
  }
}
