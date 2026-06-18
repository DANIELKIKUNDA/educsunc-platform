import type { CaptureTraceCommand } from '../commands';
import { MonitoringValidationException } from '../exceptions';

// Ce fichier declare le validateur de capture de trace.

/** Cette classe valide la capture applicative d une trace. */
export class ValidateTraceCapture {
  /** Cette methode valide une commande de trace. */
  public valider(commande: CaptureTraceCommand): void {
    if (!commande.traceId || !commande.operation || commande.dureeMillisecondes < 0) {
      throw new MonitoringValidationException('La commande de capture de trace est invalide.');
    }
  }
}
