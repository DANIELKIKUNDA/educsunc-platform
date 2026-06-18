import { FacadeInfrastructureRealtime } from '../../infrastructure';

export class RuntimeMetriquesRealtime {
  constructor(private readonly facade: FacadeInfrastructureRealtime) {}

  public lire() {
    return this.facade.registre.observabilite.lireCompteurs();
  }
}
