import type { AutorisationCycleVieElevePort } from '../../contexts/scolarite-eleves/application/ports';
import { ErreurAutorisation } from '../../contexts/scolarite-eleves/application/exceptions';
import type { ResolutionPerimetreCycleVieEleve } from '../../contexts/scolarite-eleves/application/services/ResolutionPerimetreCycleVieEleve';
import { StatutEleve } from '../../contexts/scolarite-eleves/domain/value-objects/StatutEleve';
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

interface DependancesAutorisationCycleVieEleveAdapter {
  resoudrePerimetreEleve?: (params: {
    idEleve: string;
  }) => Promise<ResolutionPerimetreCycleVieEleve | null>;
}

// Cet adaptateur reapplique shared/security pour les mutations de statut scolaire d'un eleve.
export class AutorisationCycleVieEleveAdapter implements AutorisationCycleVieElevePort {
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

  constructor(private readonly dependances?: DependancesAutorisationCycleVieEleveAdapter) {}

  public async verifierMutationStatutEleve(params: {
    idUtilisateur: string;
    idOrganisation: string;
    idEcole: string;
    idEleve: string;
    nouveauStatut: StatutEleve;
  }): Promise<void> {
    if (this.estActionCaissier(params.nouveauStatut)) {
      const estCaissier = await this.estRoleActifDansPerimetre(
        params.idUtilisateur,
        params.idOrganisation,
        params.idEcole,
        ['CAISSIER'],
      );

      if (estCaissier) {
        await this.securityFacade.verifierAcces({
          idUtilisateur: params.idUtilisateur,
          permissionDemandee: 'caisse.write',
          idOrganisation: params.idOrganisation,
          idEcole: params.idEcole,
        });
        return;
      }
    }

    const perimetreEleve = await this.resoudrePerimetreEleve({ idEleve: params.idEleve });

    if (perimetreEleve?.idSectionScolaire) {
      if (await this.estGestionnaireSectionAutorise(params, perimetreEleve)) {
        await this.securityFacade.verifierAcces({
          idUtilisateur: params.idUtilisateur,
          permissionDemandee: 'eleves.write',
          idOrganisation: params.idOrganisation,
          idEcole: params.idEcole,
          idSection: perimetreEleve.idSectionScolaire,
        });
        return;
      }

      if (
        params.nouveauStatut === StatutEleve.SUSPENDU
        && await this.estDirecteurDisciplineAutorise(params, perimetreEleve)
      ) {
        await this.securityFacade.verifierAcces({
          idUtilisateur: params.idUtilisateur,
          permissionDemandee: 'eleves.write',
          idOrganisation: params.idOrganisation,
          idEcole: params.idEcole,
          idSection: perimetreEleve.idSectionScolaire,
        });
        return;
      }
    }

    throw new ErreurAutorisation(
      "L'utilisateur demandeur n'est pas autorise a modifier le statut scolaire de cet eleve.",
    );
  }

  public async fermer(): Promise<void> {
    await this.sectionClassePedagogiqueAdapter.fermer();
    await this.infrastructure.pool.end();
  }

  private async resoudrePerimetreEleve(params: {
    idEleve: string;
  }): Promise<ResolutionPerimetreCycleVieEleve | null> {
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
        idInscriptionScolaire: inscription.obtenirId(),
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
      idInscriptionScolaire: inscription.obtenirId(),
      idAnneeScolaire: inscription.obtenirIdAnneeScolaire(),
      idClassePedagogique: affectation.obtenirIdClassePedagogique(),
      idSectionScolaire: section?.idSectionScolaire,
      sectionCode: section?.sectionCode,
      sectionLibelle: section?.sectionLibelle,
    };
  }

  private async estGestionnaireSectionAutorise(
    params: {
      idUtilisateur: string;
      idOrganisation: string;
      idEcole: string;
      nouveauStatut: StatutEleve;
    },
    perimetreEleve: ResolutionPerimetreCycleVieEleve,
  ): Promise<boolean> {
    if (!perimetreEleve.idSectionScolaire) {
      return false;
    }

    const roles = await this.listerCodesRolesActifsDansPerimetre(
      params.idUtilisateur,
      params.idOrganisation,
      params.idEcole,
      perimetreEleve.idSectionScolaire,
    );

    if (
      roles.includes('DIRECTEUR_PRIMAIRE')
      && perimetreEleve.sectionCode === 'PRIMAIRE'
    ) {
      return true;
    }

    if (
      roles.includes('DIRECTEUR_MATERNELLE')
      && perimetreEleve.sectionCode === 'MATERNELLE'
    ) {
      return true;
    }

    if (
      (roles.includes('PREFET_ETUDES') || roles.includes('DIRECTEUR_ETUDES'))
      && perimetreEleve.sectionCode === 'SECONDAIRE'
    ) {
      return true;
    }

    return false;
  }

  private async estDirecteurDisciplineAutorise(
    params: {
      idUtilisateur: string;
      idOrganisation: string;
      idEcole: string;
    },
    perimetreEleve: ResolutionPerimetreCycleVieEleve,
  ): Promise<boolean> {
    if (
      perimetreEleve.idSectionScolaire === undefined
      || perimetreEleve.sectionCode !== 'SECONDAIRE'
    ) {
      return false;
    }

    return this.estRoleActifDansPerimetre(
      params.idUtilisateur,
      params.idOrganisation,
      params.idEcole,
      ['DIRECTEUR_DISCIPLINE'],
      perimetreEleve.idSectionScolaire,
    );
  }

  private estActionCaissier(nouveauStatut: StatutEleve): boolean {
    return [
      StatutEleve.ABANDONNE,
      StatutEleve.TRANSFERE,
      StatutEleve.ACTIF,
      StatutEleve.DECEDE,
    ].includes(nouveauStatut);
  }

  private async estRoleActifDansPerimetre(
    idUtilisateur: string,
    idOrganisation: string,
    idEcole: string,
    codesRolesAutorises: readonly string[],
    idSectionAttendue?: string,
  ): Promise<boolean> {
    const roles = await this.listerCodesRolesActifsDansPerimetre(
      idUtilisateur,
      idOrganisation,
      idEcole,
      idSectionAttendue,
    );

    return roles.some((role) => codesRolesAutorises.includes(role));
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
