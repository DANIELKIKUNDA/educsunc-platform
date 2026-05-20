import type { FastifyPluginAsync, FastifyRequest } from 'fastify';
import { CONTEXT_ROLE_PAR_DEFAUT, RequestContextFactory } from 'shared/context';
import { AffectationTitulariat, MoteurAutorisation, MoteurRestrictionsMetier, MoteurScope, ScopeAcces, TypeScope } from 'shared/security/domain';
import { PermissionCacheService, PostgresAffectationUtilisateurRepository, PostgresRoleRepository } from 'shared/security/infrastructure';
import { SecurityFacade } from 'shared/security/application/services/SecurityFacade';
import { obtenirMemoireSecurityStore } from 'shared/security/infrastructure/persistence/postgres/repositories/_memoireSecurityStore';
import { TitulariatPersistenceMapper } from 'shared/security/infrastructure/persistence/postgres/mappers/TitulariatPersistenceMapper';

type PluginGlobal = FastifyPluginAsync & { nom: string };

const roleRepository = new PostgresRoleRepository();
const affectationUtilisateurRepository = new PostgresAffectationUtilisateurRepository();
const permissionCacheService = new PermissionCacheService();
const securityFacade = new SecurityFacade(
  roleRepository,
  affectationUtilisateurRepository,
  permissionCacheService,
  new MoteurAutorisation(),
  new MoteurScope(),
  new MoteurRestrictionsMetier(),
);

// Ce plugin enrichit le RequestContext avec les permissions et portees SECURITY.
export const securityPlugin: PluginGlobal = Object.assign(
  async (serveur: Parameters<FastifyPluginAsync>[0]) => {
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

      const permissions = Array.from(
        new Set(
          roles.flatMap((role) =>
            role
              .obtenirPermissions()
              .map((permission) => permission.obtenirPermission().obtenirValeur()),
          ),
        ),
      );
      const restrictions = Array.from(
        new Set(
          roles.flatMap((role) =>
            role
              .obtenirRestrictions()
              .map((restriction) =>
                restriction.obtenirCodeRestriction().obtenirValeur(),
              ),
          ),
        ),
      );
      const scopes = affectations.flatMap((affectation) => [
        ...affectation.obtenirScopes(),
        ...creerScopesImplicites(affectation.obtenirIdOrganisation(), affectation.obtenirIdEcole()),
      ]);
      const titulariats = listerTitulariatsUtilisateur(requete.context.utilisateurId);

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

function creerScopesImplicites(
  idOrganisation?: string,
  idEcole?: string,
): ScopeAcces[] {
  const scopes: ScopeAcces[] = [];

  if (idOrganisation) {
    scopes.push(ScopeAcces.creer(new TypeScope('ORGANISATION'), idOrganisation));
  }

  if (idEcole) {
    scopes.push(ScopeAcces.creer(new TypeScope('ECOLE'), idEcole));
  }

  return scopes;
}

function listerTitulariatsUtilisateur(idUtilisateur: string): AffectationTitulariat[] {
  const store = obtenirMemoireSecurityStore();
  return Array.from(store.titulariats.values())
    .filter((titulariat) => titulariat.id_utilisateur === idUtilisateur && titulariat.est_actif)
    .map((titulariat) => TitulariatPersistenceMapper.depuisRecord(titulariat));
}
