import type { PublierEvenementTempsReelCommand } from '../commands';
import type { MessageTempsReelDto } from '../dto/output';
import { ServiceApplicationDiffusionRealtime } from '../services';

export class DiffuserMessageTempsReelUseCase {
  constructor(private readonly service: ServiceApplicationDiffusionRealtime) {}

  public async executer(commande: PublierEvenementTempsReelCommand): Promise<MessageTempsReelDto> {
    return this.service.diffuser(commande);
  }
}
