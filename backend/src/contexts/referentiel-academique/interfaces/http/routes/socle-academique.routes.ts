import type { FastifyPluginAsync } from 'fastify';
import type { DependancesRoutesStructureScolaire } from './structure-scolaire.routes';

// Cette fonction regroupe les routes du socle academique officiel sans changer les URL existantes.
export const creerRoutesSocleAcademique = (
  dependances: DependancesRoutesStructureScolaire,
): FastifyPluginAsync => async (serveur) => {
  serveur.post('/api/sections-scolaires', async (requete, reponse) => {
    const resultat = await dependances.executerRouteTenant(
      requete,
      () => dependances.controleurStructureScolaire.creerSectionScolaire(
        requete.body,
        requete.context,
      ),
    );
    return reponse.code(200).send(resultat);
  });

  serveur.post('/api/classes-academiques', async (requete, reponse) => {
    const resultat = await dependances.executerRouteTenant(
      requete,
      () => dependances.controleurStructureScolaire.creerClasseAcademique(
        requete.body,
        requete.context,
      ),
    );
    return reponse.code(200).send(resultat);
  });

  serveur.post('/api/options-etudes', async (requete, reponse) => {
    const resultat = await dependances.executerRouteTenant(
      requete,
      () => dependances.controleurStructureScolaire.creerOptionEtude(
        requete.body,
        requete.context,
      ),
    );
    return reponse.code(200).send(resultat);
  });

  serveur.get('/api/classes-academiques', async (requete, reponse) => {
    const resultat = await dependances.executerRouteTenant(
      requete,
      () => dependances.controleurStructureScolaire.listerClassesAcademiques(
        requete.query,
        requete.context,
      ),
    );
    return reponse.code(200).send(resultat);
  });

  serveur.get('/api/sections-scolaires', async (requete, reponse) => {
    const resultat = await dependances.executerRouteTenant(
      requete,
      () => dependances.controleurStructureScolaire.listerSectionsScolaires(
        requete.query,
        requete.context,
      ),
    );
    return reponse.code(200).send(resultat);
  });

  serveur.get('/api/options-etudes', async (requete, reponse) => {
    const resultat = await dependances.executerRouteTenant(
      requete,
      () => dependances.controleurStructureScolaire.listerOptionsEtudes(
        requete.query,
        requete.context,
      ),
    );
    return reponse.code(200).send(resultat);
  });
};
