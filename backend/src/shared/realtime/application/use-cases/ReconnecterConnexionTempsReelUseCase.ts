import type { ReconnecterConnexionTempsReelCommand } from '../commands';
import type { ConnexionTempsReelDto } from '../dto/output';
import { ServiceApplicationConnexionRealtime } from '../services';

export class ReconnecterConnexionTempsReelUseCase {
  constructor(private readonly service: ServiceApplicationConnexionRealtime) {}

  public async executer(
    commande: ReconnecterConnexionTempsReelCommand,
  ): Promise<ConnexionTempsReelDto> {
    return this.service.reconnecter(commande);
  }
}
