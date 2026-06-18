import type { AutorisationGenerationSynthesePort } from '../../contexts/bulletins-evaluations/application/ports/out/AutorisationGenerationSynthesePort';
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

// Cet adaptateur relit shared/security pour verrouiller localement la generation d'une synthese d'ecole.
export class AutorisationGenerationSyntheseAdapter implements AutorisationGenerationSynthesePort {
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

  public async verifierInitialisationSynthese(params: {
    idUtilisateur: string;
    idOrganisation?: string;
    idEcole: string;
    idAnneeScolaire: string;
    idClassesPedagogiques: string[];
  }): Promise<void> {
    const classesUniques = Array.from(new Set(params.idClassesPedagogiques.filter((valeur) => valeur.trim().length > 0)));

    for (const idClassePedagogique of classesUniques) {
      await this.securityFacade.verifierAcces({
        idUtilisateur: params.idUtilisateur,
        permissionDemandee: 'proclamations.generate',
        idOrganisation: params.idOrganisation,
        idEcole: params.idEcole,
        idClasse: idClassePedagogique,
        idAnneeScolaire: params.idAnneeScolaire,
      });
    }
  }

  public async verifierGenerationSynthese(params: {
    idUtilisateur: string;
    idOrganisation?: string;
    idEcole: string;
    idAnneeScolaire: string;
    idClassesPedagogiques: string[];
  }): Promise<void> {
    const classesUniques = Array.from(new Set(params.idClassesPedagogiques.filter((valeur) => valeur.trim().length > 0)));

    for (const idClassePedagogique of classesUniques) {
      await this.securityFacade.verifierAcces({
        idUtilisateur: params.idUtilisateur,
        permissionDemandee: 'proclamations.generate',
        idOrganisation: params.idOrganisation,
        idEcole: params.idEcole,
        idClasse: idClassePedagogique,
        idAnneeScolaire: params.idAnneeScolaire,
      });
    }
  }

  public async fermer(): Promise<void> {
    await this.responsabiliteClassePedagogiqueAdapter.fermer();
  }
}
