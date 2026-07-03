import type { FastifyPluginAsync } from 'fastify';
import { ControleurEcoles } from '../controllers/ControleurEcoles';
import { ExecuteurRouteTenantReferentielAcademique } from './ExecutionRouteTenantReferentielAcademique';
import { executerRouteProtegeeReferentielAcademique } from './ExecutionRouteProtegeeReferentielAcademique';

// Cette interface regroupe les dependances des routes ecoles.
export interface DependancesRoutesEcoles {
  controleurEcoles: ControleurEcoles;
  executerRouteTenant: ExecuteurRouteTenantReferentielAcademique;
}

// Cette fonction cree les routes HTTP des ecoles.
export const creerRoutesEcoles = (
  dependances: DependancesRoutesEcoles,
): FastifyPluginAsync => async (serveur) => {
  serveur.post('/api/ecoles', async (requete, reponse) => {
    return executerRouteProtegeeReferentielAcademique(dependances, requete, reponse, () =>
      dependances.controleurEcoles.creerEcole(requete.body, requete.context),
    );
  });

  serveur.get('/api/ecoles', async (requete, reponse) => {
    return executerRouteProtegeeReferentielAcademique(
      dependances,
      requete,
      reponse,
      () => dependances.controleurEcoles.listerEcoles(requete.query, requete.context),
      {
        mode: 'lecture_organisationnelle_ou_tenant',
        clesOrganisation: ['idOrganisation'],
        clesTenant: ['idEcole'],
      },
    );
  });

  serveur.get('/api/ecoles/:id', async (requete, reponse) => {
    return executerRouteProtegeeReferentielAcademique(
      dependances,
      requete,
      reponse,
      () => dependances.controleurEcoles.consulterEcole(requete.params, requete.context),
      {
        mode: 'lecture_organisationnelle_ou_tenant',
        clesTenant: ['id'],
      },
    );
  });

  serveur.get('/api/organisations/:id/ecoles', async (requete, reponse) => {
    return executerRouteProtegeeReferentielAcademique(
      dependances,
      requete,
      reponse,
      () => dependances.controleurEcoles.listerEcolesParOrganisation(
        requete.params,
        requete.query,
        requete.context,
      ),
      {
        mode: 'lecture_organisationnelle_ou_tenant',
        clesOrganisation: ['id'],
      },
    );
  });

  serveur.post('/api/ecoles/:id/changer-mode', async (requete, reponse) => {
    return executerRouteProtegeeReferentielAcademique(
      dependances,
      requete,
      reponse,
      () => dependances.controleurEcoles.changerModeExploitationEcole(
        requete.params,
        requete.body,
        requete.context,
      ),
      {
        mode: 'tenant_requis',
        clesTenant: ['id'],
      },
    );
  });

  serveur.patch('/api/ecoles/:id/renommer', async (requete, reponse) => {
    return executerRouteProtegeeReferentielAcademique(
      dependances,
      requete,
      reponse,
      () => dependances.controleurEcoles.renommerEcole(
        requete.params,
        requete.body,
        requete.context,
      ),
      {
        mode: 'tenant_requis',
        clesTenant: ['id'],
      },
    );
  });

  serveur.patch('/api/ecoles/:id/informations-institutionnelles', async (requete, reponse) => {
    return executerRouteProtegeeReferentielAcademique(
      dependances,
      requete,
      reponse,
      () => dependances.controleurEcoles.mettreAJourInformationsInstitutionnellesEcole(
        requete.params,
        requete.body,
        requete.context,
      ),
      {
        mode: 'tenant_requis',
        clesTenant: ['id'],
      },
    );
  });

  serveur.post('/api/ecoles/:id/activer', async (requete, reponse) => {
    return executerRouteProtegeeReferentielAcademique(
      dependances,
      requete,
      reponse,
      () => dependances.controleurEcoles.activerEcole(
        requete.params,
        requete.body,
        requete.context,
      ),
      {
        mode: 'tenant_requis',
        clesTenant: ['id'],
      },
    );
  });

  serveur.post('/api/ecoles/:id/desactiver', async (requete, reponse) => {
    return executerRouteProtegeeReferentielAcademique(
      dependances,
      requete,
      reponse,
      () => dependances.controleurEcoles.desactiverEcole(
        requete.params,
        requete.body,
        requete.context,
      ),
      {
        mode: 'tenant_requis',
        clesTenant: ['id'],
      },
    );
  });
};
