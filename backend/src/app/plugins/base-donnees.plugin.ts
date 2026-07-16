import type { FastifyPluginAsync } from 'fastify';
import { MigrateurPostgresAuth, obtenirPoolPostgresAuth } from '../../shared/auth/infrastructure';

type PluginGlobal = FastifyPluginAsync & { nom: string };

// Ce plugin reserve l etape d initialisation transverse de la persistence.
export const baseDonneesPlugin: PluginGlobal = Object.assign(
  async (serveur: Parameters<FastifyPluginAsync>[0]) => {
    try {
      await new MigrateurPostgresAuth(obtenirPoolPostgresAuth()).executerToutes();
      serveur.log.info({ composant: 'auth' }, 'Migrations PostgreSQL Auth appliquees.');
    } catch (erreur) {
      serveur.log.error(
        {
          composant: 'auth',
          erreur: erreur instanceof Error ? erreur.message : 'postgres_auth_migration_failed',
        },
        'Echec des migrations PostgreSQL Auth.',
      );
      throw erreur;
    }
  },
  {
    nom: 'base-donnees',
  },
);
