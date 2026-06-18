import type { AutorisationGenerationProclamationPort } from '../../contexts/bulletins-evaluations/application/ports/out/AutorisationGenerationProclamationPort';
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

// Cet adaptateur relit shared/security pour verrouiller localement l'initialisation et la generation de proclamation.
export class AutorisationGenerationProclamationAdapter
  implements AutorisationGenerationProclamationPort
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

  public async verifierInitialisationProclamation(params: {
    idUtilisateur: string;
    idOrganisation?: string;
    idEcole: string;
    idClassePedagogique: string;
    idAnneeScolaire: string;
  }): Promise<void> {
    await this.verifierAccesLocal(params);
  }

  public async verifierGenerationProclamation(params: {
    idUtilisateur: string;
    idOrganisation?: string;
    idEcole: string;
    idClassePedagogique: string;
    idAnneeScolaire: string;
  }): Promise<void> {
    await this.verifierAccesLocal(params);
  }

  public async fermer(): Promise<void> {
    await this.responsabiliteClassePedagogiqueAdapter.fermer();
  }

  private async verifierAccesLocal(params: {
    idUtilisateur: string;
    idOrganisation?: string;
    idEcole: string;
    idClassePedagogique: string;
    idAnneeScolaire: string;
  }): Promise<void> {
    await this.securityFacade.verifierAcces({
      idUtilisateur: params.idUtilisateur,
      permissionDemandee: 'proclamations.generate',
      idOrganisation: params.idOrganisation,
      idEcole: params.idEcole,
      idClasse: params.idClassePedagogique,
      idAnneeScolaire: params.idAnneeScolaire,
    });
  }
}
