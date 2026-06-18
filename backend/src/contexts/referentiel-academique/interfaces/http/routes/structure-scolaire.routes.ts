import type { FastifyPluginAsync } from 'fastify';
import { ControleurStructureScolaire } from '../controllers/ControleurStructureScolaire';
import { ExecuteurRouteIdempotenteReferentielAcademique } from './ExecutionRouteIdempotenteReferentielAcademique';
import { ExecuteurRouteTenantReferentielAcademique } from './ExecutionRouteTenantReferentielAcademique';

// Cette interface regroupe les dependances des routes de structure scolaire.
export interface DependancesRoutesStructureScolaire {
  controleurStructureScolaire: ControleurStructureScolaire;
  executerRouteTenant: ExecuteurRouteTenantReferentielAcademique;
  executerRouteIdempotente: ExecuteurRouteIdempotenteReferentielAcademique;
}

// Cette fonction cree les routes HTTP de la structure scolaire.
export const creerRoutesStructureScolaire = (
  dependances: DependancesRoutesStructureScolaire,
): FastifyPluginAsync => async (serveur) => {
  serveur.post('/api/classes-pedagogiques', async (requete, reponse) => {
    const resultat = await dependances.executerRouteIdempotente(
      requete,
      () => dependances.executerRouteTenant(
        requete,
        () => dependances.controleurStructureScolaire.creerClassePedagogique(
          requete.body,
        ),
        {
          mode: 'tenant_requis',
          clesTenant: ['idEcole'],
        },
      ),
      {
        operation: 'CREER_CLASSE_PEDAGOGIQUE',
      },
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

  serveur.get('/api/classes-pedagogiques/:id/regles-frais', async (requete, reponse) => {
    const resultat = await dependances.executerRouteTenant(
      requete,
      () => dependances.controleurStructureScolaire.consulterReglesFraisClasse(
        requete.params,
      ),
      {
        mode: 'tenant_requis',
      },
    );
    return reponse.code(200).send(resultat);
  });

  serveur.post('/api/classes-pedagogiques/:id/responsable', async (requete, reponse) => {
    const resultat = await dependances.executerRouteTenant(
      requete,
      () => dependances.controleurStructureScolaire.attribuerResponsableClassePedagogique(
        requete.params,
        requete.body,
      ),
      {
        mode: 'tenant_requis',
      },
    );
    return reponse.code(200).send(resultat);
  });

  serveur.get('/api/classes-pedagogiques/:id/responsable/annee/:idAnneeScolaire', async (requete, reponse) => {
    const resultat = await dependances.executerRouteTenant(
      requete,
      () => dependances.controleurStructureScolaire.consulterResponsableClassePedagogique(
        requete.params,
      ),
      {
        mode: 'tenant_requis',
      },
    );
    return reponse.code(200).send(resultat);
  });

  serveur.delete('/api/classes-pedagogiques/:id/responsable/annee/:idAnneeScolaire', async (requete, reponse) => {
    const resultat = await dependances.executerRouteTenant(
      requete,
      () => dependances.controleurStructureScolaire.retirerResponsableClassePedagogique(
        requete.params,
      ),
      {
        mode: 'tenant_requis',
      },
    );
    return reponse.code(200).send(resultat);
  });

  serveur.patch('/api/classes-pedagogiques/:id/renommer', async (requete, reponse) => {
    const resultat = await dependances.executerRouteTenant(
      requete,
      () => dependances.controleurStructureScolaire.renommerClassePedagogique(
        requete.params,
        requete.body,
      ),
      {
        mode: 'tenant_requis',
      },
    );
    return reponse.code(200).send(resultat);
  });

  serveur.post('/api/classes-pedagogiques/:id/desactiver', async (requete, reponse) => {
    const resultat = await dependances.executerRouteTenant(
      requete,
      () => dependances.controleurStructureScolaire.desactiverClassePedagogique(
        requete.params,
        requete.body,
      ),
      {
        mode: 'tenant_requis',
      },
    );
    return reponse.code(200).send(resultat);
  });

  serveur.post('/api/classes-pedagogiques/:id/archiver', async (requete, reponse) => {
    const resultat = await dependances.executerRouteTenant(
      requete,
      () => dependances.controleurStructureScolaire.archiverClassePedagogique(
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
