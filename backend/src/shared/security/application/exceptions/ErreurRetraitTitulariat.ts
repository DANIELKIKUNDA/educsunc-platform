export class ErreurRetraitTitulariat extends Error {
  constructor(message = 'Retrait du titulariat impossible') {
    super(message);
    this.name = 'ErreurRetraitTitulariat';
  }
}
