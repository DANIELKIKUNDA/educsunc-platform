import { FacadeInfrastructureConfiguration } from '../../infrastructure';

// Ce fichier declare la vue operational de monitoring du module Configuration.

export class MonitoringOperationalConfiguration {
  constructor(private readonly facade = new FacadeInfrastructureConfiguration()) {}

  public executer() {
    return {
      cache: this.facade.snapshotCache(),
      diagnostic: this.facade.diagnostiquer(),
    };
  }
}
