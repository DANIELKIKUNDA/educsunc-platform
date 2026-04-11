import type { FastifyPluginAsync } from 'fastify';
import { ControleurProgrammesNiveau } from '../controllers/ControleurProgrammesNiveau';
import { ExecuteurRouteTenantReferentielAcademique } from './ExecutionRouteTenantReferentielAcademique';

// Cette interface regroupe les dependances des routes programmes niveau.
export interface DependancesRoutesProgrammesNiveau {
  controleurProgrammesNiveau: ControleurProgrammesNiveau;
  executerRouteTenant: ExecuteurRouteTenantReferentielAcademique;
}

// Cette fonction cree les routes HTTP des programmes niveau.
export const creerRoutesProgrammesNiveau = (
  dependances: DependancesRoutesProgrammesNiveau,
): FastifyPluginAsync => async (serveur) => {
  serveur.post('/api/programmes-niveau/initialiser', async (requete, reponse) => {
    const resultat = await dependances.executerRouteTenant(
      requete,
      () => dependances.controleurProgrammesNiveau.initialiserProgrammeNiveau(requete.body),
      {
        mode: 'tenant_requis',
        clesTenant: ['idEcole'],
      },
    );
    return reponse.code(200).send(resultat);
  });

  serveur.get('/api/programmes-niveau/:id', async (requete, reponse) => {
    const resultat = await dependances.executerRouteTenant(
      requete,
      () => dependances.controleurProgrammesNiveau.consulterProgrammeNiveau(requete.params),
      {
        mode: 'lecture_organisationnelle_ou_tenant',
      },
    );
    return reponse.code(200).send(resultat);
  });

  serveur.post('/api/programmes-niveau/:id/valider', async (requete, reponse) => {
    const resultat = await dependances.executerRouteTenant(
      requete,
      () => dependances.controleurProgrammesNiveau
        .validerProgrammeNiveau(requete.params, requete.body),
      {
        mode: 'tenant_requis',
      },
    );
    return reponse.code(200).send(resultat);
  });

  serveur.post('/api/programmes-niveau/:id/archiver', async (requete, reponse) => {
    const resultat = await dependances.executerRouteTenant(
      requete,
      () => dependances.controleurProgrammesNiveau
        .archiverProgrammeNiveau(requete.params, requete.body),
      {
        mode: 'tenant_requis',
      },
    );
    return reponse.code(200).send(resultat);
  });

  serveur.get('/api/programmes-niveau', async (requete, reponse) => {
    const resultat = await dependances.executerRouteTenant(
      requete,
      () => dependances.controleurProgrammesNiveau.listerProgrammesNiveau(requete.query),
      {
        mode: 'tenant_requis',
        clesTenant: ['idEcole'],
      },
    );
    return reponse.code(200).send(resultat);
  });
};
