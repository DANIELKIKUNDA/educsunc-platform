import type { AutorisationAffectationClassePort } from '../../contexts/scolarite-eleves/application/ports';
import { ErreurAutorisation } from '../../contexts/scolarite-eleves/application/exceptions';
import {
  DepotClasseAcademiquePostgres,
  DepotClassePedagogiquePostgres,
  DepotSectionScolairePostgres,
  creerInfrastructurePostgresReferentielAcademique,
} from '../../contexts/referentiel-academique/infrastructure/persistence/postgres';
import { ContexteExecutionTenantReferentielAcademique } from '../../contexts/referentiel-academique/infrastructure/tenancy/ContexteExecutionTenantReferentielAcademique';
import { ClassePedagogiqueId } from '../../contexts/referentiel-academique/domain/value-objects/ClassePedagogiqueId';
import {
  creerInfrastructurePostgresScolariteEleves,
  PostgresAffectationDepot,
  PostgresInscriptionDepot,
} from '../../contexts/scolarite-eleves/infrastructure/persistence/postgres';
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

interface PerimetreInscriptionAffectation {
  idOrganisation: string;
  idEcole: string;
  idAnneeScolaire: string;
  idSectionScolaire?: string;
  sectionCode?: string;
  idClassePedagogique?: string;
}

interface PerimetreClasseAffectation {
  idEcole: string;
  idAnneeScolaire: string;
  idSectionScolaire: string;
  sectionCode: string;
}

interface DependancesAutorisationAffectationClasseAdapter {
  resoudreInscription?: (params: {
    idInscriptionScolaire: string;
  }) => Promise<PerimetreInscriptionAffectation | null>;
  resoudreClasse?: (params: {
    idOrganisation?: string;
    idEcole: string;
    idClassePedagogique: string;
  }) => Promise<PerimetreClasseAffectation | null>;
}

// Cet adaptateur reapplique shared/security pour les affectations de classes avec un perimetre reel.
export class AutorisationAffectationClasseAdapter
  implements AutorisationAffectationClassePort
{
  private readonly contexteExecutionTenant = new ContexteExecutionTenantReferentielAcademique();
  private readonly infrastructureScolarite = creerInfrastructurePostgresScolariteEleves();
  private readonly infrastructureReferentiel = creerInfrastructurePostgresReferentielAcademique(
    undefined,
    undefined,
    this.contexteExecutionTenant,
  );
  private readonly roleRepository = new PostgresRoleRepository();
  private readonly affectationRepository = new PostgresAffectationUtilisateurRepository();
  private readonly titulariatRepository = new PostgresAffectationTitulariatRepository();
  private readonly depotInscription = new PostgresInscriptionDepot(
    this.infrastructureScolarite.clientLecture,
    this.infrastructureScolarite.uniteDeTravail,
  );
  private readonly depotAffectation = new PostgresAffectationDepot(
    this.infrastructureScolarite.clientLecture,
    this.infrastructureScolarite.uniteDeTravail,
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
  private readonly depotSectionScolaire = new DepotSectionScolairePostgres(
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
  );

  constructor(
    private readonly dependances?: DependancesAutorisationAffectationClasseAdapter,
  ) {}

  public async verifierCreationAffectationClasse(params: {
    idUtilisateur: string;
    idOrganisation: string;
    idEcole: string;
    idInscriptionScolaire: string;
    idClassePedagogique: string;
  }): Promise<void> {
    await this.verifierMutationDansPerimetre({
      ...params,
      idClassePedagogiqueCible: params.idClassePedagogique,
    });
  }

  public async verifierChangementClasse(params: {
    idUtilisateur: string;
    idOrganisation: string;
    idEcole: string;
    idInscriptionScolaire: string;
    idNouvelleClassePedagogique: string;
  }): Promise<void> {
    await this.verifierMutationDansPerimetre({
      ...params,
      idClassePedagogiqueCible: params.idNouvelleClassePedagogique,
    });
  }

  public async verifierDesactivationAffectationClasse(params: {
    idUtilisateur: string;
    idOrganisation: string;
    idEcole: string;
    idInscriptionScolaire: string;
  }): Promise<void> {
    if (await this.estCaissierAutorise(params)) {
      await this.verifierPermissionCaisse(params.idUtilisateur, params.idOrganisation, params.idEcole, 'caisse.write');
      return;
    }

    const perimetre = await this.resoudrePerimetreInscriptionCourante({
      idInscriptionScolaire: params.idInscriptionScolaire,
    });

    await this.verifierGestionnairePedagogiqueDansPerimetre({
      idUtilisateur: params.idUtilisateur,
      idOrganisation: params.idOrganisation,
      idEcole: params.idEcole,
      perimetre,
      permissionDemandee: 'eleves.write',
    });
  }

  public async verifierConsultationAffectationClasse(params: {
    idUtilisateur: string;
    idOrganisation: string;
    idEcole: string;
    idInscriptionScolaire: string;
  }): Promise<void> {
    if (await this.estCaissierAutorise(params)) {
      await this.verifierPermissionCaisse(params.idUtilisateur, params.idOrganisation, params.idEcole, 'caisse.read');
      return;
    }

    const perimetre = await this.resoudrePerimetreInscriptionCourante({
      idInscriptionScolaire: params.idInscriptionScolaire,
    });

    await this.verifierGestionnairePedagogiqueDansPerimetre({
      idUtilisateur: params.idUtilisateur,
      idOrganisation: params.idOrganisation,
      idEcole: params.idEcole,
      perimetre,
      permissionDemandee: 'eleves.read',
    });
  }

  public async verifierConsultationClassePedagogique(params: {
    idUtilisateur: string;
    idOrganisation: string;
    idEcole: string;
    idClassePedagogique: string;
  }): Promise<void> {
    if (await this.estCaissierAutorise(params)) {
      await this.verifierPermissionCaisse(params.idUtilisateur, params.idOrganisation, params.idEcole, 'caisse.read');
      return;
    }

    const perimetreClasse = await this.resoudreClasse({
      idOrganisation: params.idOrganisation,
      idEcole: params.idEcole,
      idClassePedagogique: params.idClassePedagogique,
    });

    if (perimetreClasse === null) {
      throw new ErreurAutorisation(
        "Le perimetre pedagogique de la classe est introuvable pour cette consultation.",
      );
    }

    await this.verifierGestionnairePedagogiqueDansPerimetre({
      idUtilisateur: params.idUtilisateur,
      idOrganisation: params.idOrganisation,
      idEcole: params.idEcole,
      perimetre: {
        idOrganisation: params.idOrganisation,
        idEcole: perimetreClasse.idEcole,
        idAnneeScolaire: perimetreClasse.idAnneeScolaire,
        idClassePedagogique: params.idClassePedagogique,
        idSectionScolaire: perimetreClasse.idSectionScolaire,
        sectionCode: perimetreClasse.sectionCode,
      },
      permissionDemandee: 'eleves.read',
    });
  }

  public async fermer(): Promise<void> {
    await this.infrastructureScolarite.pool.end();
    await this.infrastructureReferentiel.pool.end();
  }

  private async verifierMutationDansPerimetre(params: {
    idUtilisateur: string;
    idOrganisation: string;
    idEcole: string;
    idInscriptionScolaire: string;
    idClassePedagogiqueCible: string;
  }): Promise<void> {
    if (await this.estCaissierAutorise(params)) {
      await this.verifierPermissionCaisse(params.idUtilisateur, params.idOrganisation, params.idEcole, 'caisse.write');
      return;
    }

    const perimetreInscription = await this.resoudrePerimetreInscription({
      idInscriptionScolaire: params.idInscriptionScolaire,
    });
    const perimetreClasse = await this.resoudreClasse({
      idOrganisation: params.idOrganisation,
      idEcole: params.idEcole,
      idClassePedagogique: params.idClassePedagogiqueCible,
    });

    if (
      perimetreInscription === null
      || perimetreClasse === null
      || perimetreInscription.idEcole !== perimetreClasse.idEcole
      || perimetreInscription.idAnneeScolaire !== perimetreClasse.idAnneeScolaire
    ) {
      throw new ErreurAutorisation(
        "Le perimetre pedagogique de l'affectation est incoherent pour cette mutation.",
      );
    }

    await this.verifierGestionnairePedagogiqueDansPerimetre({
      idUtilisateur: params.idUtilisateur,
      idOrganisation: params.idOrganisation,
      idEcole: params.idEcole,
      perimetre: {
        ...perimetreInscription,
        idSectionScolaire: perimetreClasse.idSectionScolaire,
        sectionCode: perimetreClasse.sectionCode,
        idClassePedagogique: params.idClassePedagogiqueCible,
      },
      permissionDemandee: 'eleves.write',
    });
  }

  private async verifierGestionnairePedagogiqueDansPerimetre(params: {
    idUtilisateur: string;
    idOrganisation: string;
    idEcole: string;
    perimetre: PerimetreInscriptionAffectation | null;
    permissionDemandee: 'eleves.read' | 'eleves.write';
  }): Promise<void> {
    if (
      params.perimetre === null
      || params.perimetre.idSectionScolaire === undefined
      || params.perimetre.sectionCode === undefined
      || params.perimetre.idEcole !== params.idEcole
      || params.perimetre.idOrganisation !== params.idOrganisation
    ) {
      throw new ErreurAutorisation(
        "Le perimetre pedagogique de l'affectation est introuvable pour cette operation.",
      );
    }

    const estAutorise = await this.estGestionnairePedagogiqueAutorise(
      params.idUtilisateur,
      params.idOrganisation,
      params.idEcole,
      params.perimetre.idSectionScolaire,
      params.perimetre.sectionCode,
    );

    if (!estAutorise) {
      throw new ErreurAutorisation(
        "L'utilisateur demandeur n'est pas autorise a gerer cette affectation de classe.",
      );
    }

    await this.securityFacade.verifierAcces({
      idUtilisateur: params.idUtilisateur,
      permissionDemandee: params.permissionDemandee,
      idOrganisation: params.idOrganisation,
      idEcole: params.idEcole,
      idSection: params.perimetre.idSectionScolaire,
    });
  }

  private async estCaissierAutorise(params: {
    idUtilisateur: string;
    idOrganisation: string;
    idEcole: string;
  }): Promise<boolean> {
    return this.estRoleActifDansPerimetre(
      params.idUtilisateur,
      params.idOrganisation,
      params.idEcole,
      ['CAISSIER'],
    );
  }

  private async verifierPermissionCaisse(
    idUtilisateur: string,
    idOrganisation: string,
    idEcole: string,
    permissionDemandee: 'caisse.read' | 'caisse.write',
  ): Promise<void> {
    await this.securityFacade.verifierAcces({
      idUtilisateur,
      permissionDemandee,
      idOrganisation,
      idEcole,
    });
  }

  private async resoudrePerimetreInscription(params: {
    idInscriptionScolaire: string;
  }): Promise<PerimetreInscriptionAffectation | null> {
    if (this.dependances?.resoudreInscription) {
      return this.dependances.resoudreInscription(params);
    }

    const inscription = await this.depotInscription.trouverParId(params.idInscriptionScolaire);

    if (inscription === null) {
      return null;
    }

    return {
      idOrganisation: inscription.obtenirIdOrganisation(),
      idEcole: inscription.obtenirIdEcole(),
      idAnneeScolaire: inscription.obtenirIdAnneeScolaire(),
    };
  }

  private async resoudrePerimetreInscriptionCourante(params: {
    idInscriptionScolaire: string;
  }): Promise<PerimetreInscriptionAffectation | null> {
    const inscription = await this.resoudrePerimetreInscription(params);

    if (inscription === null) {
      return null;
    }

    const affectation = await this.depotAffectation.trouverAffectationActiveParInscription(
      params.idInscriptionScolaire,
    );

    if (affectation === null) {
      return inscription;
    }

    const perimetreClasse = await this.resoudreClasse({
      idOrganisation: inscription.idOrganisation,
      idEcole: inscription.idEcole,
      idClassePedagogique: affectation.obtenirIdClassePedagogique(),
    });

    if (perimetreClasse === null) {
      return inscription;
    }

    return {
      ...inscription,
      idClassePedagogique: affectation.obtenirIdClassePedagogique(),
      idSectionScolaire: perimetreClasse.idSectionScolaire,
      sectionCode: perimetreClasse.sectionCode,
    };
  }

  private async resoudreClasse(params: {
    idOrganisation?: string;
    idEcole: string;
    idClassePedagogique: string;
  }): Promise<PerimetreClasseAffectation | null> {
    if (this.dependances?.resoudreClasse) {
      return this.dependances.resoudreClasse(params);
    }

    const contexteTenant = new ContexteTenant();
    contexteTenant.definirTenant(params.idEcole);

    if (params.idOrganisation) {
      contexteTenant.definirOrganisation(params.idOrganisation);
    }

    return this.contexteExecutionTenant.executerAvecContexte(contexteTenant, async () => {
      const classe = await this.depotClassePedagogique.trouverParId(
        new ClassePedagogiqueId(params.idClassePedagogique),
      );

      if (classe === null) {
        return null;
      }

      const classeAcademique = await this.depotClasseAcademique.trouverParId(
        classe.obtenirClasseAcademiqueId(),
      );

      if (classeAcademique === null) {
        return null;
      }

      const section = await this.depotSectionScolaire.trouverParId(
        classeAcademique.obtenirSectionScolaireId(),
      );

      if (section === null) {
        return null;
      }

      return {
        idEcole: classe.obtenirEcoleId().obtenirValeur(),
        idAnneeScolaire: classe.obtenirAnneeScolaireId().obtenirValeur(),
        idSectionScolaire: section.obtenirId().obtenirValeur(),
        sectionCode: section.obtenirCode(),
      };
    });
  }

  private async estGestionnairePedagogiqueAutorise(
    idUtilisateur: string,
    idOrganisation: string,
    idEcole: string,
    idSectionScolaire: string,
    sectionCode: string,
  ): Promise<boolean> {
    const codesRoles = await this.listerCodesRolesActifsDansPerimetre(
      idUtilisateur,
      idOrganisation,
      idEcole,
      idSectionScolaire,
    );

    if (
      (codesRoles.includes('PREFET_ETUDES') || codesRoles.includes('DIRECTEUR_ETUDES'))
      && sectionCode === 'SECONDAIRE'
    ) {
      return true;
    }

    if (codesRoles.includes('DIRECTEUR_PRIMAIRE') && sectionCode === 'PRIMAIRE') {
      return true;
    }

    if (codesRoles.includes('DIRECTEUR_MATERNELLE') && sectionCode === 'MATERNELLE') {
      return true;
    }

    return false;
  }

  private async estRoleActifDansPerimetre(
    idUtilisateur: string,
    idOrganisation: string,
    idEcole: string,
    codesRolesAutorises: readonly string[],
    idSectionAttendue?: string,
  ): Promise<boolean> {
    const codesRoles = await this.listerCodesRolesActifsDansPerimetre(
      idUtilisateur,
      idOrganisation,
      idEcole,
      idSectionAttendue,
    );

    return codesRoles.some((codeRole) => codesRolesAutorises.includes(codeRole));
  }

  private async listerCodesRolesActifsDansPerimetre(
    idUtilisateur: string,
    idOrganisation: string,
    idEcole: string,
    idSectionAttendue?: string,
  ): Promise<string[]> {
    const affectations = await this.affectationRepository.listerActivesParUtilisateur(idUtilisateur);
    const codesRoles: string[] = [];

    for (const affectation of affectations) {
      if (affectation.obtenirIdOrganisation() !== idOrganisation) {
        continue;
      }

      if (affectation.obtenirIdEcole() !== idEcole) {
        continue;
      }

      if (
        idSectionAttendue !== undefined
        && affectation.obtenirIdSection() !== idSectionAttendue
      ) {
        continue;
      }

      const role = await this.roleRepository.trouverParId(affectation.obtenirIdRole());
      const codeRole = role?.obtenirCodeRole().obtenirValeur();

      if (codeRole !== undefined) {
        codesRoles.push(codeRole);
      }
    }

    return codesRoles;
  }
}
