import type { FastifyPluginAsync } from 'fastify';
import { ControleurCalendriersAcademiques } from '../controllers/ControleurCalendriersAcademiques';
import { ExecuteurRouteIdempotenteReferentielAcademique } from './ExecutionRouteIdempotenteReferentielAcademique';
import { ExecuteurRouteTenantReferentielAcademique } from './ExecutionRouteTenantReferentielAcademique';

// Cette interface regroupe les dependances des routes calendriers academiques.
export interface DependancesRoutesCalendriersAcademiques {
  controleurCalendriersAcademiques: ControleurCalendriersAcademiques;
  executerRouteTenant: ExecuteurRouteTenantReferentielAcademique;
  executerRouteIdempotente: ExecuteurRouteIdempotenteReferentielAcademique;
}

// Cette fonction cree les routes HTTP des calendriers academiques.
export const creerRoutesCalendriersAcademiques = (
  dependances: DependancesRoutesCalendriersAcademiques,
): FastifyPluginAsync => async (serveur) => {
  serveur.post('/api/calendriers-academiques', async (requete, reponse) => {
    const resultat = await dependances.executerRouteIdempotente(
      requete,
      () => dependances.executerRouteTenant(
        requete,
        () => dependances.controleurCalendriersAcademiques
          .creerCalendrierAcademique(requete.body),
        {
          mode: 'tenant_requis',
          clesTenant: ['idEcole'],
        },
      ),
      {
        operation: 'CREER_CALENDRIER_ACADEMIQUE',
      },
    );
    return reponse.code(200).send(resultat);
  });

  serveur.patch('/api/calendriers-academiques/:id/periodes/:code', async (requete, reponse) => {
    const resultat = await dependances.executerRouteTenant(
      requete,
      () => dependances.controleurCalendriersAcademiques
        .modifierPeriodeCalendrier(requete.params, requete.body),
      {
        mode: 'tenant_requis',
      },
    );
    return reponse.code(200).send(resultat);
  });

  serveur.post('/api/calendriers-academiques/:id/valider', async (requete, reponse) => {
    const resultat = await dependances.executerRouteTenant(
      requete,
      () => dependances.controleurCalendriersAcademiques
        .validerCalendrierAcademique(requete.params, requete.body),
      {
        mode: 'tenant_requis',
      },
    );
    return reponse.code(200).send(resultat);
  });

  serveur.post('/api/calendriers-academiques/:id/verrouiller', async (requete, reponse) => {
    const resultat = await dependances.executerRouteTenant(
      requete,
      () => dependances.controleurCalendriersAcademiques
        .verrouillerCalendrierAcademique(requete.params, requete.body),
      {
        mode: 'tenant_requis',
      },
    );
    return reponse.code(200).send(resultat);
  });

  serveur.get('/api/calendriers-academiques/:id', async (requete, reponse) => {
    const resultat = await dependances.executerRouteTenant(
      requete,
      () => dependances.controleurCalendriersAcademiques
        .consulterCalendrierAcademique(requete.params),
      {
        mode: 'lecture_organisationnelle_ou_tenant',
      },
    );
    return reponse.code(200).send(resultat);
  });
};
