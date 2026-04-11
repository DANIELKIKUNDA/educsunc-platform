import type { FastifyPluginAsync } from 'fastify';
import { ControleurEcoles } from '../controllers/ControleurEcoles';
import { ExecuteurRouteTenantReferentielAcademique } from './ExecutionRouteTenantReferentielAcademique';

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
    const resultat = await dependances.executerRouteTenant(
      requete,
      () => dependances.controleurEcoles.creerEcole(requete.body),
    );
    return reponse.code(200).send(resultat);
  });

  serveur.get('/api/ecoles', async (requete, reponse) => {
    const resultat = await dependances.executerRouteTenant(
      requete,
      () => dependances.controleurEcoles.listerEcoles(requete.query),
      {
        mode: 'lecture_organisationnelle_ou_tenant',
        clesOrganisation: ['idOrganisation'],
        clesTenant: ['idEcole'],
      },
    );
    return reponse.code(200).send(resultat);
  });

  serveur.get('/api/ecoles/:id', async (requete, reponse) => {
    const resultat = await dependances.executerRouteTenant(
      requete,
      () => dependances.controleurEcoles.consulterEcole(requete.params),
      {
        mode: 'lecture_organisationnelle_ou_tenant',
        clesTenant: ['id'],
      },
    );
    return reponse.code(200).send(resultat);
  });

  serveur.get('/api/organisations/:id/ecoles', async (requete, reponse) => {
    const resultat = await dependances.executerRouteTenant(
      requete,
      () => dependances.controleurEcoles.listerEcolesParOrganisation(
        requete.params,
        requete.query,
      ),
      {
        mode: 'lecture_organisationnelle_ou_tenant',
        clesOrganisation: ['id'],
      },
    );
    return reponse.code(200).send(resultat);
  });

  serveur.post('/api/ecoles/:id/changer-mode', async (requete, reponse) => {
    const resultat = await dependances.executerRouteTenant(
      requete,
      () => dependances.controleurEcoles.changerModeExploitationEcole(
        requete.params,
        requete.body,
      ),
      {
        mode: 'tenant_requis',
        clesTenant: ['id'],
      },
    );
    return reponse.code(200).send(resultat);
  });
};
