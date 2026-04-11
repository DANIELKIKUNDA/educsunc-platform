import type { FastifyPluginAsync } from 'fastify';
import { ControleurStructureScolaire } from '../controllers/ControleurStructureScolaire';
import { ExecuteurRouteTenantReferentielAcademique } from './ExecutionRouteTenantReferentielAcademique';

// Cette interface regroupe les dependances des routes de structure scolaire.
export interface DependancesRoutesStructureScolaire {
  controleurStructureScolaire: ControleurStructureScolaire;
  executerRouteTenant: ExecuteurRouteTenantReferentielAcademique;
}

// Cette fonction cree les routes HTTP de la structure scolaire.
export const creerRoutesStructureScolaire = (
  dependances: DependancesRoutesStructureScolaire,
): FastifyPluginAsync => async (serveur) => {
  serveur.post('/api/sections-scolaires', async (requete, reponse) => {
    const resultat = await dependances.executerRouteTenant(
      requete,
      () => dependances.controleurStructureScolaire.creerSectionScolaire(
        requete.body,
      ),
    );
    return reponse.code(200).send(resultat);
  });

  serveur.post('/api/classes-academiques', async (requete, reponse) => {
    const resultat = await dependances.executerRouteTenant(
      requete,
      () => dependances.controleurStructureScolaire.creerClasseAcademique(
        requete.body,
      ),
    );
    return reponse.code(200).send(resultat);
  });

  serveur.post('/api/options-etudes', async (requete, reponse) => {
    const resultat = await dependances.executerRouteTenant(
      requete,
      () => dependances.controleurStructureScolaire.creerOptionEtude(
        requete.body,
      ),
    );
    return reponse.code(200).send(resultat);
  });

  serveur.post('/api/classes-pedagogiques', async (requete, reponse) => {
    const resultat = await dependances.executerRouteTenant(
      requete,
      () => dependances.controleurStructureScolaire.creerClassePedagogique(
        requete.body,
      ),
      {
        mode: 'tenant_requis',
        clesTenant: ['idEcole'],
      },
    );
    return reponse.code(200).send(resultat);
  });

  serveur.get('/api/classes-academiques', async (requete, reponse) => {
    const resultat = await dependances.executerRouteTenant(
      requete,
      () => dependances.controleurStructureScolaire.listerClassesAcademiques(
        requete.query,
      ),
    );
    return reponse.code(200).send(resultat);
  });

  serveur.get('/api/classes-pedagogiques', async (requete, reponse) => {
    const resultat = await dependances.executerRouteTenant(
      requete,
      () => dependances.controleurStructureScolaire.listerClassesPedagogiques(
        requete.query,
      ),
      {
        mode: 'tenant_requis',
        clesTenant: ['idEcole'],
      },
    );
    return reponse.code(200).send(resultat);
  });

  serveur.get('/api/options-etudes', async (requete, reponse) => {
    const resultat = await dependances.executerRouteTenant(
      requete,
      () => dependances.controleurStructureScolaire.listerOptionsEtudes(
        requete.query,
      ),
    );
    return reponse.code(200).send(resultat);
  });
};
