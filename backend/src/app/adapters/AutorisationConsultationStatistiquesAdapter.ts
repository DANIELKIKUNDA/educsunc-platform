import type { AutorisationConsultationStatistiquesPort } from '../../contexts/bulletins-evaluations/application/ports/out/AutorisationConsultationStatistiquesPort';
import { ApplicationException } from '../../contexts/bulletins-evaluations/application/exceptions/ApplicationException';
import {
  DepotClasseAcademiquePostgres,
  DepotClassePedagogiquePostgres,
  creerInfrastructurePostgresReferentielAcademique,
} from '../../contexts/referentiel-academique/infrastructure/persistence/postgres';
import { ContexteExecutionTenantReferentielAcademique } from '../../contexts/referentiel-academique/infrastructure/tenancy/ContexteExecutionTenantReferentielAcademique';
import { ClassePedagogiqueId } from '../../contexts/referentiel-academique/domain/value-objects/ClassePedagogiqueId';
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
import { ContexteTenant } from '../../shared/tenancy/TenantContext';
import { ResponsabiliteClassePedagogiqueAdapter } from './ResponsabiliteClassePedagogiqueAdapter';

interface DependancesAutorisationConsultationStatistiquesAdapter {
  resoudreSectionClasse?: (params: {
    idOrganisation?: string;
    idEcole: string;
    idClassePedagogique: string;
  }) => Promise<string | null>;
}

// Cet adaptateur relit shared/security pour verrouiller localement la consultation des statistiques pedagogiques.
export class AutorisationConsultationStatistiquesAdapter
  implements AutorisationConsultationStatistiquesPort
{
  private readonly roleRepository = new PostgresRoleRepository();
  private readonly affectationRepository = new PostgresAffectationUtilisateurRepository();
  private readonly titulariatRepository = new PostgresAffectationTitulariatRepository();
  private readonly responsabiliteClassePedagogiqueAdapter = new ResponsabiliteClassePedagogiqueAdapter();
  private readonly contexteExecutionTenant = new ContexteExecutionTenantReferentielAcademique();
  private readonly infrastructureReferentiel = creerInfrastructurePostgresReferentielAcademique(
    undefined,
    undefined,
    this.contexteExecutionTenant,
  );
  private readonly depotClassePedagogique = new DepotClassePedagogiquePostgres(
    this.infrastructureReferentiel.clientLecture,
    this.infrastructureReferentiel.uniteDeTravail,
    this.contexteExecutionTenant,
  );
  private readonly depotClasseAcademique = new DepotClasseAcademiquePostgres(
    this.infrastructureReferentiel.clientLecture,
    this.infrastructureReferentiel.uniteDeTravail,
    this.contexteExecutionTenant,
  );
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
  private readonly dependances: DependancesAutorisationConsultationStatistiquesAdapter;

  constructor(dependances?: Partial<DependancesAutorisationConsultationStatistiquesAdapter>) {
    this.dependances = {
      ...dependances,
    };
  }

  public async verifierConsultationStatistiquesClasse(params: {
    idUtilisateur: string;
    idOrganisation?: string;
    idEcole: string;
    idClassePedagogique: string;
    idAnneeScolaire: string;
  }): Promise<void> {
    const idSectionClasse = await this.resoudreSectionClasse(params);

    const estPorteurPerimetreGlobal = await this.estPorteurPerimetreGlobal(
      params.idUtilisateur,
      params.idOrganisation,
      params.idEcole,
    );

    if (estPorteurPerimetreGlobal) {
      await this.securityFacade.verifierAcces({
        idUtilisateur: params.idUtilisateur,
        permissionDemandee: 'bulletins.read',
        idOrganisation: params.idOrganisation,
        idEcole: params.idEcole,
      });
      return;
    }

    if (idSectionClasse !== null) {
      const estSuperviseurSection = await this.estSuperviseurPedagogiqueDeSection(
        params.idUtilisateur,
        params.idOrganisation,
        params.idEcole,
        idSectionClasse,
      );

      if (estSuperviseurSection) {
        await this.securityFacade.verifierAcces({
          idUtilisateur: params.idUtilisateur,
          permissionDemandee: 'bulletins.read',
          idOrganisation: params.idOrganisation,
          idEcole: params.idEcole,
          idSection: idSectionClasse,
        });
        return;
      }
    }

    const estEnseignant = await this.estRoleActifDansPerimetre(
      params.idUtilisateur,
      params.idOrganisation,
      params.idEcole,
      ['ENSEIGNANT'],
    );

    if (!estEnseignant) {
      throw new ApplicationException(
        "L'utilisateur demandeur n'est pas autorise a consulter ces statistiques de classe.",
        'BULLETINS_STATISTIQUES_CLASSE_ACCES_REFUSE',
      );
    }

    await this.securityFacade.verifierAcces({
      idUtilisateur: params.idUtilisateur,
      permissionDemandee: 'bulletins.read',
      idOrganisation: params.idOrganisation,
      idEcole: params.idEcole,
    });

    const titulariats = await this.titulariatRepository.listerActifsParUtilisateur(
      params.idUtilisateur,
    );
    const estTitulaireEffectif = titulariats.some((titulariat) =>
      titulariat.obtenirIdClasse() === params.idClassePedagogique
      && titulariat.obtenirIdAnneeScolaire() === params.idAnneeScolaire
      && titulariat.obtenirIdEcole() === params.idEcole,
    );

    if (!estTitulaireEffectif) {
      throw new ApplicationException(
        "L'utilisateur demandeur n'est pas autorise a consulter ces statistiques de classe.",
        'BULLETINS_STATISTIQUES_CLASSE_ACCES_REFUSE',
      );
    }
  }

  public async verifierConsultationStatistiquesEcole(params: {
    idUtilisateur: string;
    idOrganisation?: string;
    idEcole: string;
    idAnneeScolaire: string;
  }): Promise<void> {
    const estPorteurPerimetreGlobal = await this.estPorteurPerimetreGlobal(
      params.idUtilisateur,
      params.idOrganisation,
      params.idEcole,
    );

    if (!estPorteurPerimetreGlobal) {
      throw new ApplicationException(
        "L'utilisateur demandeur n'est pas autorise a consulter les statistiques globales de l'ecole.",
        'BULLETINS_STATISTIQUES_ECOLE_ACCES_REFUSE',
      );
    }

    await this.securityFacade.verifierAcces({
      idUtilisateur: params.idUtilisateur,
      permissionDemandee: 'bulletins.read',
      idOrganisation: params.idOrganisation,
      idEcole: params.idEcole,
    });
  }

  // Cette methode expose la resolution metier de section pour les workflows qui doivent appliquer un perimetre sectionnel.
  public async resoudreSectionClassePedagogique(params: {
    idOrganisation?: string;
    idEcole: string;
    idClassePedagogique: string;
  }): Promise<string | null> {
    return this.resoudreSectionClasse(params);
  }

  public async fermer(): Promise<void> {
    await this.responsabiliteClassePedagogiqueAdapter.fermer();
    await this.infrastructureReferentiel.pool.end();
  }

  private async estPorteurPerimetreGlobal(
    idUtilisateur: string,
    idOrganisation: string | undefined,
    idEcole: string,
  ): Promise<boolean> {
    return this.estRoleActifDansPerimetre(
      idUtilisateur,
      idOrganisation,
      idEcole,
      ['ADMINISTRATEUR_ECOLE', 'PROMOTEUR_ORGANISATION'],
    );
  }

  private async estSuperviseurPedagogiqueDeSection(
    idUtilisateur: string,
    idOrganisation: string | undefined,
    idEcole: string,
    idSection: string,
  ): Promise<boolean> {
    return this.estRoleActifDansPerimetre(
      idUtilisateur,
      idOrganisation,
      idEcole,
      [
        'PREFET_ETUDES',
        'DIRECTEUR_ETUDES',
        'DIRECTEUR_DISCIPLINE',
        'DIRECTEUR_PRIMAIRE',
        'DIRECTEUR_MATERNELLE',
      ],
      idSection,
    );
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
    if (this.dependances.resoudreSectionClasse) {
      return this.dependances.resoudreSectionClasse(params);
    }

    const contexteTenant = new ContexteTenant();
    contexteTenant.definirTenant(params.idEcole);

    if (params.idOrganisation) {
      contexteTenant.definirOrganisation(params.idOrganisation);
    }

    return this.contexteExecutionTenant.executerAvecContexte(contexteTenant, async () => {
      const classePedagogique = await this.depotClassePedagogique.trouverParId(
        new ClassePedagogiqueId(params.idClassePedagogique),
      );

      if (classePedagogique === null) {
        return null;
      }

      const classeAcademique = await this.depotClasseAcademique.trouverParId(
        classePedagogique.obtenirClasseAcademiqueId(),
      );

      return classeAcademique?.obtenirSectionScolaireId().obtenirValeur() ?? null;
    });
  }
}
