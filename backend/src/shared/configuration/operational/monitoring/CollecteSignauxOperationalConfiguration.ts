import { FacadeInfrastructureConfiguration } from '../../infrastructure';

// Ce fichier declare la collecte operational des signaux du module Configuration.

export class CollecteSignauxOperationalConfiguration {
  constructor(private readonly facade = new FacadeInfrastructureConfiguration()) {}

  public collecter() {
    const composants = this.facade.composants();
    return {
      monitoring: composants.monitoring.journal(),
      sante: composants.sante.journal(),
      propagation: composants.propagateur.journal(),
      reload: composants.rechargeurRuntime.journal(),
    };
  }
}
