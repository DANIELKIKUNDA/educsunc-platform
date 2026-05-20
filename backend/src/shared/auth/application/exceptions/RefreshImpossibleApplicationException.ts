// Cette exception applicative encapsule un echec de refresh de session.
export class RefreshImpossibleApplicationException extends Error {
  constructor(message = 'Renouvellement de session impossible') {
    super(message);
    this.name = 'RefreshImpossibleApplicationException';
  }
}
