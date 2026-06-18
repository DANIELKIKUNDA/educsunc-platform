import type { MonitoringContextInputDto, SystemStateDto } from '../../application';
import { ApplicationHealthMonitoringService } from '../../application';

// Ce fichier declare le runtime de sante Monitoring.

export class RuntimeHealthMonitoring {
  constructor(private readonly healthService: ApplicationHealthMonitoringService) {}

  public async calculerEtat(contexte: MonitoringContextInputDto): Promise<SystemStateDto> {
    return this.healthService.calculerEtat(contexte);
  }
}
