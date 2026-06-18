import type { AutorisationClassementPort } from '../../contexts/bulletins-evaluations/application/ports/out/AutorisationClassementPort';
import { ApplicationException } from '../../contexts/bulletins-evaluations/application/exceptions/ApplicationException';
import { SecurityCapacitesEffectivesService, SecurityFacade } from 'shared/security/application';
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
import { AutorisationConsultationStatistiquesAdapter } from './AutorisationConsultationStatistiquesAdapter';
import { ResponsabiliteClassePedagogiqueAdapter } from './ResponsabiliteClassePedagogiqueAdapter';

interface DependancesAutorisationClassementAdapter {
  resoudreSectionClasse?: (params: {
    idOrganisation?: string;
    idEcole: string;
    idClassePedagogique: string;
  }) => Promise<string | null>;
  consulterResponsabiliteClassePedagogique?: (params: {
    idOrganisation?: string;
    idEcole?: string;
    idClassePedagogique: string;
    idAnneeScolaire: string;
  }) => Promise<{
    idOrganisation: string;
    idEcole: string;
    idClassePedagogique: string;
    idClasseAcademique: string;
    idSectionScolaire: string;
    sectionCode: string;
    sectionLibelle: string;
    idAnneeScolaire: string;
    idUtilisateurEnseignant: string;
    active: boolean;
  } | null>;
}

// Cet adaptateur reapplique shared/security pour le workflow de classement de classe.
export class AutorisationClassementAdapter implements AutorisationClassementPort {
  private readonly roleRepository = new PostgresRoleRepository();
  private readonly affectationRepository = new PostgresAffectationUtilisateurRepository();
  private readonly titulariatRepository = new PostgresAffectationTitulariatRepository();
  private readonly responsabiliteClassePedagogiqueAdapter = new ResponsabiliteClassePedagogiqueAdapter();
  private readonly autorisationConsultationStatistiquesAdapter: AutorisationConsultationStatistiquesAdapter;
  private readonly securityCapacitesEffectivesService: SecurityCapacitesEffectivesService;
  private readonly securityFacade = new SecurityFacade(
    this.roleRepository,
    this.affectationRepository,
    this.titulariatRepository,
    new PermissionCacheService(),
    new MoteurAutorisation(),
    new MoteurScope(),
    new MoteurRestrictionsMetier(),
    new MoteurCapacitesEffectives(),
    new SecurityAuditInfrastructureService(),
    this.responsabiliteClassePedagogiqueAdapter,
  );
  private readonly dependances: DependancesAutorisationClassementAdapter;

  constructor(
    dependances?: DependancesAutorisationClassementAdapter,
  ) {
    this.dependances = {
      ...dependances,
    };
    this.autorisationConsultationStatistiquesAdapter = new AutorisationConsultationStatistiquesAdapter(
      dependances
        ? {
          resoudreSectionClasse: dependances.resoudreSectionClasse,
        }
        : undefined,
    );
    this.securityCapacitesEffectivesService = new SecurityCapacitesEffectivesService(
      this.roleRepository,
      this.affectationRepository,
      this.titulariatRepository,
      new MoteurCapacitesEffectives(),
      this.dependances.consulterResponsabiliteClassePedagogique
        ? {
          consulterActiveParClasseEtAnnee: this.dependances.consulterResponsabiliteClassePedagogique,
        }
        : this.responsabiliteClassePedagogiqueAdapter,
    );
  }

  public async verifierConsultationClassementClasse(params: {
    idUtilisateur: string;
    idOrganisation?: string;
    idEcole: string;
    idClassePedagogique: string;
    idAnneeScolaire: string;
  }): Promise<void> {
    await this.autorisationConsultationStatistiquesAdapter.verifierConsultationStatistiquesClasse(params);
  }

  public async verifierRecalculClassementClasse(params: {
    idUtilisateur: string;
    idOrganisation?: string;
    idEcole: string;
    idClassePedagogique: string;
    idAnneeScolaire: string;
  }): Promise<void> {
    await this.securityFacade.verifierAcces({
      idUtilisateur: params.idUtilisateur,
      permissionDemandee: 'bulletins.read',
      idOrganisation: params.idOrganisation,
      idEcole: params.idEcole,
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
        "L'utilisateur demandeur n'est pas autorise a recalculer ce classement.",
        'BULLETINS_CLASSEMENT_RECALCUL_ACCES_REFUSE',
      );
    }
  }

  public async fermer(): Promise<void> {
    await this.autorisationConsultationStatistiquesAdapter.fermer();
    await this.responsabiliteClassePedagogiqueAdapter.fermer();
  }
}
