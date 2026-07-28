import type { FastifyPluginAsync, FastifyRequest } from 'fastify';
import { CONTEXT_ROLE_PAR_DEFAUT, RequestContextFactory } from 'shared/context';
import { MoteurAutorisation, MoteurCapacitesEffectives, MoteurRestrictionsMetier, MoteurScope, ScopeAcces, TypeScope } from 'shared/security/domain';
import { ResponsabiliteClassePedagogiqueAdapter } from '../adapters/ResponsabiliteClassePedagogiqueAdapter';
import { OwnershipParentAdapter } from '../adapters/OwnershipParentAdapter';
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
  type OwnershipParentPort,
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
  ownershipParentPort?: (OwnershipParentPort & {
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
  const ownershipParentPort = dependances.ownershipParentPort === undefined
    ? new OwnershipParentAdapter()
    : dependances.ownershipParentPort ?? undefined;
  const auditSecurityPort = dependances.auditSecurityPort === undefined
    ? new SecurityAuditInfrastructureService()
    : dependances.auditSecurityPort ?? undefined;
  const securityCapacitesEffectivesService = new SecurityCapacitesEffectivesService(
    roleRepository,
    affectationUtilisateurRepository,
    affectationTitulariatRepository,
    new MoteurCapacitesEffectives(),
    responsabiliteClassePedagogiquePort,
    ownershipParentPort,
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
        await ownershipParentPort?.fermer?.();
      });

      serveur.addHook('preHandler', async (requete: FastifyRequest) => {
        if (!requete.context?.utilisateurId) {
          return;
        }

      const capacites = await securityCapacitesEffectivesService.calculerPourUtilisateur({
        idUtilisateur: requete.context.utilisateurId,
        idOrganisationActive: requete.context.organisationActiveId,
        idEcoleActive: requete.context.ecoleActiveId,
        acteurCodePrefere:
          requete.context.roleActif === CONTEXT_ROLE_PAR_DEFAUT
            ? undefined
            : requete.context.roleActif,
      });
      const permissions = [...capacites.permissions];
      const restrictions = [...capacites.restrictions];
      const scopes = capacites.scopes.map((scope) =>
        ScopeAcces.creer(
          new TypeScope(scope.typeScope),
          scope.valeurScope,
          scope.estLectureSeule,
        ),
      );
      const idsTitulariats = new Set(
        capacites.titulariatsActifs.map((titulariat) => titulariat.idAffectationTitulariat),
      );
      const titulariats = idsTitulariats.size > 0
        ? (
            await affectationTitulariatRepository.listerActifsParUtilisateur(
              requete.context.utilisateurId,
            )
          ).filter((titulariat) => idsTitulariats.has(titulariat.obtenirId()))
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

      const roleActif = capacites.acteurCodeActif === CONTEXT_ROLE_PAR_DEFAUT
        ? undefined
        : capacites.acteurCodeActif;

        requete.context = RequestContextFactory.enrichirSecurity(requete.context, {
          actorCodes: capacites.actorCodes,
          roleActif,
          permissions,
          scopes,
          restrictions,
          titulariats,
          titulariatsEffectifs: capacites.titulariatsEffectifs,
          estTitulaireEffectif: capacites.estTitulaireEffectif,
          sourceTitulariatEffectif: capacites.sourceTitulariatEffectif,
          elevesAutorises: capacites.elevesAutorises,
        });
      });
    },
    {
      nom: 'security',
    },
  );
}

export const securityPlugin: PluginGlobal = creerSecurityPlugin();
