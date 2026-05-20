import type { ChangerEcoleActiveInput, ChangerOrganisationActiveInput } from '../dto/input';
import type { ContexteActifOutput } from '../dto/output';
import type { SecurityTransactionPort } from '../ports';
import { SecurityContextService } from '../services/SecurityContextService';

// Cette saga garantit les transactions autour des changements de contexte actif.
export class SagaContexteActif {
  constructor(
    private readonly securityTransactionPort: SecurityTransactionPort,
    private readonly securityContextService: SecurityContextService,
  ) {}

  public async changerOrganisationActive(input: ChangerOrganisationActiveInput): Promise<ContexteActifOutput> {
    return this.securityTransactionPort.executerDansTransaction(() => this.securityContextService.changerOrganisationActive(input));
  }

  public async changerEcoleActive(input: ChangerEcoleActiveInput): Promise<ContexteActifOutput> {
    return this.securityTransactionPort.executerDansTransaction(() => this.securityContextService.changerEcoleActive(input));
  }
}
