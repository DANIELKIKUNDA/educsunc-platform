export class ErreurAccesRefuse extends Error {
  constructor(message = 'Acces refuse') {
    super(message);
    this.name = 'ErreurAccesRefuse';
  }
}
