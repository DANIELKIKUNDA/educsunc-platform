// Ce fichier declare l exception racine du domaine Configuration.

/** Cette erreur represente la base de toutes les erreurs metier du domaine Configuration. */
export class ExceptionConfigurationDomain extends Error {
  /** Ce constructeur fixe le nom d exception domaine pour les traitements transverses. */
  constructor(message: string) {
    super(message);
    this.name = 'ExceptionConfigurationDomain';
  }
}
