// Cette exception applicative signale qu'une organisation active est refusee.
export class OrganisationActiveRefuseeApplicationException extends Error {
  constructor(message = 'Organisation active refusee') {
    super(message);
    this.name = 'OrganisationActiveRefuseeApplicationException';
  }
}
