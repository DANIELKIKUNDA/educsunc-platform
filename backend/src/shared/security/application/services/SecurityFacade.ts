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
  AffectationUtilisateurRepositoryPort,
  AuditSecurityPort,
  PermissionCachePort,
  RoleRepositoryPort,
} from '../ports';
import {
  MoteurAutorisation,
  MoteurRestrictionsMetier,
  MoteurScope,
  PermissionRefusee,
  RestrictionRole,
} from '../../../security/domain';
import {
  ErreurAccesRefuse,
  ErreurVerificationPermission,
  ErreurVerificationRestriction,
  ErreurVerificationScope,
} from '../exceptions';

// Cette facade est le point d'entree principal consomme par les autres BC.
export class SecurityFacade {
  constructor(
    private readonly roleRepositoryPort: RoleRepositoryPort,
    private readonly affectationUtilisateurRepositoryPort: AffectationUtilisateurRepositoryPort,
    private readonly permissionCachePort: PermissionCachePort,
    private readonly moteurAutorisation: MoteurAutorisation,
    private readonly moteurScope: MoteurScope,
    private readonly moteurRestrictionsMetier: MoteurRestrictionsMetier,
    private readonly auditSecurityPort?: AuditSecurityPort,
  ) {}

  public async verifierPermission(input: VerifierPermissionInput): Promise<VerificationPermissionOutput> {
    try {
      const permissions = await this.permissionCachePort.obtenirPermissions(input.idUtilisateur);
      const autorise = permissions
        ? permissions.includes(input.permissionDemandee)
        : await this.verifierPermissionDepuisRoles(input.idUtilisateur, input.permissionDemandee);

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
        .map((affectation) => affectation.obtenirIdOrganisation())
        .filter((valeur): valeur is string => Boolean(valeur));
      const ecolesAutorisees = affectations
        .map((affectation) => affectation.obtenirIdEcole())
        .filter((valeur): valeur is string => Boolean(valeur));
      this.moteurScope.verifierOrganisation(organisationsAutorisees, input.idOrganisation);
      this.moteurScope.verifierEcole(ecolesAutorisees, input.idEcole);

      await this.auditSecurityPort?.journaliser({
        action: 'SECURITY_SCOPE_GRANTED',
        idUtilisateur: input.idUtilisateur,
        succes: true,
        details: {
          idOrganisation: input.idOrganisation,
          idEcole: input.idEcole,
          scope: [input.idOrganisation, input.idEcole].filter(Boolean).join(':'),
        },
      });

      return {
        scopeValide: true,
        idOrganisation: input.idOrganisation,
        idEcole: input.idEcole,
      };
    } catch (error) {
      await this.auditSecurityPort?.journaliser({
        action: 'SECURITY_SCOPE_DENIED',
        idUtilisateur: input.idUtilisateur,
        succes: false,
        details: {
          idOrganisation: input.idOrganisation,
          idEcole: input.idEcole,
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
      const affectations = await this.affectationUtilisateurRepositoryPort.listerActivesParUtilisateur(
        input.idUtilisateur,
      );
      const roles = await Promise.all(
        affectations.map((affectation) =>
          this.roleRepositoryPort.trouverParId(affectation.obtenirIdRole()),
        ),
      );
      const permissions = roles
        .filter((role): role is NonNullable<typeof role> => role !== null)
        .flatMap((role) => role.obtenirPermissions());
      const restrictions = roles
        .filter((role): role is NonNullable<typeof role> => role !== null)
        .flatMap((role) => role.obtenirRestrictions());
      const scope = await this.verifierScope({
        idUtilisateur: input.idUtilisateur,
        idOrganisation: input.idOrganisation,
        idEcole: input.idEcole,
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
          codeRestriction: input.codeRestriction,
          erreur: error instanceof Error ? error.message : 'UNKNOWN',
        },
      });
      throw new ErreurAccesRefuse(error instanceof Error ? error.message : undefined);
    }
  }

  private async verifierPermissionDepuisRoles(
    idUtilisateur: string,
    permissionDemandee: string,
  ): Promise<boolean> {
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
      .some((role) =>
        role
          .obtenirPermissions()
          .some(
            (permissionRole) =>
              permissionRole.obtenirPermission().obtenirValeur() === permissionDemandee,
          ),
      );
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
