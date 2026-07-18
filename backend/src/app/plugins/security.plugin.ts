import type { FastifyPluginAsync, FastifyRequest } from 'fastify';
import { CONTEXT_ROLE_PAR_DEFAUT, RequestContextFactory } from 'shared/context';
import { MoteurAutorisation, MoteurCapacitesEffectives, MoteurRestrictionsMetier, MoteurScope, ScopeAcces, TypeScope, type Role } from 'shared/security/domain';
import { ResponsabiliteClassePedagogiqueAdapter } from '../adapters/ResponsabiliteClassePedagogiqueAdapter';
import {
  PermissionCacheService,
  PostgresAffectationTitulariatRepository,
  PostgresAffectationUtilisateurRepository,
  PostgresRoleRepository,
  SecurityAuditInfrastructureService,
} from 'shared/security/infrastructure';
import {
  SecurityCapacitesEffectivesService,
  SecurityFacade,
  type AffectationTitulariatRepositoryPort,
  type AffectationUtilisateurRepositoryPort,
  type AuditSecurityPort,
  type PermissionCachePort,
  type ResponsabiliteClassePedagogiquePort,
  type RoleRepositoryPort,
} from 'shared/security/application';

type PluginGlobal = FastifyPluginAsync & { nom: string };

interface SecurityPluginDependencies {
  roleRepository?: RoleRepositoryPort;
  affectationUtilisateurRepository?: AffectationUtilisateurRepositoryPort;
  affectationTitulariatRepository?: AffectationTitulariatRepositoryPort;
  permissionCacheService?: PermissionCachePort;
  auditSecurityPort?: AuditSecurityPort | null;
  responsabiliteClassePedagogiquePort?: (ResponsabiliteClassePedagogiquePort & {
    fermer?: () => Promise<void>;
  }) | null;
}

// Ce plugin enrichit le RequestContext avec les permissions et portees SECURITY.
export function creerSecurityPlugin(
  dependances: SecurityPluginDependencies = {},
): PluginGlobal {
  const roleRepository = dependances.roleRepository ?? new PostgresRoleRepository();
  const affectationUtilisateurRepository = dependances.affectationUtilisateurRepository
    ?? new PostgresAffectationUtilisateurRepository();
  const affectationTitulariatRepository = dependances.affectationTitulariatRepository
    ?? new PostgresAffectationTitulariatRepository();
  const permissionCacheService = dependances.permissionCacheService ?? new PermissionCacheService();
  const responsabiliteClassePedagogiquePort = dependances.responsabiliteClassePedagogiquePort === undefined
    ? new ResponsabiliteClassePedagogiqueAdapter()
    : dependances.responsabiliteClassePedagogiquePort ?? undefined;
  const auditSecurityPort = dependances.auditSecurityPort === undefined
    ? new SecurityAuditInfrastructureService()
    : dependances.auditSecurityPort ?? undefined;
  const securityCapacitesEffectivesService = new SecurityCapacitesEffectivesService(
    roleRepository,
    affectationUtilisateurRepository,
    affectationTitulariatRepository,
    new MoteurCapacitesEffectives(),
    responsabiliteClassePedagogiquePort,
  );
  const securityFacade = new SecurityFacade(
    roleRepository,
    affectationUtilisateurRepository,
    affectationTitulariatRepository,
    permissionCacheService,
    new MoteurAutorisation(),
    new MoteurScope(),
    new MoteurRestrictionsMetier(),
    new MoteurCapacitesEffectives(),
    auditSecurityPort,
    responsabiliteClassePedagogiquePort,
  );

  return Object.assign(
    async (serveur: Parameters<FastifyPluginAsync>[0]) => {
      serveur.addHook('onClose', async () => {
        await responsabiliteClassePedagogiquePort?.fermer?.();
      });

      serveur.addHook('preHandler', async (requete: FastifyRequest) => {
        if (!requete.context?.utilisateurId) {
          return;
        }

      const affectations = await affectationUtilisateurRepository.listerActivesParUtilisateur(
        requete.context.utilisateurId,
      );
      const roles = (
        await Promise.all(
          affectations.map((affectation) =>
            roleRepository.trouverParId(affectation.obtenirIdRole()),
          ),
        )
      ).filter((role): role is NonNullable<typeof role> => role !== null);
      const capacites = await securityCapacitesEffectivesService.calculerPourUtilisateur({
        idUtilisateur: requete.context.utilisateurId,
        idOrganisationActive: requete.context.organisationActiveId,
        idEcoleActive: requete.context.ecoleActiveId,
      });
      const permissions = [...capacites.permissions];
      const restrictions = [...capacites.restrictions];
      const scopes = [
        ...affectations.flatMap((affectation) => [
          ...affectation.obtenirScopes(),
          ...creerScopesImplicites(
            affectation.obtenirIdOrganisation(),
            affectation.obtenirIdEcole(),
            affectation.obtenirIdSection(),
          ),
        ]),
        ...creerScopesPlateforme(roles),
      ];
      const titulariats = capacites.titulariatsActifs.length > 0
        ? await affectationTitulariatRepository.listerActifsParUtilisateur(requete.context.utilisateurId)
        : [];

      await permissionCacheService.memoriserPermissions(
        requete.context.utilisateurId,
        permissions,
      );

      if (requete.context.organisationActiveId || requete.context.ecoleActiveId) {
        await securityFacade.verifierScope({
          idUtilisateur: requete.context.utilisateurId,
          idOrganisation: requete.context.organisationActiveId,
          idEcole: requete.context.ecoleActiveId,
        });
      }

      const roleActif =
        requete.context.roleActif
        && requete.context.roleActif !== CONTEXT_ROLE_PAR_DEFAUT
          ? requete.context.roleActif
          : roles[0]?.obtenirCodeRole().obtenirValeur();

        requete.context = RequestContextFactory.enrichirSecurity(requete.context, {
          roleActif,
          permissions,
          scopes,
          restrictions,
          titulariats,
        });
      });
    },
    {
      nom: 'security',
    },
  );
}

export const securityPlugin: PluginGlobal = creerSecurityPlugin();

function creerScopesImplicites(
  idOrganisation?: string,
  idEcole?: string,
  idSection?: string,
): ScopeAcces[] {
  const scopes: ScopeAcces[] = [];

  if (idOrganisation) {
    scopes.push(ScopeAcces.creer(new TypeScope('ORGANISATION'), idOrganisation));
  }

  if (idEcole) {
    scopes.push(ScopeAcces.creer(new TypeScope('ECOLE'), idEcole));
  }

  if (idSection) {
    scopes.push(ScopeAcces.creer(new TypeScope('SECTION'), idSection));
  }

  return scopes;
}

function creerScopesPlateforme(
  roles: Array<Role | null>,
): ScopeAcces[] {
  const portePlateforme = roles.some((role) =>
    role?.obtenirNiveauAcces().obtenirValeur() === 'PLATEFORME',
  );

  if (!portePlateforme) {
    return [];
  }

  return [ScopeAcces.creer(new TypeScope('PLATEFORME'), 'system')];
}
