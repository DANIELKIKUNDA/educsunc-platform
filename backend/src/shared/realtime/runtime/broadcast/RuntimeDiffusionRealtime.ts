import type { PublierEvenementTempsReelCommand } from '../../application';
import { FacadeInfrastructureRealtime } from '../../infrastructure';

export class RuntimeDiffusionRealtime {
  constructor(private readonly facade: FacadeInfrastructureRealtime) {}

  public async publier(commande: PublierEvenementTempsReelCommand) {
    return this.facade.diffusion.publier(commande);
  }

  public async diffuser(commande: PublierEvenementTempsReelCommand) {
    return this.facade.diffusion.diffuser(commande);
  }
}
