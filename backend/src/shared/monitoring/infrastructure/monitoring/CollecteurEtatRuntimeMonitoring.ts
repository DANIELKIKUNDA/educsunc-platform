import { Queue } from 'bullmq';
import type { ConfigurationConnexionRedisShared } from '../../../infrastructure/redis';
import { EtatRuntime } from '../../domain';
import type { MonitoringContextInputDto } from '../../application';

const QUEUES_NOTIFICATIONS = [
  'notifications.dispatch',
  'notifications.retry',
  'notifications.replay',
  'notifications.escalade',
  'notifications.dead-letter',
] as const;

// Observe les files BullMQ existantes sans creer de jobs ni de workers.
export class CollecteurEtatRuntimeMonitoring {
  constructor(private readonly redisConfiguration?: ConfigurationConnexionRedisShared) {}

  public async collecter(_contexte: MonitoringContextInputDto): Promise<EtatRuntime> {
    if (!this.redisConfiguration || this.redisConfiguration.modeConnexion === 'simulation') {
      return this.inconnuOuSimule(Boolean(this.redisConfiguration));
    }

    const noms = this.lireNomsQueues();
    if (noms.length === 0) return this.inconnuOuSimule(false);

    const queues = noms.map((nom) => new Queue(nom, {
      prefix: nom.startsWith('notifications.') ? 'educsyn.notifications' : undefined,
      connection: this.connexionBullMq(),
    }));

    try {
      const snapshots = await Promise.all(queues.map(async (queue) => {
        const [counts, workers] = await Promise.all([
          queue.getJobCounts('waiting', 'active', 'completed', 'failed', 'delayed'),
          queue.getWorkersCount(),
        ]);
        return { nom: queue.name, counts, workers };
      }));
      return CollecteurEtatRuntimeMonitoring.evaluerSnapshots(snapshots);
    } catch {
      return new EtatRuntime({
        niveau: 'CRITICAL', filesActives: [], workersActifs: [], jobsEnCours: 0, jobsEnRetard: 0, misAJourLe: new Date(),
      });
    } finally {
      await Promise.allSettled(queues.map((queue) => queue.close()));
    }
  }

  public static evaluerSnapshots(snapshots: readonly { nom: string; counts: Record<string, number>; workers: number }[]): EtatRuntime {
    const jobsEnCours = snapshots.reduce((total, s) => total + (s.counts.active ?? 0), 0);
    const jobsEnRetard = snapshots.reduce((total, s) => total + (s.counts.waiting ?? 0) + (s.counts.delayed ?? 0), 0);
    const failed = snapshots.reduce((total, s) => total + (s.counts.failed ?? 0), 0);
    const workers = snapshots.filter((s) => s.workers > 0).map((s) => `${s.nom}:${s.workers}`);
    const workerMort = snapshots.some((s) => s.workers === 0 && ((s.counts.waiting ?? 0) + (s.counts.active ?? 0)) > 0);
    const queueSaturee = snapshots.some((s) => (s.counts.waiting ?? 0) + (s.counts.delayed ?? 0) > 0);
    const niveau = workerMort || queueSaturee || failed > 0 ? 'DEGRADED' : 'HEALTHY';
    return new EtatRuntime({ niveau, filesActives: snapshots.map((s) => s.nom), workersActifs: workers, jobsEnCours, jobsEnRetard, misAJourLe: new Date() });
  }

  private lireNomsQueues(): string[] {
    const configurees = String(process.env.EDUCSYN_MONITORING_BULLMQ_QUEUES ?? '').split(',').map((v) => v.trim()).filter(Boolean);
    return configurees.length > 0 ? [...new Set(configurees)] : [...QUEUES_NOTIFICATIONS];
  }

  private connexionBullMq(): { host: string; port: number; username?: string; password?: string; db: number; tls?: Record<string, never>; connectTimeout: number } {
    const c = this.redisConfiguration!;
    return {
      host: c.host, port: c.port, username: c.username, password: c.password, db: c.database,
      ...(c.tlsActive ? { tls: {} } : {}), connectTimeout: c.timeoutConnexionMs,
    };
  }

  private inconnuOuSimule(simulation: boolean): EtatRuntime {
    return new EtatRuntime({
      niveau: simulation ? 'DEGRADED' : 'UNKNOWN', filesActives: [], workersActifs: [], jobsEnCours: 0, jobsEnRetard: 0, misAJourLe: new Date(),
    });
  }
}
