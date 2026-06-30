import type { AutorisationGenerationSynthesePort } from '../../contexts/bulletins-evaluations/application/ports/out/AutorisationGenerationSynthesePort';
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

interface DependancesAutorisationGenerationSyntheseAdapter {
  securityFacade?: Pick<SecurityFacade, 'verifierAcces'>;
  securityCapacitesEffectivesService?: Pick<
    SecurityCapacitesEffectivesService,
    'calculerPourUtilisateur'
  >;
}

// Cet adaptateur relit shared/security pour verrouiller localement la generation d'une synthese d'ecole.
export class AutorisationGenerationSyntheseAdapter implements AutorisationGenerationSynthesePort {
  private readonly responsabiliteClassePedagogiqueAdapter = new ResponsabiliteClassePedagogiqueAdapter();
  private readonly securityCapacitesEffectivesService: Pick<
    SecurityCapacitesEffectivesService,
    'calculerPourUtilisateur'
  >;
  private readonly securityFacade: Pick<SecurityFacade, 'verifierAcces'>;

  constructor(dependances?: DependancesAutorisationGenerationSyntheseAdapter) {
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

  public async verifierInitialisationSynthese(params: {
    idUtilisateur: string;
    idOrganisation?: string;
    idEcole: string;
    idAnneeScolaire: string;
    idClassesPedagogiques: string[];
  }): Promise<void> {
    const classesUniques = Array.from(new Set(params.idClassesPedagogiques.filter((valeur) => valeur.trim().length > 0)));

    for (const idClassePedagogique of classesUniques) {
      await this.verifierAccesClasse({
        idUtilisateur: params.idUtilisateur,
        idOrganisation: params.idOrganisation,
        idEcole: params.idEcole,
        idClassePedagogique,
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
      await this.verifierAccesClasse({
        idUtilisateur: params.idUtilisateur,
        idOrganisation: params.idOrganisation,
        idEcole: params.idEcole,
        idClassePedagogique,
        idAnneeScolaire: params.idAnneeScolaire,
      });
    }
  }

  public async fermer(): Promise<void> {
    await this.responsabiliteClassePedagogiqueAdapter.fermer();
  }

  private async verifierAccesClasse(params: {
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

    const capacites = await this.securityCapacitesEffectivesService.calculerPourUtilisateur({
      idUtilisateur: params.idUtilisateur,
      idOrganisationActive: params.idOrganisation,
      idEcoleActive: params.idEcole,
      idClasse: params.idClassePedagogique,
      idAnneeScolaire: params.idAnneeScolaire,
    });

    if (
      !capacites.permissions.includes('proclamations.generate')
      || !capacites.estTitulaireEffectif
    ) {
      throw new ApplicationException(
        "L'utilisateur demandeur n'est pas autorise a generer cette synthese.",
        'SYNTHESE_RESULTATS_GENERATION_ACCES_REFUSE',
      );
    }
  }
}
