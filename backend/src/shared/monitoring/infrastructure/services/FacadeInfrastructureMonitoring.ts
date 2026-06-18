import { RegistreInfrastructureMonitoring } from './RegistreInfrastructureMonitoring';

// Ce fichier declare la facade technique de Monitoring.

/** Cette classe expose un point d acces simple a l infrastructure Monitoring. */
export class FacadeInfrastructureMonitoring {
  constructor(private readonly registre = new RegistreInfrastructureMonitoring()) {}

  /** Cette methode retourne le registre technique courant. */
  public composants(): RegistreInfrastructureMonitoring {
    return this.registre;
  }
}
