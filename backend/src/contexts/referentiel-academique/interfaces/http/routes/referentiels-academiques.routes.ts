import type { FastifyPluginAsync } from 'fastify';
import { ControleurReferentielsAcademiques } from '../controllers/ControleurReferentielsAcademiques';
import { ExecuteurRouteIdempotenteReferentielAcademique } from './ExecutionRouteIdempotenteReferentielAcademique';
import { ExecuteurRouteTenantReferentielAcademique } from './ExecutionRouteTenantReferentielAcademique';

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
    const resultat = await dependances.executerRouteIdempotente(
      requete,
      () => dependances.executerRouteTenant(
        requete,
        () => dependances.controleurReferentielsAcademiques.importerSectionsDepuisJson(requete.body),
      ),
      {
        operation: 'IMPORT_REFERENTIEL_SECTIONS',
      },
    );
    return reponse.code(200).send(resultat);
  });

  serveur.post('/api/referentiels/import-options', async (requete, reponse) => {
    const resultat = await dependances.executerRouteIdempotente(
      requete,
      () => dependances.executerRouteTenant(
        requete,
        () => dependances.controleurReferentielsAcademiques.importerOptionsDepuisJson(requete.body),
      ),
      {
        operation: 'IMPORT_REFERENTIEL_OPTIONS',
      },
    );
    return reponse.code(200).send(resultat);
  });

  serveur.post('/api/referentiels/import-classes', async (requete, reponse) => {
    const resultat = await dependances.executerRouteIdempotente(
      requete,
      () => dependances.executerRouteTenant(
        requete,
        () => dependances.controleurReferentielsAcademiques
          .importerClassesAcademiquesDepuisJson(requete.body),
      ),
      {
        operation: 'IMPORT_REFERENTIEL_CLASSES_ACADEMIQUES',
      },
    );
    return reponse.code(200).send(resultat);
  });

  serveur.post('/api/referentiels/import-cours', async (requete, reponse) => {
    const resultat = await dependances.executerRouteIdempotente(
      requete,
      () => dependances.executerRouteTenant(
        requete,
        () => dependances.controleurReferentielsAcademiques
          .importerCoursAcademiquesDepuisJson(requete.body),
      ),
      {
        operation: 'IMPORT_REFERENTIEL_COURS',
      },
    );
    return reponse.code(200).send(resultat);
  });

  serveur.post('/api/referentiels/import-programmes', async (requete, reponse) => {
    const resultat = await dependances.executerRouteIdempotente(
      requete,
      () => dependances.executerRouteTenant(
        requete,
        () => dependances.controleurReferentielsAcademiques
          .importerProgrammesAcademiquesDepuisJson(requete.body),
      ),
      {
        operation: 'IMPORT_REFERENTIEL_PROGRAMMES',
      },
    );
    return reponse.code(200).send(resultat);
  });

  serveur.post('/api/referentiels/import-lignes', async (requete, reponse) => {
    const resultat = await dependances.executerRouteIdempotente(
      requete,
      () => dependances.executerRouteTenant(
        requete,
        () => dependances.controleurReferentielsAcademiques
          .importerLignesProgrammeDepuisJson(requete.body),
      ),
      {
        operation: 'IMPORT_REFERENTIEL_LIGNES_PROGRAMME',
      },
    );
    return reponse.code(200).send(resultat);
  });

  serveur.post('/api/referentiels/versions', async (requete, reponse) => {
    const resultat = await dependances.executerRouteIdempotente(
      requete,
      () => dependances.executerRouteTenant(
        requete,
        () => dependances.controleurReferentielsAcademiques
          .publierVersionReferentiel(requete.body),
      ),
      {
        operation: 'PUBLIER_VERSION_REFERENTIEL',
      },
    );
    return reponse.code(200).send(resultat);
  });

  serveur.post('/api/referentiels/versions/:id/activer', async (requete, reponse) => {
    const resultat = await dependances.executerRouteIdempotente(
      requete,
      () => dependances.executerRouteTenant(
        requete,
        () => dependances.controleurReferentielsAcademiques
          .activerVersionReferentiel(requete.params, requete.body),
      ),
      {
        operation: 'ACTIVER_VERSION_REFERENTIEL',
      },
    );
    return reponse.code(200).send(resultat);
  });

  serveur.post('/api/referentiels/comparer', async (requete, reponse) => {
    const resultat = await dependances.executerRouteTenant(
      requete,
      () => dependances.controleurReferentielsAcademiques
        .comparerDeuxVersionsReferentiel(requete.body),
    );
    return reponse.code(200).send(resultat);
  });

  serveur.get('/api/referentiels/programmes', async (requete, reponse) => {
    const resultat = await dependances.executerRouteTenant(
      requete,
      () => dependances.controleurReferentielsAcademiques
        .listerReferentielsProgrammes(requete.query),
    );
    return reponse.code(200).send(resultat);
  });

  serveur.get('/api/referentiels/programmes/:id', async (requete, reponse) => {
    const resultat = await dependances.executerRouteTenant(
      requete,
      () => dependances.controleurReferentielsAcademiques
        .consulterReferentielProgramme(requete.params),
    );
    return reponse.code(200).send(resultat);
  });
};
