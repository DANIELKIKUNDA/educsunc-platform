import { FacadeInfrastructureRealtime } from '../../infrastructure';

export class RuntimeDispatchRealtime {
  constructor(private readonly facade: FacadeInfrastructureRealtime) {}

  public journal() {
    return this.facade.registre.diffusion.lireJournal();
  }
}
