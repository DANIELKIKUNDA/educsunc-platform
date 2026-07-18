import { AuditAlertService } from '../../monitoring';
import { AuditAntiTamperingService } from '../anti-tampering/AuditAntiTamperingService';
import { AuditAntiFalsificationService } from '../anti-falsification/AuditAntiFalsificationService';

export class AuditSecurityMonitoringService {
  public constructor(
    private readonly alerts: AuditAlertService = new AuditAlertService(),
    private readonly tampering: AuditAntiTamperingService = new AuditAntiTamperingService(),
    private readonly falsification: AuditAntiFalsificationService = new AuditAntiFalsificationService(),
  ) {}

  public async obtenirSnapshot() {
    return {
      alerts: this.alerts.detecter(),
      tampering: await this.tampering.detecter(),
      falsification: this.falsification.detecter(),
    };
  }
}
