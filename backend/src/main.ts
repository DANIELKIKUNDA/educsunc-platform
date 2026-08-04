import './config/variables-environnement.config';
import { createServer } from './app/serveur';
import { configurationApplication } from './config/app.config';
import { InfrastructureError } from './shared/exceptions/InfrastructureError';
import { PinoLogger } from './shared/infrastructure/logger/PinoLogger';
import { installerArretGracieux } from './app/lifecycle/arret-gracieux';

// Normalise l'erreur pour la journalisation.
const normaliserErreur = (erreur: unknown): Record<string, unknown> => {
  if (erreur instanceof Error) {
    return {
      nom: erreur.name,
      message: erreur.message,
      stack: erreur.stack,
    };
    
  }

  return {
    valeur: erreur,
  };
};

// Demarre le backend avec gestion propre des erreurs.
const demarrer = async (): Promise<void> => {
  let serveur: ReturnType<typeof createServer> | undefined;
  const loggerSecours = new PinoLogger();

  try {
    serveur = createServer();

    const adresse = await serveur.listen({
      host: configurationApplication.host,
      port: configurationApplication.port,
    });

    serveur.log.info(
      {
        adresse,
        environnement: configurationApplication.environnement,
        port: configurationApplication.port,
      },
      'Serveur demarre.',
    );
    installerArretGracieux(serveur);
  } catch (erreur) {
    const erreurDemarrage = new InfrastructureError(
      'Echec du demarrage du serveur.',
      'SERVER_START_ERROR',
      {
        cause: normaliserErreur(erreur),
      },
    );

    if (serveur) {
      serveur.log.error(
        {
          code: erreurDemarrage.code,
          metadata: erreurDemarrage.metadata,
        },
        erreurDemarrage.message,
      );

      await serveur.close().catch(() => undefined);
    } else {
      loggerSecours.error(erreurDemarrage.message, {
        code: erreurDemarrage.code,
        metadata: erreurDemarrage.metadata,
      });
    }

    process.exitCode = 1;
  }
};

void demarrer();
