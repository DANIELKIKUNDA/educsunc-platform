import type { AutorisationPerceptionPaiementPort } from '../../contexts/paiements-facturation/application/ports/AutorisationPerceptionPaiementPort';
import type { ParametresPaiementEcole } from '../../contexts/paiements-facturation/domain/aggregates/ParametresPaiementEcole';
import { ErreurDroitsInsuffisants } from '../../contexts/paiements-facturation/application/exceptions/ErreurDroitsInsuffisants';
import { TypeFrais } from '../../contexts/paiements-facturation/domain/value-objects/TypeFrais';
import { ScolariteElevesAdapter } from '../../contexts/paiements-facturation/infrastructure/adapters/ScolariteElevesAdapter';
import {
  PostgresDepotParametresPaiementEcole,
  creerInfrastructurePostgresPaiementsFacturation,
} from '../../contexts/paiements-facturation/infrastructure/persistence/postgres';
import { creerInfrastructurePostgresScolariteEleves } from '../../contexts/scolarite-eleves/infrastructure/persistence/postgres';
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
import { SectionClassePedagogiqueAdapter } from './SectionClassePedagogiqueAdapter';

type CodeRoleDelegue =
  | 'PREFET_ETUDES'
  | 'DIRECTEUR_PRIMAIRE'
  | 'DIRECTEUR_MATERNELLE';

interface DependancesAutorisationPerceptionPaiementAdapter {
  chargerParametresActifsParEcole?: (idEcole: string) => Promise<ParametresPaiementEcole | null>;
  consulterClasseActiveEleve?: (idEleve: string) => Promise<{
    idClassePedagogique: string;
    idEcole: string;
    idAnneeScolaire: string;
  } | null>;
  resoudreSectionClasse?: (params: {
    idOrganisation: string;
    idEcole: string;
    idClassePedagogique: string;
    idAnneeScolaire: string;
  }) => Promise<{
    idSectionScolaire: string;
    sectionCode: string;
    sectionLibelle: string;
  } | null>;
}

export class AutorisationPerceptionPaiementAdapter
  implements AutorisationPerceptionPaiementPort
{
  private readonly infrastructurePaiements = creerInfrastructurePostgresPaiementsFacturation();
  private readonly infrastructureScolarite = creerInfrastructurePostgresScolariteEleves();
  private readonly roleRepository = new PostgresRoleRepository();
  private readonly affectationRepository = new PostgresAffectationUtilisateurRepository();
  private readonly titulariatRepository = new PostgresAffectationTitulariatRepository();
  private readonly depotParametresPaiementEcole = new PostgresDepotParametresPaiementEcole(
    this.infrastructurePaiements.clientLecture,
    this.infrastructurePaiements.uniteDeTravail,
  );
  private readonly scolariteElevesAdapter = new ScolariteElevesAdapter(
    this.infrastructureScolarite.clientLecture,
  );
  private readonly sectionClassePedagogiqueAdapter = new SectionClassePedagogiqueAdapter();
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
    private readonly dependances?: DependancesAutorisationPerceptionPaiementAdapter,
  ) {}

  public async verifierPerceptionPaiement(params: {
    idUtilisateur: string;
    idOrganisation: string;
    idEcole: string;
    idEleve: string;
    typeFrais: TypeFrais;
  }): Promise<void> {
    if (await this.estRoleActifDansPerimetre(
      params.idUtilisateur,
      params.idOrganisation,
      params.idEcole,
      ['CAISSIER', 'ADMINISTRATEUR_ECOLE'],
    )) {
      await this.securityFacade.verifierAcces({
        idUtilisateur: params.idUtilisateur,
        permissionDemandee: 'paiements.write',
        idOrganisation: params.idOrganisation,
        idEcole: params.idEcole,
      });
      return;
    }

    if (params.typeFrais === TypeFrais.FRAIS_MINERVAL) {
      throw new ErreurDroitsInsuffisants(
        'Les frais minerval restent reserves au caissier ou a un administrateur ecole autorise.',
      );
    }

    const parametres = await this.chargerParametresActifsParEcole(params.idEcole);
    if (parametres === null) {
      throw new ErreurDroitsInsuffisants(
        "Aucun parametrage actif n'autorise une perception deleguee pour cette ecole.",
      );
    }

    const classeActive = await this.consulterClasseActiveEleve(params.idEleve);
    if (classeActive === null || classeActive.idEcole !== params.idEcole) {
      throw new ErreurDroitsInsuffisants(
        "Le perimetre pedagogique de l'eleve est introuvable pour cette perception.",
      );
    }

    const section = await this.resoudreSectionClasse({
      idOrganisation: params.idOrganisation,
      idEcole: params.idEcole,
      idClassePedagogique: classeActive.idClassePedagogique,
      idAnneeScolaire: classeActive.idAnneeScolaire,
    });
    if (section === null) {
      throw new ErreurDroitsInsuffisants(
        "La section scolaire de l'eleve est introuvable pour cette perception.",
      );
    }

    const roleDelegue = await this.determinerRoleDelegueAutorise({
      idUtilisateur: params.idUtilisateur,
      idOrganisation: params.idOrganisation,
      idEcole: params.idEcole,
      idSectionScolaire: section.idSectionScolaire,
      sectionCode: section.sectionCode,
    });

    if (roleDelegue === null) {
      throw new ErreurDroitsInsuffisants(
        "L'utilisateur demandeur n'est pas autorise a percevoir ce paiement dans ce perimetre.",
      );
    }

    if (!parametres.autorisePerceptionDelegueePour(params.typeFrais, roleDelegue)) {
      throw new ErreurDroitsInsuffisants(
        "Le parametrage de l'ecole n'autorise pas ce role a percevoir ce type de frais.",
      );
    }

    await this.securityFacade.verifierAcces({
      idUtilisateur: params.idUtilisateur,
      permissionDemandee: 'paiements.write',
      idOrganisation: params.idOrganisation,
      idEcole: params.idEcole,
      idSection: section.idSectionScolaire,
    });
  }

  public async fermer(): Promise<void> {
    await this.sectionClassePedagogiqueAdapter.fermer();
    await this.infrastructurePaiements.pool.end();
    await this.infrastructureScolarite.pool.end();
  }

  private async chargerParametresActifsParEcole(
    idEcole: string,
  ): Promise<ParametresPaiementEcole | null> {
    if (this.dependances?.chargerParametresActifsParEcole) {
      return this.dependances.chargerParametresActifsParEcole(idEcole);
    }

    return this.depotParametresPaiementEcole.trouverActifParEcole(idEcole);
  }

  private async consulterClasseActiveEleve(idEleve: string): Promise<{
    idClassePedagogique: string;
    idEcole: string;
    idAnneeScolaire: string;
  } | null> {
    if (this.dependances?.consulterClasseActiveEleve) {
      return this.dependances.consulterClasseActiveEleve(idEleve);
    }

    return this.scolariteElevesAdapter.consulterClasseActiveEleve(idEleve);
  }

  private async resoudreSectionClasse(params: {
    idOrganisation: string;
    idEcole: string;
    idClassePedagogique: string;
    idAnneeScolaire: string;
  }): Promise<{
    idSectionScolaire: string;
    sectionCode: string;
    sectionLibelle: string;
  } | null> {
    if (this.dependances?.resoudreSectionClasse) {
      return this.dependances.resoudreSectionClasse(params);
    }

    return this.sectionClassePedagogiqueAdapter.consulterSectionClasse(params);
  }

  private async determinerRoleDelegueAutorise(params: {
    idUtilisateur: string;
    idOrganisation: string;
    idEcole: string;
    idSectionScolaire: string;
    sectionCode: string;
  }): Promise<CodeRoleDelegue | null> {
    const codesRoles = await this.listerCodesRolesActifsDansPerimetre(
      params.idUtilisateur,
      params.idOrganisation,
      params.idEcole,
      params.idSectionScolaire,
    );

    if (params.sectionCode === 'SECONDAIRE' && codesRoles.includes('PREFET_ETUDES')) {
      return 'PREFET_ETUDES';
    }

    if (params.sectionCode === 'PRIMAIRE' && codesRoles.includes('DIRECTEUR_PRIMAIRE')) {
      return 'DIRECTEUR_PRIMAIRE';
    }

    if (params.sectionCode === 'MATERNELLE' && codesRoles.includes('DIRECTEUR_MATERNELLE')) {
      return 'DIRECTEUR_MATERNELLE';
    }

    return null;
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
