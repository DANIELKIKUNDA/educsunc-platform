import type { FastifyPluginAsync } from 'fastify';
import { ControleurOrganisations } from '../controllers/ControleurOrganisations';
import { ExecuteurRouteTenantReferentielAcademique } from './ExecutionRouteTenantReferentielAcademique';

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
    const resultat = await dependances.executerRouteTenant(
      requete,
      () => dependances.controleurOrganisations.creerOrganisation(requete.body, requete.context),
    );
    return reponse.code(200).send(resultat);
  });

  serveur.get('/api/organisations', async (requete, reponse) => {
    const resultat = await dependances.executerRouteTenant(
      requete,
      () => dependances.controleurOrganisations.listerOrganisations(requete.query, requete.context),
    );
    return reponse.code(200).send(resultat);
  });

  serveur.get('/api/organisations/:id', async (requete, reponse) => {
    const resultat = await dependances.executerRouteTenant(
      requete,
      () => dependances.controleurOrganisations.consulterOrganisation(
        requete.params,
        requete.context,
      ),
    );
    return reponse.code(200).send(resultat);
  });

  serveur.patch('/api/organisations/:id/renommer', async (requete, reponse) => {
    const resultat = await dependances.executerRouteTenant(
      requete,
      () => dependances.controleurOrganisations.renommerOrganisation(
        requete.params,
        requete.body,
        requete.context,
      ),
    );
    return reponse.code(200).send(resultat);
  });

  serveur.post('/api/organisations/:id/activer', async (requete, reponse) => {
    const resultat = await dependances.executerRouteTenant(
      requete,
      () => dependances.controleurOrganisations.activerOrganisation(
        requete.params,
        requete.body,
        requete.context,
      ),
    );
    return reponse.code(200).send(resultat);
  });

  serveur.post('/api/organisations/:id/desactiver', async (requete, reponse) => {
    const resultat = await dependances.executerRouteTenant(
      requete,
      () => dependances.controleurOrganisations.desactiverOrganisation(
        requete.params,
        requete.body,
        requete.context,
      ),
    );
    return reponse.code(200).send(resultat);
  });
};
