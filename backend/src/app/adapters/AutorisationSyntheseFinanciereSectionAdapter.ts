import type { AutorisationSyntheseFinanciereSectionPort } from '../../contexts/paiements-facturation/application/ports/AutorisationSyntheseFinanciereSectionPort';
import type { ParametresPaiementEcole } from '../../contexts/paiements-facturation/domain/aggregates/ParametresPaiementEcole';
import type { RoleConsultationHistoriquePaiementsDeleguee } from '../../contexts/paiements-facturation/application/dto/input/ParametresPaiementEntreeDTO';
import { ErreurDroitsInsuffisants } from '../../contexts/paiements-facturation/application/exceptions/ErreurDroitsInsuffisants';
import {
  PostgresDepotParametresPaiementEcole,
  creerInfrastructurePostgresPaiementsFacturation,
} from '../../contexts/paiements-facturation/infrastructure/persistence/postgres';
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

export interface DependancesAutorisationSyntheseFinanciereSectionAdapter {
  chargerParametresActifsParEcole?: (idEcole: string) => Promise<ParametresPaiementEcole | null>;
}

export class AutorisationSyntheseFinanciereSectionAdapter
  implements AutorisationSyntheseFinanciereSectionPort
{
  private readonly infrastructurePaiements = creerInfrastructurePostgresPaiementsFacturation();
  private readonly roleRepository = new PostgresRoleRepository();
  private readonly affectationRepository = new PostgresAffectationUtilisateurRepository();
  private readonly titulariatRepository = new PostgresAffectationTitulariatRepository();
  private readonly depotParametresPaiementEcole = new PostgresDepotParametresPaiementEcole(
    this.infrastructurePaiements.clientLecture,
    this.infrastructurePaiements.uniteDeTravail,
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
    private readonly dependances?: DependancesAutorisationSyntheseFinanciereSectionAdapter,
  ) {}

  public async verifierConsultationSyntheseFinanciereSection(params: {
    idUtilisateur: string;
    idOrganisation: string;
    idEcole: string;
    idSectionScolaire: string;
  }): Promise<void> {
    if (await this.estRoleActifDansPerimetre(
      params.idUtilisateur,
      params.idOrganisation,
      params.idEcole,
      ['CAISSIER', 'ADMINISTRATEUR_ECOLE'],
    )) {
      await this.securityFacade.verifierAcces({
        idUtilisateur: params.idUtilisateur,
        permissionDemandee: 'paiements.read',
        idOrganisation: params.idOrganisation,
        idEcole: params.idEcole,
      });
      return;
    }

    if (await this.estRoleActifDansOrganisation(
      params.idUtilisateur,
      params.idOrganisation,
      ['GESTIONNAIRE_ORGANISATION', 'PROMOTEUR_ORGANISATION'],
    )) {
      await this.securityFacade.verifierAcces({
        idUtilisateur: params.idUtilisateur,
        permissionDemandee: 'paiements.read',
        idOrganisation: params.idOrganisation,
      });
      return;
    }

    const parametres = await this.chargerParametresActifsParEcole(params.idEcole);
    if (parametres === null) {
      throw new ErreurDroitsInsuffisants(
        "Aucun parametrage actif n'autorise une lecture sectionnelle financiere pour cette ecole.",
      );
    }

    const affectations = await this.affectationRepository.listerActivesParUtilisateur(params.idUtilisateur);
    for (const affectation of affectations) {
      if (affectation.obtenirIdOrganisation() !== params.idOrganisation) continue;
      if (affectation.obtenirIdEcole() !== params.idEcole) continue;
      if (affectation.obtenirIdSection() !== params.idSectionScolaire) continue;

      const role = await this.roleRepository.trouverParId(affectation.obtenirIdRole());
      const codeRole = role?.obtenirCodeRole().obtenirValeur();
      if (
        codeRole === undefined
        || !this.estRolePedagogiqueSectionnel(codeRole)
        || !parametres.autoriseConsultationHistoriquePaiementsPour(
          codeRole as RoleConsultationHistoriquePaiementsDeleguee,
        )
      ) {
        continue;
      }

      await this.securityFacade.verifierAcces({
        idUtilisateur: params.idUtilisateur,
        permissionDemandee: 'paiements.read',
        idOrganisation: params.idOrganisation,
        idEcole: params.idEcole,
        idSection: params.idSectionScolaire,
      });
      return;
    }

    throw new ErreurDroitsInsuffisants(
      "L'utilisateur demandeur n'est pas autorise a consulter cette synthese financiere de section dans ce perimetre.",
    );
  }

  private estRolePedagogiqueSectionnel(codeRole: string): boolean {
    return [
      'PREFET_ETUDES',
      'DIRECTEUR_PRIMAIRE',
      'DIRECTEUR_MATERNELLE',
    ].includes(codeRole);
  }

  private async chargerParametresActifsParEcole(idEcole: string): Promise<ParametresPaiementEcole | null> {
    if (this.dependances?.chargerParametresActifsParEcole) {
      return this.dependances.chargerParametresActifsParEcole(idEcole);
    }
    return this.depotParametresPaiementEcole.trouverActifParEcole(idEcole);
  }

  private async estRoleActifDansPerimetre(
    idUtilisateur: string,
    idOrganisation: string,
    idEcole: string,
    codesRolesAutorises: readonly string[],
  ): Promise<boolean> {
    const affectations = await this.affectationRepository.listerActivesParUtilisateur(idUtilisateur);
    for (const affectation of affectations) {
      if (affectation.obtenirIdOrganisation() !== idOrganisation) continue;
      if (affectation.obtenirIdEcole() !== idEcole) continue;
      const role = await this.roleRepository.trouverParId(affectation.obtenirIdRole());
      const codeRole = role?.obtenirCodeRole().obtenirValeur();
      if (codeRole !== undefined && codesRolesAutorises.includes(codeRole)) {
        return true;
      }
    }
    return false;
  }

  private async estRoleActifDansOrganisation(
    idUtilisateur: string,
    idOrganisation: string,
    codesRolesAutorises: readonly string[],
  ): Promise<boolean> {
    const affectations = await this.affectationRepository.listerActivesParUtilisateur(idUtilisateur);
    for (const affectation of affectations) {
      if (affectation.obtenirIdOrganisation() !== idOrganisation) continue;
      const role = await this.roleRepository.trouverParId(affectation.obtenirIdRole());
      const codeRole = role?.obtenirCodeRole().obtenirValeur();
      if (codeRole !== undefined && codesRolesAutorises.includes(codeRole)) {
        return true;
      }
    }
    return false;
  }
}
