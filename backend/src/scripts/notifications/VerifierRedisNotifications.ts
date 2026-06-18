import '../../config/variables-environnement.config';
import {
  ConfigurationRedisShared,
  FabriqueConnexionRedisShared,
} from '../../shared/infrastructure/redis';

// Ce script verifie si le module Notifications peut joindre Redis dans le mode configure.

const executer = async (): Promise<void> => {
  const configuration = ConfigurationRedisShared.lireDepuisEnvironnement();
  const clientRedisShared = FabriqueConnexionRedisShared.obtenirClient(configuration);

  try {
    await clientRedisShared.connecter();
    const ping = await clientRedisShared.ping();
    const etat = clientRedisShared.observerEtat();

    console.log(
      JSON.stringify(
        {
          verification: 'notifications.redis',
          succes: true,
          ping,
          modeConnexion: configuration.modeConnexion,
          modeSimulationActif: etat.modeSimulation,
          host: etat.host,
          port: etat.port,
          database: etat.database,
          prefixCle: etat.prefixCle,
          derniereErreur: etat.derniereErreur ?? null,
        },
        null,
        2,
      ),
    );
  } catch (erreur) {
    const message = erreur instanceof Error ? erreur.message : 'Echec Redis inconnu.';
    console.error(
      JSON.stringify(
        {
          verification: 'notifications.redis',
          succes: false,
          modeConnexion: configuration.modeConnexion,
          erreur: message,
        },
        null,
        2,
      ),
    );
    process.exitCode = 1;
  } finally {
    await clientRedisShared.deconnecter();
  }
};

void executer();
