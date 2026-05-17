import type { FastifyPluginAsync } from 'fastify';
import type { DependancesRoutesBulletinsEvaluationsDocument } from './DependancesRoutesBulletinsEvaluations';
import { creerAuditRoutes } from './audit.routes';
import { creerBulletinsRoutes } from './bulletins.routes';
import { creerClassementsRoutes } from './classements.routes';
import { creerConduiteRoutes } from './conduite.routes';
import { creerEncodageCotesRoutes } from './encodage-cotes.routes';
import { creerExportsRoutes } from './exports.routes';
import { creerFichesCotationRoutes } from './fiches-cotation.routes';
import { creerHealthBulletinRoutes } from './health.routes';
import { creerHistoriqueRoutes } from './historique.routes';
import { creerMigrationsRoutes } from './migrations.routes';
import { creerProclamationsRoutes } from './proclamations.routes';
import { creerResultatsRoutes } from './resultats.routes';
import { creerStatistiquesRoutes } from './statistiques.routes';
import { creerSynchronisationRoutes } from './synchronisation.routes';
import { creerSynthesesRoutes } from './syntheses.routes';

// Ce fichier centralise les exports et l'agregation des routes HTTP du BC Bulletins & Evaluations.
export * from './DependancesRoutesBulletinsEvaluations';
export * from './audit.routes';
export * from './bulletins.routes';
export * from './classements.routes';
export * from './conduite.routes';
export * from './encodage-cotes.routes';
export * from './exports.routes';
export * from './fiches-cotation.routes';
export * from './health.routes';
export * from './historique.routes';
export * from './migrations.routes';
export * from './proclamations.routes';
export * from './resultats.routes';
export * from './statistiques.routes';
export * from './synchronisation.routes';
export * from './syntheses.routes';

// Cette fonction enregistre l'ensemble des sous-routeurs documentaires du BC.
export const creerRoutesDocumentairesBulletinsEvaluations = (
  dependances: DependancesRoutesBulletinsEvaluationsDocument,
): FastifyPluginAsync => async (serveur) => {
  await serveur.register(creerEncodageCotesRoutes(dependances));
  await serveur.register(creerFichesCotationRoutes(dependances));
  await serveur.register(creerResultatsRoutes(dependances));
  await serveur.register(creerClassementsRoutes(dependances));
  await serveur.register(creerBulletinsRoutes(dependances));
  await serveur.register(creerProclamationsRoutes(dependances));
  await serveur.register(creerSynthesesRoutes(dependances));
  await serveur.register(creerConduiteRoutes(dependances));
  await serveur.register(creerMigrationsRoutes(dependances));
  await serveur.register(creerSynchronisationRoutes(dependances));
  await serveur.register(creerAuditRoutes(dependances));
  await serveur.register(creerStatistiquesRoutes(dependances));
  await serveur.register(creerExportsRoutes(dependances));
  await serveur.register(creerHistoriqueRoutes(dependances));
  await serveur.register(creerHealthBulletinRoutes(dependances));
};
