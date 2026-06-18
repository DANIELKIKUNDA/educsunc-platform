import type { OuvrirConnexionTempsReelCommand } from '../commands';
import type { ConnexionTempsReelDto } from '../dto/output';
import { ServiceApplicationConnexionRealtime } from '../services';

export class OuvrirConnexionTempsReelUseCase {
  constructor(private readonly service: ServiceApplicationConnexionRealtime) {}

  public async executer(commande: OuvrirConnexionTempsReelCommand): Promise<ConnexionTempsReelDto> {
    return this.service.ouvrir(commande);
  }
}
