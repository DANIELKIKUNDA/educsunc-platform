import { DecisionAutorisationMapper } from '../mappers';
import type {
  DecisionAutorisationOutput,
  VerificationPermissionOutput,
  VerificationScopeOutput,
} from '../dto/output';
import type {
  VerifierAccesInput,
  VerifierPermissionInput,
  VerifierRestrictionInput,
  VerifierScopeInput,
} from '../dto/input';
import type {
  AffectationTitulariatRepositoryPort,
  AffectationUtilisateurRepositoryPort,
  AuditSecurityPort,
  PermissionCachePort,
  ResponsabiliteClassePedagogiquePort,
  RoleRepositoryPort,
} from '../ports';
import {
  CodeRestrictionMetier,
  MoteurAutorisation,
  MoteurRestrictionsMetier,
  MoteurScope,
  MoteurCapacitesEffectives,
  PermissionRole,
  PermissionSecurite,
  PermissionRefusee,
  RestrictionRole,
} from '../../../security/domain';
import {
  ErreurAccesRefuse,
  ErreurVerificationPermission,
  ErreurVerificationRestriction,
  ErreurVerificationScope,
} from '../exceptions';
import { SecurityCapacitesEffectivesService } from './SecurityCapacitesEffectivesService';

// Cette facade est le point d'entree principal consomme par les autres BC.
export class SecurityFacade {
  private readonly securityCapacitesEffectivesService: SecurityCapacitesEffectivesService;

  constructor(
    private readonly roleRepositoryPort: RoleRepositoryPort,
    private readonly affectationUtilisateurRepositoryPort: AffectationUtilisateurRepositoryPort,
    private readonly affectationTitulariatRepositoryPort: AffectationTitulariatRepositoryPort,
    private readonly permissionCachePort: PermissionCachePort,
    private readonly moteurAutorisation: MoteurAutorisation,
    private readonly moteurScope: MoteurScope,
    private readonly moteurRestrictionsMetier: MoteurRestrictionsMetier,
    private readonly moteurCapacitesEffectives: MoteurCapacitesEffectives,
    private readonly auditSecurityPort?: AuditSecurityPort,
    private readonly responsabiliteClassePedagogiquePort?: ResponsabiliteClassePedagogiquePort,
  ) {
    this.securityCapacitesEffectivesService = new SecurityCapacitesEffectivesService(
      this.roleRepositoryPort,
      this.affectationUtilisateurRepositoryPort,
      this.affectationTitulariatRepositoryPort,
      this.moteurCapacitesEffectives,
      this.responsabiliteClassePedagogiquePort,
    );
  }

  public async verifierPermission(input: VerifierPermissionInput): Promise<VerificationPermissionOutput> {
    try {
      const permissions = await this.permissionCachePort.obtenirPermissions(input.idUtilisateur);
      const autorise = permissions
        ? permissions.includes(input.permissionDemandee)
        : (await this.securityCapacitesEffectivesService.calculerPourUtilisateur({
            idUtilisateur: input.idUtilisateur,
            idOrganisationActive: input.idOrganisation,
            idEcoleActive: input.idEcole,
            idClasse: input.idClasse,
            idAnneeScolaire: input.idAnneeScolaire,
          })).permissions.includes(input.permissionDemandee);

      await this.auditSecurityPort?.journaliser({
        action: autorise ? 'SECURITY_PERMISSION_GRANTED' : 'SECURITY_PERMISSION_DENIED',
        idUtilisateur: input.idUtilisateur,
        succes: autorise,
        details: {
          permissionDemandee: input.permissionDemandee,
        },
      });

      return { autorise, permissionDemandee: input.permissionDemandee };
    } catch (error) {
      await this.auditSecurityPort?.journaliser({
        action: 'SECURITY_INCIDENT_DETECTED',
        idUtilisateur: input.idUtilisateur,
        succes: false,
        details: {
          permissionDemandee: input.permissionDemandee,
          erreur: error instanceof Error ? error.message : 'UNKNOWN',
        },
      });
      throw new ErreurVerificationPermission(error instanceof Error ? error.message : undefined);
    }
  }

  public async verifierScope(input: VerifierScopeInput): Promise<VerificationScopeOutput> {
    try {
      const affectations = await this.affectationUtilisateurRepositoryPort.listerActivesParUtilisateur(
        input.idUtilisateur,
      );
      const organisationsAutorisees = affectations
        .flatMap((affectation) => [
          affectation.obtenirIdOrganisation(),
          ...affectation.obtenirScopes()
            .filter((scope) => scope.obtenirTypeScope().obtenirValeur() === 'ORGANISATION')
            .map((scope) => scope.obtenirValeurScope()),
        ])
        .filter((valeur): valeur is string => Boolean(valeur));
      const ecolesAutorisees = affectations
        .flatMap((affectation) => [
          affectation.obtenirIdEcole(),
          ...affectation.obtenirScopes()
            .filter((scope) => scope.obtenirTypeScope().obtenirValeur() === 'ECOLE')
            .map((scope) => scope.obtenirValeurScope()),
        ])
        .filter((valeur): valeur is string => Boolean(valeur));
      const sectionsAutorisees = affectations
        .flatMap((affectation) => [
          affectation.obtenirIdSection(),
          ...affectation.obtenirScopes()
            .filter((scope) => scope.obtenirTypeScope().obtenirValeur() === 'SECTION')
            .map((scope) => scope.obtenirValeurScope()),
        ])
        .filter((valeur): valeur is string => Boolean(valeur));
      const scopePlateforme = affectations.some((affectation) =>
        affectation.obtenirScopes().some(
          (scope) => scope.obtenirTypeScope().obtenirValeur() === 'PLATEFORME',
        ),
      );

      // Une portee Plateforme couvre les organisations et ecoles, sans accorder
      // les permissions metier qui restent verifiees independamment.
      if (!scopePlateforme) {
        this.moteurScope.verifierOrganisation(organisationsAutorisees, input.idOrganisation);
        this.moteurScope.verifierEcole(ecolesAutorisees, input.idEcole);
        this.moteurScope.verifierSection(sectionsAutorisees, input.idSection);
      }

      await this.auditSecurityPort?.journaliser({
        action: 'SECURITY_SCOPE_GRANTED',
        idUtilisateur: input.idUtilisateur,
        succes: true,
        details: {
          idOrganisation: input.idOrganisation,
          idEcole: input.idEcole,
          idSection: input.idSection,
          scopePlateforme,
          scope: [input.idOrganisation, input.idEcole, input.idSection].filter(Boolean).join(':'),
        },
      });

      return {
        scopeValide: true,
        idOrganisation: input.idOrganisation,
        idEcole: input.idEcole,
        idSection: input.idSection,
      };
    } catch (error) {
      await this.auditSecurityPort?.journaliser({
        action: 'SECURITY_SCOPE_DENIED',
        idUtilisateur: input.idUtilisateur,
        succes: false,
        details: {
          idOrganisation: input.idOrganisation,
          idEcole: input.idEcole,
          idSection: input.idSection,
          erreur: error instanceof Error ? error.message : 'UNKNOWN',
        },
      });
      throw new ErreurVerificationScope(error instanceof Error ? error.message : undefined);
    }
  }

  public async verifierRestriction(input: VerifierRestrictionInput): Promise<boolean> {
    try {
      const restrictions = await this.listerRestrictionsUtilisateur(input.idUtilisateur);
      const restrictionDemandee = restrictions.some(
        (restriction) =>
          restriction.obtenirCodeRestriction().obtenirValeur() === input.codeRestriction,
      );
      if (input.codeRestriction === 'INTERDICTION_CAISSE') {
        this.moteurRestrictionsMetier.verifierCaisse(restrictions);
      }
      if (input.codeRestriction === 'INTERDICTION_BULLETINS') {
        this.moteurRestrictionsMetier.verifierBulletins(restrictions);
      }

      if (restrictionDemandee) {
        await this.auditSecurityPort?.journaliser({
          action: 'SECURITY_RESTRICTION_TRIGGERED',
          idUtilisateur: input.idUtilisateur,
          succes: false,
          details: {
            codeRestriction: input.codeRestriction,
          },
        });
      }

      return restrictionDemandee;
    } catch (error) {
      await this.auditSecurityPort?.journaliser({
        action: 'SECURITY_INCIDENT_DETECTED',
        idUtilisateur: input.idUtilisateur,
        succes: false,
        details: {
          codeRestriction: input.codeRestriction,
          erreur: error instanceof Error ? error.message : 'UNKNOWN',
        },
      });
      throw new ErreurVerificationRestriction(error instanceof Error ? error.message : undefined);
    }
  }

  public async verifierAcces(input: VerifierAccesInput): Promise<DecisionAutorisationOutput> {
    try {
      const capacites = await this.securityCapacitesEffectivesService.calculerPourUtilisateur({
        idUtilisateur: input.idUtilisateur,
        idOrganisationActive: input.idOrganisation,
        idEcoleActive: input.idEcole,
        idClasse: input.idClasse,
        idAnneeScolaire: input.idAnneeScolaire,
      });
      const permissions = capacites.permissions.map((permission) =>
        PermissionRole.creer(new PermissionSecurite(permission)),
      );
      const restrictions = capacites.restrictions.map((restriction) =>
        RestrictionRole.creer(new CodeRestrictionMetier(restriction)),
      );
      const scope = await this.verifierScope({
        idUtilisateur: input.idUtilisateur,
        idOrganisation: input.idOrganisation,
        idEcole: input.idEcole,
        idSection: input.idSection,
      });
      const restrictionRespectee = input.codeRestriction
        ? !(await this.verifierRestriction({
            idUtilisateur: input.idUtilisateur,
            codeRestriction: input.codeRestriction,
          }))
        : true;
      const { decision } = this.moteurAutorisation.verifierPermission(
        permissions,
        restrictionRespectee ? [] : restrictions,
        input.permissionDemandee,
        scope.scopeValide,
      );
      if (!decision.estAutorise()) {
        await this.auditSecurityPort?.journaliser({
          action: 'SECURITY_PERMISSION_DENIED',
          idUtilisateur: input.idUtilisateur,
          succes: false,
          details: {
            permissionDemandee: input.permissionDemandee,
            idOrganisation: input.idOrganisation,
            idEcole: input.idEcole,
            idSection: input.idSection,
            codeRestriction: input.codeRestriction,
            raison: decision.obtenirRaisonRefus(),
          },
        });
        throw new PermissionRefusee(
          input.idUtilisateur,
          input.permissionDemandee,
          decision.obtenirRaisonRefus(),
        );
      }

      await this.auditSecurityPort?.journaliser({
        action: 'SECURITY_PERMISSION_GRANTED',
        idUtilisateur: input.idUtilisateur,
        succes: true,
        details: {
          permissionDemandee: input.permissionDemandee,
          idOrganisation: input.idOrganisation,
          idEcole: input.idEcole,
          idSection: input.idSection,
          codeRestriction: input.codeRestriction,
        },
      });

      return DecisionAutorisationMapper.depuisDomaine(decision);
    } catch (error) {
      await this.auditSecurityPort?.journaliser({
        action: 'SECURITY_INCIDENT_DETECTED',
        idUtilisateur: input.idUtilisateur,
        succes: false,
        details: {
          permissionDemandee: input.permissionDemandee,
          idOrganisation: input.idOrganisation,
          idEcole: input.idEcole,
          idSection: input.idSection,
          codeRestriction: input.codeRestriction,
          erreur: error instanceof Error ? error.message : 'UNKNOWN',
        },
      });
      throw new ErreurAccesRefuse(error instanceof Error ? error.message : undefined);
    }
  }

  private async listerRestrictionsUtilisateur(idUtilisateur: string): Promise<RestrictionRole[]> {
    const affectations = await this.affectationUtilisateurRepositoryPort.listerActivesParUtilisateur(
      idUtilisateur,
    );
    const roles = await Promise.all(
      affectations.map((affectation) =>
        this.roleRepositoryPort.trouverParId(affectation.obtenirIdRole()),
      ),
    );
    return roles
      .filter((role): role is NonNullable<typeof role> => role !== null)
      .flatMap((role) => [...role.obtenirRestrictions()]);
  }
}
