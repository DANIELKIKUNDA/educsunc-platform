import type { AutorisationParcoursElevePort } from '../../contexts/scolarite-eleves/application/ports';
import { ErreurAutorisation } from '../../contexts/scolarite-eleves/application/exceptions';
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
import { SectionClassePedagogiqueAdapter } from './SectionClassePedagogiqueAdapter';

interface PerimetreParcoursEleve {
  idOrganisation: string;
  idEcole: string;
  idAnneeScolaire: string;
  idSectionScolaire?: string;
  sectionCode?: string;
}

interface DependancesAutorisationParcoursEleveAdapter {
  resoudrePerimetreEleve?: (params: {
    idEleve: string;
  }) => Promise<PerimetreParcoursEleve | null>;
}

// Cet adaptateur reapplique shared/security pour la consultation et la reconstruction du parcours eleve.
export class AutorisationParcoursEleveAdapter implements AutorisationParcoursElevePort {
  private readonly infrastructure = creerInfrastructurePostgresScolariteEleves();
  private readonly roleRepository = new PostgresRoleRepository();
  private readonly affectationRepository = new PostgresAffectationUtilisateurRepository();
  private readonly titulariatRepository = new PostgresAffectationTitulariatRepository();
  private readonly depotInscription = new PostgresInscriptionDepot(
    this.infrastructure.clientLecture,
    this.infrastructure.uniteDeTravail,
  );
  private readonly depotAffectation = new PostgresAffectationDepot(
    this.infrastructure.clientLecture,
    this.infrastructure.uniteDeTravail,
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

  constructor(private readonly dependances?: DependancesAutorisationParcoursEleveAdapter) {}

  public async verifierConsultationParcoursEleve(params: {
    idUtilisateur: string;
    idOrganisation: string;
    idEcole: string;
    idEleve: string;
  }): Promise<void> {
    await this.verifierAccesParEleve({
      ...params,
      permissionDemandee: 'eleves.read',
    });
  }

  public async verifierReconstructionParcoursEleve(params: {
    idUtilisateur: string;
    idOrganisation: string;
    idEcole: string;
    idEleve: string;
  }): Promise<void> {
    await this.verifierAccesParEleve({
      ...params,
      permissionDemandee: 'eleves.write',
    });
  }

  public async listerSectionsLectureAutorisees(params: {
    idUtilisateur: string;
    idOrganisation: string;
    idEcole: string;
  }): Promise<string[]> {
    const affectations = await this.affectationRepository.listerActivesParUtilisateur(params.idUtilisateur);
    const sections = new Set<string>();

    for (const affectation of affectations) {
      if (
        affectation.obtenirIdOrganisation() !== params.idOrganisation
        || affectation.obtenirIdEcole() !== params.idEcole
      ) {
        continue;
      }

      const idSection = affectation.obtenirIdSection();
      if (idSection === undefined) {
        continue;
      }

      const role = await this.roleRepository.trouverParId(affectation.obtenirIdRole());
      const codeRole = role?.obtenirCodeRole().obtenirValeur();

      if (!this.estRolePedagogiqueSectionnel(codeRole)) {
        continue;
      }

      await this.securityFacade.verifierAcces({
        idUtilisateur: params.idUtilisateur,
        permissionDemandee: 'eleves.read',
        idOrganisation: params.idOrganisation,
        idEcole: params.idEcole,
        idSection,
      });

      sections.add(idSection);
    }

    if (sections.size === 0) {
      throw new ErreurAutorisation(
        "L'utilisateur demandeur n'est pas autorise a consulter le parcours scolaire dans cette ecole.",
      );
    }

    return [...sections];
  }

  public async fermer(): Promise<void> {
    await this.sectionClassePedagogiqueAdapter.fermer();
    await this.infrastructure.pool.end();
  }

  private async verifierAccesParEleve(params: {
    idUtilisateur: string;
    idOrganisation: string;
    idEcole: string;
    idEleve: string;
    permissionDemandee: 'eleves.read' | 'eleves.write';
  }): Promise<void> {
    const perimetre = await this.resoudrePerimetreEleve({ idEleve: params.idEleve });

    if (
      perimetre === null
      || perimetre.idSectionScolaire === undefined
      || perimetre.sectionCode === undefined
    ) {
      throw new ErreurAutorisation(
        "Le perimetre pedagogique de l'eleve est introuvable pour cette consultation de parcours.",
      );
    }

    const estAutorise = await this.estGestionnaireSectionAutorise(
      params.idUtilisateur,
      params.idOrganisation,
      params.idEcole,
      perimetre.idSectionScolaire,
      perimetre.sectionCode,
    );

    if (!estAutorise) {
      throw new ErreurAutorisation(
        "L'utilisateur demandeur n'est pas autorise a consulter ce parcours scolaire.",
      );
    }

    await this.securityFacade.verifierAcces({
      idUtilisateur: params.idUtilisateur,
      permissionDemandee: params.permissionDemandee,
      idOrganisation: params.idOrganisation,
      idEcole: params.idEcole,
      idSection: perimetre.idSectionScolaire,
    });
  }

  private async resoudrePerimetreEleve(params: {
    idEleve: string;
  }): Promise<PerimetreParcoursEleve | null> {
    if (this.dependances?.resoudrePerimetreEleve) {
      return this.dependances.resoudrePerimetreEleve(params);
    }

    const inscription = await this.depotInscription.trouverDerniereInscriptionActiveParEleve(
      params.idEleve,
    );

    if (inscription === null) {
      return null;
    }

    const affectation = await this.depotAffectation.trouverAffectationActiveParInscription(
      inscription.obtenirId(),
    );

    if (affectation === null) {
      return {
        idOrganisation: inscription.obtenirIdOrganisation(),
        idEcole: inscription.obtenirIdEcole(),
        idAnneeScolaire: inscription.obtenirIdAnneeScolaire(),
      };
    }

    const section = await this.sectionClassePedagogiqueAdapter.consulterSectionClasse({
      idOrganisation: inscription.obtenirIdOrganisation(),
      idEcole: inscription.obtenirIdEcole(),
      idClassePedagogique: affectation.obtenirIdClassePedagogique(),
      idAnneeScolaire: inscription.obtenirIdAnneeScolaire(),
    });

    return {
      idOrganisation: inscription.obtenirIdOrganisation(),
      idEcole: inscription.obtenirIdEcole(),
      idAnneeScolaire: inscription.obtenirIdAnneeScolaire(),
      idSectionScolaire: section?.idSectionScolaire,
      sectionCode: section?.sectionCode,
    };
  }

  private async estGestionnaireSectionAutorise(
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

  private estRolePedagogiqueSectionnel(codeRole: string | undefined): boolean {
    return [
      'PREFET_ETUDES',
      'DIRECTEUR_ETUDES',
      'DIRECTEUR_PRIMAIRE',
      'DIRECTEUR_MATERNELLE',
    ].includes(codeRole ?? '');
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
      if (affectation.obtenirIdEcole() !== idEcole) {
        continue;
      }

      if (affectation.obtenirIdOrganisation() !== idOrganisation) {
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
