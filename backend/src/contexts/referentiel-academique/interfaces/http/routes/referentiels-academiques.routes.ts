import type { FastifyPluginAsync } from 'fastify';
import { ControleurReferentielsAcademiques } from '../controllers/ControleurReferentielsAcademiques';
import { ExecuteurRouteIdempotenteReferentielAcademique } from './ExecutionRouteIdempotenteReferentielAcademique';
import { ExecuteurRouteTenantReferentielAcademique } from './ExecutionRouteTenantReferentielAcademique';
import { executerRouteProtegeeReferentielAcademique } from './ExecutionRouteProtegeeReferentielAcademique';

// Cette interface regroupe les dependances des routes referentielles.
export interface DependancesRoutesReferentielsAcademiques {
  controleurReferentielsAcademiques: ControleurReferentielsAcademiques;
  executerRouteTenant: ExecuteurRouteTenantReferentielAcademique;
  executerRouteIdempotente: ExecuteurRouteIdempotenteReferentielAcademique;
}

// Cette fonction cree les routes HTTP des referentiels academiques.
export const creerRoutesReferentielsAcademiques = (
  dependances: DependancesRoutesReferentielsAcademiques,
): FastifyPluginAsync => async (serveur) => {
  serveur.post('/api/referentiels/import-sections', async (requete, reponse) => {
    return executerRouteProtegeeReferentielAcademique(
      dependances,
      requete,
      reponse,
      () => dependances.executerRouteIdempotente(
        requete,
        () => dependances.controleurReferentielsAcademiques.importerSectionsDepuisJson(
          requete.body,
          requete.context,
        ),
        {
          operation: 'IMPORT_REFERENTIEL_SECTIONS',
        },
      ),
    );
  });

  serveur.post('/api/referentiels/import-options', async (requete, reponse) => {
    return executerRouteProtegeeReferentielAcademique(
      dependances,
      requete,
      reponse,
      () => dependances.executerRouteIdempotente(
        requete,
        () => dependances.controleurReferentielsAcademiques.importerOptionsDepuisJson(
          requete.body,
          requete.context,
        ),
        {
          operation: 'IMPORT_REFERENTIEL_OPTIONS',
        },
      ),
    );
  });

  serveur.post('/api/referentiels/import-classes', async (requete, reponse) => {
    return executerRouteProtegeeReferentielAcademique(
      dependances,
      requete,
      reponse,
      () => dependances.executerRouteIdempotente(
        requete,
        () => dependances.controleurReferentielsAcademiques
          .importerClassesAcademiquesDepuisJson(requete.body, requete.context),
        {
          operation: 'IMPORT_REFERENTIEL_CLASSES_ACADEMIQUES',
        },
      ),
    );
  });

  serveur.post('/api/referentiels/import-cours', async (requete, reponse) => {
    return executerRouteProtegeeReferentielAcademique(
      dependances,
      requete,
      reponse,
      () => dependances.executerRouteIdempotente(
        requete,
        () => dependances.controleurReferentielsAcademiques
          .importerCoursAcademiquesDepuisJson(requete.body, requete.context),
        {
          operation: 'IMPORT_REFERENTIEL_COURS',
        },
      ),
    );
  });

  serveur.post('/api/referentiels/import-programmes', async (requete, reponse) => {
    return executerRouteProtegeeReferentielAcademique(
      dependances,
      requete,
      reponse,
      () => dependances.executerRouteIdempotente(
        requete,
        () => dependances.controleurReferentielsAcademiques
          .importerProgrammesAcademiquesDepuisJson(requete.body, requete.context),
        {
          operation: 'IMPORT_REFERENTIEL_PROGRAMMES',
        },
      ),
    );
  });

  serveur.post('/api/referentiels/import-lignes', async (requete, reponse) => {
    return executerRouteProtegeeReferentielAcademique(
      dependances,
      requete,
      reponse,
      () => dependances.executerRouteIdempotente(
        requete,
        () => dependances.controleurReferentielsAcademiques
          .importerLignesProgrammeDepuisJson(requete.body, requete.context),
        {
          operation: 'IMPORT_REFERENTIEL_LIGNES_PROGRAMME',
        },
      ),
    );
  });

  serveur.post('/api/referentiels/versions', async (requete, reponse) => {
    return executerRouteProtegeeReferentielAcademique(
      dependances,
      requete,
      reponse,
      () => dependances.executerRouteIdempotente(
        requete,
        () => dependances.controleurReferentielsAcademiques
          .publierVersionReferentiel(requete.body, requete.context),
        {
          operation: 'PUBLIER_VERSION_REFERENTIEL',
        },
      ),
    );
  });

  serveur.post('/api/referentiels/versions/:id/activer', async (requete, reponse) => {
    return executerRouteProtegeeReferentielAcademique(
      dependances,
      requete,
      reponse,
      () => dependances.executerRouteIdempotente(
        requete,
        () => dependances.controleurReferentielsAcademiques
          .activerVersionReferentiel(requete.params, requete.body, requete.context),
        {
          operation: 'ACTIVER_VERSION_REFERENTIEL',
        },
      ),
    );
  });

  serveur.post('/api/referentiels/comparer', async (requete, reponse) => {
    return executerRouteProtegeeReferentielAcademique(
      dependances,
      requete,
      reponse,
      () => dependances.controleurReferentielsAcademiques
        .comparerDeuxVersionsReferentiel(requete.body, requete.context),
    );
  });

  serveur.get('/api/referentiels/programmes', async (requete, reponse) => {
    return executerRouteProtegeeReferentielAcademique(
      dependances,
      requete,
      reponse,
      () => dependances.controleurReferentielsAcademiques
        .listerReferentielsProgrammes(requete.query, requete.context),
    );
  });

  serveur.get('/api/referentiels/cours', async (requete, reponse) => {
    return executerRouteProtegeeReferentielAcademique(
      dependances,
      requete,
      reponse,
      () => dependances.controleurReferentielsAcademiques
        .listerReferentielsCours(requete.query, requete.context),
    );
  });

  serveur.get('/api/referentiels/programmes/:id', async (requete, reponse) => {
    return executerRouteProtegeeReferentielAcademique(
      dependances,
      requete,
      reponse,
      () => dependances.controleurReferentielsAcademiques
        .consulterReferentielProgramme(requete.params, requete.context),
    );
  });
};
