import { FacadeInfrastructureConfiguration } from '../../infrastructure';

// Ce fichier declare le diagnostic operational principal du module Configuration.

export class DiagnosticOperationalConfiguration {
  constructor(private readonly facade = new FacadeInfrastructureConfiguration()) {}

  public executer() {
    return this.facade.diagnostiquer();
  }
}
