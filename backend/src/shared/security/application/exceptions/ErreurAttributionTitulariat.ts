export class ErreurAttributionTitulariat extends Error {
  constructor(message = 'Attribution du titulariat impossible') {
    super(message);
    this.name = 'ErreurAttributionTitulariat';
  }
}
