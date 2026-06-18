import type { AutorisationGenerationBulletinPort } from '../../contexts/bulletins-evaluations/application/ports/out/AutorisationGenerationBulletinPort';
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

// Cet adaptateur relit shared/security pour verrouiller localement la generation de bulletin.
export class AutorisationGenerationBulletinAdapter
  implements AutorisationGenerationBulletinPort
{
  private readonly responsabiliteClassePedagogiqueAdapter = new ResponsabiliteClassePedagogiqueAdapter();
  private readonly securityFacade = new SecurityFacade(
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
  }

  public async fermer(): Promise<void> {
    await this.responsabiliteClassePedagogiqueAdapter.fermer();
  }
}
