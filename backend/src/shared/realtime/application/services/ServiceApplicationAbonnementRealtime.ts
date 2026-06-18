import type { PortRepositoryAbonnementRealtime } from '../../domain';
import type {
  AbonnerConnexionTempsReelCommand,
  DesabonnerConnexionTempsReelCommand,
} from '../commands';
import type { AbonnementTempsReelDto } from '../dto/output';
import { ExceptionAbonnementRealtimeIntrouvable } from '../exceptions';
import { AbonnementTempsReelApplicationMapper } from '../mappers';
import { ValidateurAbonnementTempsReel } from '../validators';

export class ServiceApplicationAbonnementRealtime {
  constructor(
    private readonly repository: PortRepositoryAbonnementRealtime,
    private readonly validateur = new ValidateurAbonnementTempsReel(),
    private readonly mapper = new AbonnementTempsReelApplicationMapper(),
  ) {}

  public async abonner(
    commande: AbonnerConnexionTempsReelCommand,
  ): Promise<AbonnementTempsReelDto> {
    this.validateur.valider(commande);
    const abonnement = this.mapper.versDomaine(commande);
    await this.repository.sauvegarder(abonnement);
    return this.mapper.versDto(abonnement);
  }

  public async desabonner(
    commande: DesabonnerConnexionTempsReelCommand,
  ): Promise<AbonnementTempsReelDto> {
    const abonnements = await this.repository.trouverParConnexion(commande.connexionId);
    const abonnement = abonnements.find((item) => item.canal.nom === commande.canal);
    if (!abonnement) {
      throw new ExceptionAbonnementRealtimeIntrouvable();
    }
    abonnement.retirer();
    await this.repository.sauvegarder(abonnement);
    return this.mapper.versDto(abonnement);
  }
}
