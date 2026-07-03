import type { FastifyPluginAsync } from 'fastify';
import type { DependancesRoutesStructureScolaire } from './structure-scolaire.routes';
import { executerRouteProtegeeReferentielAcademique } from './ExecutionRouteProtegeeReferentielAcademique';

// Cette fonction regroupe les routes du socle academique officiel sans changer les URL existantes.
export const creerRoutesSocleAcademique = (
  dependances: DependancesRoutesStructureScolaire,
): FastifyPluginAsync => async (serveur) => {
  serveur.post('/api/sections-scolaires', async (requete, reponse) => {
    return executerRouteProtegeeReferentielAcademique(dependances, requete, reponse, () =>
      dependances.controleurStructureScolaire.creerSectionScolaire(
        requete.body,
        requete.context,
      ),
    );
  });

  serveur.post('/api/classes-academiques', async (requete, reponse) => {
    return executerRouteProtegeeReferentielAcademique(dependances, requete, reponse, () =>
      dependances.controleurStructureScolaire.creerClasseAcademique(
        requete.body,
        requete.context,
      ),
    );
  });

  serveur.post('/api/options-etudes', async (requete, reponse) => {
    return executerRouteProtegeeReferentielAcademique(dependances, requete, reponse, () =>
      dependances.controleurStructureScolaire.creerOptionEtude(
        requete.body,
        requete.context,
      ),
    );
  });

  serveur.get('/api/classes-academiques', async (requete, reponse) => {
    return executerRouteProtegeeReferentielAcademique(dependances, requete, reponse, () =>
      dependances.controleurStructureScolaire.listerClassesAcademiques(
        requete.query,
        requete.context,
      ),
    );
  });

  serveur.get('/api/sections-scolaires', async (requete, reponse) => {
    return executerRouteProtegeeReferentielAcademique(dependances, requete, reponse, () =>
      dependances.controleurStructureScolaire.listerSectionsScolaires(
        requete.query,
        requete.context,
      ),
    );
  });

  serveur.get('/api/options-etudes', async (requete, reponse) => {
    return executerRouteProtegeeReferentielAcademique(dependances, requete, reponse, () =>
      dependances.controleurStructureScolaire.listerOptionsEtudes(
        requete.query,
        requete.context,
      ),
    );
  });
};
