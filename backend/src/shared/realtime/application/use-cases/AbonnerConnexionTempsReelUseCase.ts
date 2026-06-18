import type { AbonnerConnexionTempsReelCommand } from '../commands';
import type { AbonnementTempsReelDto } from '../dto/output';
import { ServiceApplicationAbonnementRealtime } from '../services';

export class AbonnerConnexionTempsReelUseCase {
  constructor(private readonly service: ServiceApplicationAbonnementRealtime) {}

  public async executer(
    commande: AbonnerConnexionTempsReelCommand,
  ): Promise<AbonnementTempsReelDto> {
    return this.service.abonner(commande);
  }
}
