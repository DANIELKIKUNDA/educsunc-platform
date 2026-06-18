import { FabriqueOperationalMonitoring } from './FabriqueOperationalMonitoring';

// Ce fichier declare l initialiseur operationnel du module Monitoring.

export class InitialiseurOperationalMonitoring {
  constructor(private readonly fabrique = new FabriqueOperationalMonitoring()) {}

  public initialiser() {
    return this.fabrique.creer();
  }
}
