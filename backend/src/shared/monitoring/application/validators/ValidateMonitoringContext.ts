import { SpecificationContexteMonitoringValide } from '../../domain';
import type { MonitoringContextInputDto } from '../dto/input';
import { MonitoringValidationException } from '../exceptions';
import { MonitoringContextMapper } from '../mappers';

// Ce fichier declare le validateur de contexte Monitoring.

/** Cette classe valide les contextes Monitoring. */
export class ValidateMonitoringContext {
  constructor(
    private readonly mapper = new MonitoringContextMapper(),
    private readonly specification = new SpecificationContexteMonitoringValide(),
  ) {}

  /** Cette methode valide un contexte Monitoring. */
  public valider(contexte: MonitoringContextInputDto): void {
    if (!this.specification.estSatisfaite(this.mapper.versContexte(contexte))) {
      throw new MonitoringValidationException('Le contexte Monitoring fourni est insuffisant.');
    }
  }
}
