// Cette exception applicative signale qu'une ecole active est refusee.
export class EcoleActiveRefuseeApplicationException extends Error {
  constructor(message = 'Ecole active refusee') {
    super(message);
    this.name = 'EcoleActiveRefuseeApplicationException';
  }
}
