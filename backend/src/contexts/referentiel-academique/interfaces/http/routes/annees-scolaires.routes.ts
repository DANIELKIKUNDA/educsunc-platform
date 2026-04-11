import type { FastifyPluginAsync } from 'fastify';
import { ControleurAnneesScolaires } from '../controllers/ControleurAnneesScolaires';
import { ExecuteurRouteTenantReferentielAcademique } from './ExecutionRouteTenantReferentielAcademique';

// Cette interface regroupe les dependances des routes annees scolaires.
export interface DependancesRoutesAnneesScolaires {
  controleurAnneesScolaires: ControleurAnneesScolaires;
  executerRouteTenant: ExecuteurRouteTenantReferentielAcademique;
}

// Cette fonction cree les routes HTTP des annees scolaires.
export const creerRoutesAnneesScolaires = (
  dependances: DependancesRoutesAnneesScolaires,
): FastifyPluginAsync => async (serveur) => {
  serveur.post('/api/annees-scolaires', async (requete, reponse) => {
    const resultat = await dependances.executerRouteTenant(
      requete,
      () => dependances.controleurAnneesScolaires.creerAnneeScolaire(
        requete.body,
      ),
      {
        mode: 'tenant_requis',
        clesTenant: ['idEcole'],
      },
    );
    return reponse.code(200).send(resultat);
  });

  serveur.get('/api/annees-scolaires', async (requete, reponse) => {
    const resultat = await dependances.executerRouteTenant(
      requete,
      () => dependances.controleurAnneesScolaires.listerAnneesScolaires(
        requete.query,
      ),
      {
        mode: 'tenant_requis',
        clesTenant: ['idEcole'],
      },
    );
    return reponse.code(200).send(resultat);
  });

  serveur.get('/api/annees-scolaires/:id', async (requete, reponse) => {
    const resultat = await dependances.executerRouteTenant(
      requete,
      () => dependances.controleurAnneesScolaires.consulterAnneeScolaire(
        requete.params,
      ),
      {
        mode: 'lecture_organisationnelle_ou_tenant',
      },
    );
    return reponse.code(200).send(resultat);
  });

  serveur.post('/api/annees-scolaires/:id/activer', async (requete, reponse) => {
    const resultat = await dependances.executerRouteTenant(
      requete,
      () => dependances.controleurAnneesScolaires.activerAnneeScolaire(
        requete.params,
        requete.body,
      ),
      {
        mode: 'tenant_requis',
      },
    );
    return reponse.code(200).send(resultat);
  });

  serveur.post('/api/annees-scolaires/:id/cloturer', async (requete, reponse) => {
    const resultat = await dependances.executerRouteTenant(
      requete,
      () => dependances.controleurAnneesScolaires.cloturerAnneeScolaire(
        requete.params,
        requete.body,
      ),
      {
        mode: 'tenant_requis',
      },
    );
    return reponse.code(200).send(resultat);
  });

  serveur.post('/api/annees-scolaires/:id/archiver', async (requete, reponse) => {
    const resultat = await dependances.executerRouteTenant(
      requete,
      () => dependances.controleurAnneesScolaires.archiverAnneeScolaire(
        requete.params,
        requete.body,
      ),
      {
        mode: 'tenant_requis',
      },
    );
    return reponse.code(200).send(resultat);
  });
};
