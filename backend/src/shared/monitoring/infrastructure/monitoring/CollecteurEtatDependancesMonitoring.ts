import type { Pool } from 'pg';
import type { ClientRedisShared } from '../../../infrastructure/redis';
import { EtatDependance } from '../../domain';
import type { MonitoringContextInputDto } from '../../application';

const TIMEOUT_SONDE_MS = 2_000;

async function avecTimeout<T>(operation: Promise<T>, timeoutMs = TIMEOUT_SONDE_MS): Promise<T> {
  let timer: NodeJS.Timeout | undefined;
  try {
    return await Promise.race([
      operation,
      new Promise<T>((_, reject) => {
        timer = setTimeout(() => reject(new Error('monitoring_probe_timeout')), timeoutMs);
        timer.unref?.();
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

// Sondes de dependances reelles. Une simulation est toujours DEGRADED et une absence de sonde UNKNOWN.
export class CollecteurEtatDependancesMonitoring {
  constructor(
    private readonly poolPostgres?: Pool,
    private readonly redis?: ClientRedisShared,
    private readonly timeoutSondeMs: number = TIMEOUT_SONDE_MS,
  ) {}

  public async collecter(_contexte: MonitoringContextInputDto): Promise<readonly EtatDependance[]> {
    return Promise.all([this.collecterPostgres(), this.collecterRedis()]);
  }

  private async collecterPostgres(): Promise<EtatDependance> {
    const verifieLe = new Date();
    if (!this.poolPostgres) {
      return new EtatDependance({
        nom: 'postgresql', source: 'DATABASE', niveau: 'UNKNOWN', disponible: false,
        message: 'Sonde PostgreSQL non raccordee', verifieLe,
      });
    }

    const debut = process.hrtime.bigint();
    try {
      await avecTimeout(this.poolPostgres.query('SELECT 1 AS monitoring_health'), this.timeoutSondeMs);
      const latenceMs = Number(process.hrtime.bigint() - debut) / 1_000_000;
      return new EtatDependance({
        nom: 'postgresql', source: 'DATABASE', niveau: latenceMs > 1_000 ? 'DEGRADED' : 'HEALTHY', disponible: true,
        message: `SELECT 1 OK; latence=${latenceMs.toFixed(1)}ms; pool total=${this.poolPostgres.totalCount} idle=${this.poolPostgres.idleCount} waiting=${this.poolPostgres.waitingCount}`,
        verifieLe,
      });
    } catch (erreur) {
      const timeout = erreur instanceof Error && erreur.message === 'monitoring_probe_timeout';
      return new EtatDependance({
        nom: 'postgresql', source: 'DATABASE', niveau: timeout ? 'CRITICAL' : 'CRITICAL', disponible: false,
        message: timeout ? 'Sonde PostgreSQL en timeout' : 'PostgreSQL inaccessible', verifieLe,
      });
    }
  }

  private async collecterRedis(): Promise<EtatDependance> {
    const verifieLe = new Date();
    if (!this.redis) {
      return new EtatDependance({
        nom: 'redis', source: 'CACHE', niveau: 'UNKNOWN', disponible: false,
        message: 'Sonde Redis non raccordee', verifieLe,
      });
    }

    const debut = process.hrtime.bigint();
    try {
      await avecTimeout(this.redis.connecter(), this.timeoutSondeMs);
      const etat = this.redis.observerEtat();
      if (etat.modeSimulation) {
        return new EtatDependance({
          nom: 'redis', source: 'CACHE', niveau: 'DEGRADED', disponible: false,
          message: 'Redis fonctionne en mode simulation; aucune sante reelle ne peut etre affirmee', verifieLe,
        });
      }
      await avecTimeout(this.redis.ping(), this.timeoutSondeMs);
      const latenceMs = Number(process.hrtime.bigint() - debut) / 1_000_000;
      return new EtatDependance({
        nom: 'redis', source: 'CACHE', niveau: latenceMs > 500 ? 'DEGRADED' : 'HEALTHY', disponible: true,
        message: `PING PONG; latence=${latenceMs.toFixed(1)}ms`, verifieLe,
      });
    } catch (erreur) {
      const timeout = erreur instanceof Error && erreur.message === 'monitoring_probe_timeout';
      return new EtatDependance({
        nom: 'redis', source: 'CACHE', niveau: 'CRITICAL', disponible: false,
        message: timeout ? 'Sonde Redis en timeout' : 'Redis inaccessible', verifieLe,
      });
    }
  }
}
