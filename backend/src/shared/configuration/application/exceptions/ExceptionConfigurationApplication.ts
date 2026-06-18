// Ce fichier declare l exception de base de la couche application.

/** Cette classe represente l erreur generique d application du module Configuration. */
export class ExceptionConfigurationApplication extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ExceptionConfigurationApplication';
  }
}
