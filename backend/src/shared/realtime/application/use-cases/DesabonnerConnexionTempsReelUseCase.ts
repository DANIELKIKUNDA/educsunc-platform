import type { DesabonnerConnexionTempsReelCommand } from '../commands';
import type { AbonnementTempsReelDto } from '../dto/output';
import { ServiceApplicationAbonnementRealtime } from '../services';

export class DesabonnerConnexionTempsReelUseCase {
  constructor(private readonly service: ServiceApplicationAbonnementRealtime) {}

  public async executer(
    commande: DesabonnerConnexionTempsReelCommand,
  ): Promise<AbonnementTempsReelDto> {
    return this.service.desabonner(commande);
  }
}
