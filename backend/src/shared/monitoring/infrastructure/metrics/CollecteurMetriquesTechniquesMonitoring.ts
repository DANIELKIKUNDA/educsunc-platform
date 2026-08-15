import { performance } from 'node:perf_hooks';
import { MetriqueTechnique, ValeurMetrique } from '../../domain';
import type { MonitoringContextInputDto } from '../../application';

let derniereElu = performance.eventLoopUtilization();

// Collecte des metriques runtime directement depuis le processus Node.js.
export class CollecteurMetriquesTechniquesMonitoring {
  public async collecter(contexte: MonitoringContextInputDto): Promise<readonly MetriqueTechnique[]> {
    const maintenant = new Date();
    const memoire = process.memoryUsage();
    const cpu = process.cpuUsage();
    const resource = process.resourceUsage();
    const elu = performance.eventLoopUtilization(derniereElu);
    derniereElu = performance.eventLoopUtilization();
    const contexteCopie = { ...contexte };

    const creer = (nom: string, valeur: number, unite: string): MetriqueTechnique =>
      new MetriqueTechnique({
        nom, source: 'RUNTIME',
        valeur: new ValeurMetrique({ valeur, unite, horodatage: maintenant }).valeur(),
        contexte: contexteCopie,
      });

    return [
      creer('process_uptime_seconds', process.uptime(), 's'),
      creer('process_rss_bytes', memoire.rss, 'bytes'),
      creer('process_heap_used_bytes', memoire.heapUsed, 'bytes'),
      creer('process_heap_total_bytes', memoire.heapTotal, 'bytes'),
      creer('process_external_memory_bytes', memoire.external, 'bytes'),
      creer('process_array_buffers_bytes', memoire.arrayBuffers, 'bytes'),
      creer('process_cpu_user_microseconds', cpu.user, 'us'),
      creer('process_cpu_system_microseconds', cpu.system, 'us'),
      creer('process_max_rss_bytes', resource.maxRSS * 1024, 'bytes'),
      creer('node_event_loop_utilization_ratio', elu.utilization, 'ratio'),
      creer('node_event_loop_active_ms', elu.active, 'ms'),
      creer('node_event_loop_idle_ms', elu.idle, 'ms'),
    ];
  }
}
