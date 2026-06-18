import type { PublierEvenementTempsReelCommand } from '../commands';
import type { EvenementTempsReelDto, MessageTempsReelDto } from '../dto/output';
import { ServiceApplicationDiffusionRealtime } from '../services';

export class OrchestrateurDiffusionRealtime {
  constructor(private readonly service: ServiceApplicationDiffusionRealtime) {}

  public publier(commande: PublierEvenementTempsReelCommand): Promise<EvenementTempsReelDto> {
    return this.service.publier(commande);
  }

  public diffuser(commande: PublierEvenementTempsReelCommand): Promise<MessageTempsReelDto> {
    return this.service.diffuser(commande);
  }
}
