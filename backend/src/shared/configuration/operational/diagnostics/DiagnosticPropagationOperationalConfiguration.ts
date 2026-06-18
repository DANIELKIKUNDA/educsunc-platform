import { FacadeInfrastructureConfiguration } from '../../infrastructure';

// Ce fichier declare le diagnostic operational de propagation.

export class DiagnosticPropagationOperationalConfiguration {
  constructor(private readonly facade = new FacadeInfrastructureConfiguration()) {}

  public executer() {
    return this.facade.diagnostiquer().propagation;
  }
}
