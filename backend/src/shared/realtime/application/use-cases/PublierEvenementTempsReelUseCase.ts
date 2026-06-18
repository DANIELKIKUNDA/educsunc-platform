import type { PublierEvenementTempsReelCommand } from '../commands';
import type { EvenementTempsReelDto } from '../dto/output';
import { ServiceApplicationDiffusionRealtime } from '../services';

export class PublierEvenementTempsReelUseCase {
  constructor(private readonly service: ServiceApplicationDiffusionRealtime) {}

  public async executer(commande: PublierEvenementTempsReelCommand): Promise<EvenementTempsReelDto> {
    return this.service.publier(commande);
  }
}
