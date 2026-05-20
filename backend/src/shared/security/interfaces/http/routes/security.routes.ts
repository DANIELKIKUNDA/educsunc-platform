import type { FastifyPluginAsync } from 'fastify';
import type { DependancesRoutesSecurity } from './DependancesRoutesSecurity';
import { creerRoleRoutes } from './role.routes';
import { creerAffectationRoutes } from './affectation.routes';
import { creerTitulariatRoutes } from './titulariat.routes';
import { creerAutorisationRoutes } from './autorisation.routes';
import { creerContexteRoutes } from './contexte.routes';
import { creerAuditRoutes } from './audit.routes';

// Ce fichier agrege toutes les routes HTTP de SECURITY.
export const creerRoutesSecurity = (dependances: DependancesRoutesSecurity): FastifyPluginAsync => async (serveur) => {
  await serveur.register(creerRoleRoutes(dependances));
  await serveur.register(creerAffectationRoutes(dependances));
  await serveur.register(creerTitulariatRoutes(dependances));
  await serveur.register(creerAutorisationRoutes(dependances));
  await serveur.register(creerContexteRoutes(dependances));
  await serveur.register(creerAuditRoutes(dependances));
};
