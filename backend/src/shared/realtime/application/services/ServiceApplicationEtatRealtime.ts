import type {
  PortRepositoryAbonnementRealtime,
  PortRepositoryConnexionRealtime,
  PortRepositoryEvenementRealtime,
} from '../../domain';
import type {
  EtatRealtimeDto,
  AbonnementTempsReelDto,
  ConnexionTempsReelDto,
} from '../dto/output';
import { AbonnementTempsReelApplicationMapper, ConnexionTempsReelApplicationMapper } from '../mappers';

export class ServiceApplicationEtatRealtime {
  constructor(
    private readonly repositoryConnexions: PortRepositoryConnexionRealtime,
    private readonly repositoryAbonnements: PortRepositoryAbonnementRealtime,
    private readonly repositoryEvenements: PortRepositoryEvenementRealtime,
    private readonly mapperConnexion = new ConnexionTempsReelApplicationMapper(),
    private readonly mapperAbonnement = new AbonnementTempsReelApplicationMapper(),
  ) {}

  public async obtenirEtat(connexionIds: readonly string[]): Promise<EtatRealtimeDto> {
    const connexions = await Promise.all(
      connexionIds.map((connexionId) => this.repositoryConnexions.trouverParId(connexionId)),
    );
    const abonnements = await Promise.all(
      connexionIds.map((connexionId) => this.repositoryAbonnements.trouverParConnexion(connexionId)),
    );
    const evenements = await this.repositoryEvenements.listerDiffusables();
    return {
      totalConnexions: connexions.filter(Boolean).length,
      totalAbonnements: abonnements.flat().length,
      totalEvenementsDiffusables: evenements.length,
    };
  }

  public async listerConnexions(connexionIds: readonly string[]): Promise<readonly ConnexionTempsReelDto[]> {
    const connexions = await Promise.all(
      connexionIds.map((connexionId) => this.repositoryConnexions.trouverParId(connexionId)),
    );
    return connexions.filter((item): item is NonNullable<typeof item> => item !== null).map(
      (connexion) => this.mapperConnexion.versDto(connexion),
    );
  }

  public async listerAbonnements(connexionId: string): Promise<readonly AbonnementTempsReelDto[]> {
    const abonnements = await this.repositoryAbonnements.trouverParConnexion(connexionId);
    return abonnements.map((abonnement) => this.mapperAbonnement.versDto(abonnement));
  }
}
