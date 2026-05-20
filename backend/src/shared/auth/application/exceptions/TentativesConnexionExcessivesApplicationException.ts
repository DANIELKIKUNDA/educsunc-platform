// Cette exception applicative signale que le seuil d'echecs de connexion est atteint.
export class TentativesConnexionExcessivesApplicationException extends Error {
  constructor(message = 'Trop de tentatives de connexion') {
    super(message);
    this.name = 'TentativesConnexionExcessivesApplicationException';
  }
}
