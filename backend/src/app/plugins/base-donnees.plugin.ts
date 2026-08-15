import type { FastifyPluginAsync } from 'fastify';
import { MigrateurPostgresAuth, obtenirPoolPostgresAuth } from '../../shared/auth/infrastructure';
import { MigrateurPostgresAudit } from '../../shared/audit/infrastructure';
import { MigrateurPostgresSecurity } from '../../shared/security/infrastructure';
import { migrerPostgresMonitoring } from '../../shared/monitoring/infrastructure';

type PluginGlobal = FastifyPluginAsync & { nom: string };

// Ce plugin reserve l etape d initialisation transverse de la persistence.
export const baseDonneesPlugin: PluginGlobal = Object.assign(
  async (serveur: Parameters<FastifyPluginAsync>[0]) => {
    const poolPostgres = obtenirPoolPostgresAuth();

    try {
      await new MigrateurPostgresAuth(poolPostgres).executerToutes();
      await new MigrateurPostgresAudit(poolPostgres).executerToutes();
      await new MigrateurPostgresSecurity(poolPostgres).executerToutes();
      await migrerPostgresMonitoring(poolPostgres);
      serveur.log.info(
        { composant: 'base-donnees' },
        'Migrations PostgreSQL transverses appliquees (Auth, Audit, Security, Monitoring).',
      );
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

    serveur.addHook('onClose', async () => {
      await poolPostgres.end();
      serveur.log.info({ composant: 'postgres' }, 'Pool PostgreSQL partage ferme.');
    });
  },
  {
    nom: 'base-donnees',
  },
);
