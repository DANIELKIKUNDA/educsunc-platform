import type { FastifyPluginAsync } from 'fastify';
import { ControleurOrganisations } from '../controllers/ControleurOrganisations';
import { ExecuteurRouteTenantReferentielAcademique } from './ExecutionRouteTenantReferentielAcademique';
import { executerRouteProtegeeReferentielAcademique } from './ExecutionRouteProtegeeReferentielAcademique';

// Cette interface regroupe les dependances des routes organisations.
export interface DependancesRoutesOrganisations {
  controleurOrganisations: ControleurOrganisations;
  executerRouteTenant: ExecuteurRouteTenantReferentielAcademique;
}

// Cette fonction cree les routes HTTP des organisations.
export const creerRoutesOrganisations = (
  dependances: DependancesRoutesOrganisations,
): FastifyPluginAsync => async (serveur) => {
  serveur.post('/api/organisations', async (requete, reponse) => {
    return executerRouteProtegeeReferentielAcademique(dependances, requete, reponse, () =>
      dependances.controleurOrganisations.creerOrganisation(requete.body, requete.context));
  });

  serveur.get('/api/organisations', async (requete, reponse) => {
    return executerRouteProtegeeReferentielAcademique(dependances, requete, reponse, () =>
      dependances.controleurOrganisations.listerOrganisations(requete.query, requete.context));
  });

  serveur.get('/api/organisations/:id', async (requete, reponse) => {
    return executerRouteProtegeeReferentielAcademique(dependances, requete, reponse, () =>
      dependances.controleurOrganisations.consulterOrganisation(
        requete.params,
        requete.context,
      ));
  });

  serveur.patch('/api/organisations/:id/renommer', async (requete, reponse) => {
    return executerRouteProtegeeReferentielAcademique(dependances, requete, reponse, () =>
      dependances.controleurOrganisations.renommerOrganisation(
        requete.params,
        requete.body,
        requete.context,
      ));
  });

  serveur.post('/api/organisations/:id/activer', async (requete, reponse) => {
    return executerRouteProtegeeReferentielAcademique(dependances, requete, reponse, () =>
      dependances.controleurOrganisations.activerOrganisation(
        requete.params,
        requete.body,
        requete.context,
      ));
  });

  serveur.post('/api/organisations/:id/desactiver', async (requete, reponse) => {
    return executerRouteProtegeeReferentielAcademique(dependances, requete, reponse, () =>
      dependances.controleurOrganisations.desactiverOrganisation(
        requete.params,
        requete.body,
        requete.context,
      ));
  });
};
