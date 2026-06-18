import { FacadeInfrastructureRealtime } from '../../infrastructure';

export class RuntimeObservabiliteRealtime {
  constructor(private readonly facade: FacadeInfrastructureRealtime) {}

  public lire() {
    return {
      compteurs: this.facade.registre.observabilite.lireCompteurs(),
      signaux: this.facade.registre.observabilite.lireSignaux(),
    };
  }
}
