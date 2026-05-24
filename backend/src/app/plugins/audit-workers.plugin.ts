import type { FastifyPluginAsync } from 'fastify';

type PluginGlobal = FastifyPluginAsync & { nom: string };

// Ce plugin prepare la couche workers Audit pour replay, retry, exports, retention et projections.
export const auditWorkersPlugin: PluginGlobal = Object.assign(
  async (serveur: Parameters<FastifyPluginAsync>[0]) => {
    serveur.addHook('onReady', async () => {
      const bootstrapJob = serveur.audit.workersIntegration.creerJob(
        'MonitoringRefreshJob',
        'MONITORING',
        {},
        {
          jobId: `audit-bootstrap-${Date.now()}`,
          queueName: 'MONITORING',
          workerName: 'MonitoringWorker',
          source: 'AUDIT_BOOTSTRAP',
          correlationId: 'AUDIT_BOOTSTRAP',
          createdAt: new Date().toISOString(),
          scope: 'PLATEFORME',
          retryCount: 0,
          retryLimit: 3,
          retryBackoffMs: 1_000,
          retryHistory: [],
        },
      );
      await serveur.audit.workersIntegration.enqueue(bootstrapJob);

      serveur.log.info(
        {
          contexte: {
            plugin: 'audit-workers',
            snapshotQueues: serveur.audit.workersIntegration.obtenirMonitoring(),
          },
        },
        'Workers Audit prepares et relies au runtime.',
      );
    });
  },
  {
    nom: 'audit-workers',
  },
);
