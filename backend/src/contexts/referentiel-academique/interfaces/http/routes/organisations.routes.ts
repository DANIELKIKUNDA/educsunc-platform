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
      () => dependances.controleurOrganisations.creerOrganisation(requete.body),
    );
    return reponse.code(200).send(resultat);
  });

  serveur.get('/api/organisations', async (requete, reponse) => {
    const resultat = await dependances.executerRouteTenant(
      requete,
      () => dependances.controleurOrganisations.listerOrganisations(requete.query),
    );
    return reponse.code(200).send(resultat);
  });

  serveur.get('/api/organisations/:id', async (requete, reponse) => {
    const resultat = await dependances.executerRouteTenant(
      requete,
      () => dependances.controleurOrganisations.consulterOrganisation(
        requete.params,
      ),
    );
    return reponse.code(200).send(resultat);
  });
};
