import type { FastifyPluginAsync } from 'fastify';
import { ControleurMigrationsReferentiel } from '../controllers/ControleurMigrationsReferentiel';
import { ExecuteurRouteIdempotenteReferentielAcademique } from './ExecutionRouteIdempotenteReferentielAcademique';
import { ExecuteurRouteTenantReferentielAcademique } from './ExecutionRouteTenantReferentielAcademique';

// Cette interface regroupe les dependances des routes migrations de referentiel.
export interface DependancesRoutesMigrationsReferentiel {
  controleurMigrationsReferentiel: ControleurMigrationsReferentiel;
  executerRouteTenant: ExecuteurRouteTenantReferentielAcademique;
  executerRouteIdempotente: ExecuteurRouteIdempotenteReferentielAcademique;
}

// Cette fonction cree les routes HTTP des migrations de referentiel.
export const creerRoutesMigrationsReferentiel = (
  dependances: DependancesRoutesMigrationsReferentiel,
): FastifyPluginAsync => async (serveur) => {
  serveur.post('/api/migrations-referentiel/analyser', async (requete, reponse) => {
    const resultat = await dependances.executerRouteIdempotente(
      requete,
      () => dependances.executerRouteTenant(
        requete,
        () => dependances.controleurMigrationsReferentiel
          .analyserMigrationReferentiel(requete.body),
        {
          mode: 'tenant_requis',
          clesTenant: ['idEcole'],
        },
      ),
      {
        operation: 'ANALYSER_MIGRATION_REFERENTIEL',
      },
    );
    return reponse.code(200).send(resultat);
  });

  serveur.post('/api/migrations-referentiel/appliquer', async (requete, reponse) => {
    const resultat = await dependances.executerRouteIdempotente(
      requete,
      () => dependances.executerRouteTenant(
        requete,
        () => dependances.controleurMigrationsReferentiel
          .appliquerMigrationReferentiel(requete.body),
        {
          mode: 'tenant_requis',
          clesTenant: ['idEcole'],
        },
      ),
      {
        operation: 'APPLIQUER_MIGRATION_REFERENTIEL',
      },
    );
    return reponse.code(200).send(resultat);
  });

  serveur.post('/api/migrations-referentiel/:id/annuler', async (requete, reponse) => {
    const resultat = await dependances.executerRouteIdempotente(
      requete,
      () => dependances.executerRouteTenant(
        requete,
        () => dependances.controleurMigrationsReferentiel
          .annulerMigrationReferentiel(requete.params, requete.body),
        {
          mode: 'tenant_requis',
        },
      ),
      {
        operation: 'ANNULER_MIGRATION_REFERENTIEL',
      },
    );
    return reponse.code(200).send(resultat);
  });

  serveur.post('/api/migrations-referentiel/:id/relancer-recalcul', async (requete, reponse) => {
    const resultat = await dependances.executerRouteIdempotente(
      requete,
      () => dependances.executerRouteTenant(
        requete,
        () => dependances.controleurMigrationsReferentiel
          .relancerRecalculApresMigration(requete.params, requete.body),
        {
          mode: 'tenant_requis',
        },
      ),
      {
        operation: 'RELANCER_RECALCUL_APRES_MIGRATION',
      },
    );
    return reponse.code(200).send(resultat);
  });

  serveur.get('/api/migrations-referentiel/:id', async (requete, reponse) => {
    const resultat = await dependances.executerRouteTenant(
      requete,
      () => dependances.controleurMigrationsReferentiel
        .consulterRapportMigration(requete.params),
      {
        mode: 'lecture_organisationnelle_ou_tenant',
      },
    );
    return reponse.code(200).send(resultat);
  });
};
