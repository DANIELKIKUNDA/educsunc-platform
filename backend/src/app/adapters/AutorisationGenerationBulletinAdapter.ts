import type { AutorisationGenerationBulletinPort } from '../../contexts/bulletins-evaluations/application/ports/out/AutorisationGenerationBulletinPort';
import { ApplicationException } from '../../contexts/bulletins-evaluations/application/exceptions/ApplicationException';
import { SecurityCapacitesEffectivesService } from '../../shared/security/application/services/SecurityCapacitesEffectivesService';
import { SecurityFacade } from '../../shared/security/application/services/SecurityFacade';
import {
  PermissionCacheService,
  PostgresAffectationTitulariatRepository,
  PostgresAffectationUtilisateurRepository,
  PostgresRoleRepository,
  SecurityAuditInfrastructureService,
} from '../../shared/security/infrastructure';
import {
  MoteurAutorisation,
  MoteurCapacitesEffectives,
  MoteurRestrictionsMetier,
  MoteurScope,
} from '../../shared/security/domain';
import { ResponsabiliteClassePedagogiqueAdapter } from './ResponsabiliteClassePedagogiqueAdapter';

interface DependancesAutorisationGenerationBulletinAdapter {
  securityFacade?: Pick<SecurityFacade, 'verifierAcces'>;
  securityCapacitesEffectivesService?: Pick<
    SecurityCapacitesEffectivesService,
    'calculerPourUtilisateur'
  >;
}

// Cet adaptateur relit shared/security pour verrouiller localement la generation de bulletin.
export class AutorisationGenerationBulletinAdapter
  implements AutorisationGenerationBulletinPort
{
  private readonly responsabiliteClassePedagogiqueAdapter = new ResponsabiliteClassePedagogiqueAdapter();
  private readonly securityCapacitesEffectivesService: Pick<
    SecurityCapacitesEffectivesService,
    'calculerPourUtilisateur'
  >;
  private readonly securityFacade: Pick<SecurityFacade, 'verifierAcces'>;

  constructor(dependances?: DependancesAutorisationGenerationBulletinAdapter) {
    this.securityCapacitesEffectivesService =
      dependances?.securityCapacitesEffectivesService
      ?? new SecurityCapacitesEffectivesService(
        new PostgresRoleRepository(),
        new PostgresAffectationUtilisateurRepository(),
        new PostgresAffectationTitulariatRepository(),
        new MoteurCapacitesEffectives(),
        this.responsabiliteClassePedagogiqueAdapter,
      );
    this.securityFacade =
      dependances?.securityFacade
      ?? new SecurityFacade(
        new PostgresRoleRepository(),
        new PostgresAffectationUtilisateurRepository(),
        new PostgresAffectationTitulariatRepository(),
        new PermissionCacheService(),
        new MoteurAutorisation(),
        new MoteurScope(),
        new MoteurRestrictionsMetier(),
        new MoteurCapacitesEffectives(),
        new SecurityAuditInfrastructureService(),
        this.responsabiliteClassePedagogiqueAdapter,
      );
  }

  public async verifierGenerationBulletin(params: {
    idUtilisateur: string;
    idOrganisation?: string;
    idEcole: string;
    idClassePedagogique: string;
    idAnneeScolaire: string;
  }): Promise<void> {
    await this.securityFacade.verifierAcces({
      idUtilisateur: params.idUtilisateur,
      permissionDemandee: 'bulletins.generate',
      idOrganisation: params.idOrganisation,
      idEcole: params.idEcole,
      idClasse: params.idClassePedagogique,
      idAnneeScolaire: params.idAnneeScolaire,
    });

    const capacites = await this.securityCapacitesEffectivesService.calculerPourUtilisateur({
      idUtilisateur: params.idUtilisateur,
      idOrganisationActive: params.idOrganisation,
      idEcoleActive: params.idEcole,
      idClasse: params.idClassePedagogique,
      idAnneeScolaire: params.idAnneeScolaire,
    });

    if (
      !capacites.permissions.includes('bulletins.generate')
      || !capacites.estTitulaireEffectif
    ) {
      throw new ApplicationException(
        "L'utilisateur demandeur n'est pas autorise a generer ce bulletin.",
        'BULLETINS_GENERATION_ACCES_REFUSE',
      );
    }
  }

  public async fermer(): Promise<void> {
    await this.responsabiliteClassePedagogiqueAdapter.fermer();
  }
}
