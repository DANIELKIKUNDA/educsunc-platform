import type { AutorisationConduitePort } from '../../contexts/bulletins-evaluations/application/ports/out/AutorisationConduitePort';
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
import { ResponsabiliteClassePedagogiqueAdapter } from './ResponsabiliteClassePedagogiqueAdapter';
import { AutorisationConsultationStatistiquesAdapter } from './AutorisationConsultationStatistiquesAdapter';

interface DependancesAutorisationConduiteAdapter {
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

// Cet adaptateur reapplique shared/security pour l'encodage local de la conduite.
export class AutorisationConduiteAdapter implements AutorisationConduitePort {
  private readonly roleRepository = new PostgresRoleRepository();
  private readonly affectationRepository = new PostgresAffectationUtilisateurRepository();
  private readonly titulariatRepository = new PostgresAffectationTitulariatRepository();
  private readonly responsabiliteClassePedagogiqueAdapter = new ResponsabiliteClassePedagogiqueAdapter();
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
  private readonly autorisationConsultationStatistiquesAdapter: AutorisationConsultationStatistiquesAdapter;

  constructor(private readonly dependances?: DependancesAutorisationConduiteAdapter) {
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
      this.dependances?.consulterResponsabiliteClassePedagogique
        ? {
          consulterActiveParClasseEtAnnee: this.dependances.consulterResponsabiliteClassePedagogique,
        }
        : this.responsabiliteClassePedagogiqueAdapter,
    );
  }

  public async verifierEncodageConduite(params: {
    idUtilisateur: string;
    idOrganisation?: string;
    idEcole: string;
    idClassePedagogique: string;
    idAnneeScolaire: string;
  }): Promise<void> {
    const capacites = await this.securityCapacitesEffectivesService.calculerPourUtilisateur({
      idUtilisateur: params.idUtilisateur,
      idOrganisationActive: params.idOrganisation,
      idEcoleActive: params.idEcole,
      idClasse: params.idClassePedagogique,
      idAnneeScolaire: params.idAnneeScolaire,
    });

    if (capacites.permissions.includes('cotes.write') && capacites.estTitulaireEffectif) {
      await this.securityFacade.verifierAcces({
        idUtilisateur: params.idUtilisateur,
        permissionDemandee: 'cotes.write',
        idOrganisation: params.idOrganisation,
        idEcole: params.idEcole,
      });
      return;
    }

    const idSectionClasse = await this.dependances?.resoudreSectionClasse?.({
      idOrganisation: params.idOrganisation,
      idEcole: params.idEcole,
      idClassePedagogique: params.idClassePedagogique,
    }) ?? await this.resoudreSectionClasse({
      idOrganisation: params.idOrganisation,
      idEcole: params.idEcole,
      idClassePedagogique: params.idClassePedagogique,
    });

    if (idSectionClasse !== null) {
      const estDirecteurDiscipline = await this.estRoleActifDansPerimetre(
        params.idUtilisateur,
        params.idOrganisation,
        params.idEcole,
        ['DIRECTEUR_DISCIPLINE'],
        idSectionClasse,
      );

      if (estDirecteurDiscipline) {
        await this.securityFacade.verifierAcces({
          idUtilisateur: params.idUtilisateur,
          permissionDemandee: 'cotes.write',
          idOrganisation: params.idOrganisation,
          idEcole: params.idEcole,
          idSection: idSectionClasse,
        });
        return;
      }
    }

    throw new ApplicationException(
      "L'utilisateur demandeur n'est pas autorise a encoder la conduite pour cette classe.",
      'BULLETINS_CONDUITE_ACCES_REFUSE',
    );
  }

  public async fermer(): Promise<void> {
    await this.autorisationConsultationStatistiquesAdapter.fermer();
    await this.responsabiliteClassePedagogiqueAdapter.fermer();
  }

  private async estRoleActifDansPerimetre(
    idUtilisateur: string,
    idOrganisation: string | undefined,
    idEcole: string,
    codesRolesAutorises: readonly string[],
    idSectionAttendue?: string,
  ): Promise<boolean> {
    const affectations = await this.affectationRepository.listerActivesParUtilisateur(idUtilisateur);

    for (const affectation of affectations) {
      if (affectation.obtenirIdEcole() !== idEcole) {
        continue;
      }

      if (idOrganisation !== undefined && affectation.obtenirIdOrganisation() !== idOrganisation) {
        continue;
      }

      if (idSectionAttendue !== undefined && affectation.obtenirIdSection() !== idSectionAttendue) {
        continue;
      }

      const role = await this.roleRepository.trouverParId(affectation.obtenirIdRole());
      const codeRole = role?.obtenirCodeRole().obtenirValeur();

      if (codeRole !== undefined && codesRolesAutorises.includes(codeRole)) {
        return true;
      }
    }

    return false;
  }

  private async resoudreSectionClasse(params: {
    idOrganisation?: string;
    idEcole: string;
    idClassePedagogique: string;
  }): Promise<string | null> {
    return this.autorisationConsultationStatistiquesAdapter.resoudreSectionClassePedagogique(params);
  }
}
