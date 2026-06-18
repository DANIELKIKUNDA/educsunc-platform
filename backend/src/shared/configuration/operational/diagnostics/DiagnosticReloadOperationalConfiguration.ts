import { FacadeInfrastructureConfiguration } from '../../infrastructure';

// Ce fichier declare le diagnostic operational de reload.

export class DiagnosticReloadOperationalConfiguration {
  constructor(private readonly facade = new FacadeInfrastructureConfiguration()) {}

  public executer() {
    return this.facade.diagnostiquer().reload;
  }
}
