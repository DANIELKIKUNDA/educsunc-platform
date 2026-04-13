import type { FastifyPluginAsync } from 'fastify';
import { ControleurAnneesScolaires } from '../controllers/ControleurAnneesScolaires';
import { ExecuteurRouteIdempotenteReferentielAcademique } from './ExecutionRouteIdempotenteReferentielAcademique';
import { ExecuteurRouteTenantReferentielAcademique } from './ExecutionRouteTenantReferentielAcademique';

// Cette interface regroupe les dependances des routes annees scolaires.
export interface DependancesRoutesAnneesScolaires {
  controleurAnneesScolaires: ControleurAnneesScolaires;
  executerRouteTenant: ExecuteurRouteTenantReferentielAcademique;
  executerRouteIdempotente: ExecuteurRouteIdempotenteReferentielAcademique;
}

// Cette fonction cree les routes HTTP des annees scolaires.
export const creerRoutesAnneesScolaires = (
  dependances: DependancesRoutesAnneesScolaires,
): FastifyPluginAsync => async (serveur) => {
  serveur.post('/api/annees-scolaires', async (requete, reponse) => {
    const resultat = await dependances.executerRouteIdempotente(
      requete,
      () => dependances.executerRouteTenant(
        requete,
        () => dependances.controleurAnneesScolaires.creerAnneeScolaire(
          requete.body,
        ),
        {
          mode: 'tenant_requis',
          clesTenant: ['idEcole'],
        },
      ),
      {
        operation: 'CREER_ANNEE_SCOLAIRE',
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

  serveur.get('/api/annees-scolaires/active', async (requete, reponse) => {
    const resultat = await dependances.executerRouteTenant(
      requete,
      () => dependances.controleurAnneesScolaires.consulterAnneeActiveParEcole(
        requete.query,
      ),
      {
        mode: 'tenant_requis',
        clesTenant: ['idEcole'],
      },
    );
    return reponse.code(200).send(resultat);
  });

  serveur.post('/api/annees-scolaires/preparer-suivante', async (requete, reponse) => {
    const resultat = await dependances.executerRouteIdempotente(
      requete,
      () => dependances.executerRouteTenant(
        requete,
        () => dependances.controleurAnneesScolaires.preparerAnneeScolaireSuivante(
          requete.body,
        ),
        {
          mode: 'tenant_requis',
          clesTenant: ['idEcole'],
        },
      ),
      {
        operation: 'PREPARER_ANNEE_SCOLAIRE_SUIVANTE',
      },
    );
    return reponse.code(200).send(resultat);
  });

  serveur.post('/api/annees-scolaires/garantir-active', async (requete, reponse) => {
    const resultat = await dependances.executerRouteIdempotente(
      requete,
      () => dependances.executerRouteTenant(
        requete,
        () => dependances.controleurAnneesScolaires
          .garantirAnneeScolaireActiveParEcole(requete.body),
        {
          mode: 'tenant_requis',
          clesTenant: ['idEcole'],
        },
      ),
      {
        operation: 'GARANTIR_ANNEE_SCOLAIRE_ACTIVE',
      },
    );
    return reponse.code(200).send(resultat);
  });

  serveur.post('/api/annees-scolaires/basculer', async (requete, reponse) => {
    const resultat = await dependances.executerRouteIdempotente(
      requete,
      () => dependances.executerRouteTenant(
        requete,
        () => dependances.controleurAnneesScolaires.basculerAnneeScolaire(
          requete.body,
        ),
        {
          mode: 'tenant_requis',
          clesTenant: ['idEcole'],
        },
      ),
      {
        operation: 'BASCULER_ANNEE_SCOLAIRE',
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
