import { envelopperReponse, extraireContexteRuntime } from './AuditControllerSupport';
import type { AuditHttpControllerResponse, AuditHttpRequest } from './HttpAuditControllerTypes';
import { AuditHealthValidator } from '../validators';

export class AuditHealthController {
  public constructor(
    private readonly obtenirHealthGlobal: (() => Promise<unknown>) | undefined = undefined,
    private readonly obtenirHealthQueues: (() => Promise<unknown>) | undefined = undefined,
    private readonly obtenirHealthProjections: (() => Promise<unknown>) | undefined = undefined,
    private readonly obtenirHealthSynchronization: (() => Promise<unknown>) | undefined = undefined,
  ) {}

  public async health(requete: AuditHttpRequest): Promise<AuditHttpControllerResponse<unknown>> {
    AuditHealthValidator.valider();
    return this.executer(this.obtenirHealthGlobal, requete, { statut: 'OK', composant: 'audit' });
  }
  public async queues(requete: AuditHttpRequest): Promise<AuditHttpControllerResponse<unknown>> {
    AuditHealthValidator.valider();
    return this.executer(this.obtenirHealthQueues, requete, { statut: 'OK', composant: 'queues' });
  }
  public async projections(requete: AuditHttpRequest): Promise<AuditHttpControllerResponse<unknown>> {
    AuditHealthValidator.valider();
    return this.executer(this.obtenirHealthProjections, requete, { statut: 'OK', composant: 'projections' });
  }
  public async synchronization(requete: AuditHttpRequest): Promise<AuditHttpControllerResponse<unknown>> {
    AuditHealthValidator.valider();
    return this.executer(this.obtenirHealthSynchronization, requete, { statut: 'OK', composant: 'synchronization' });
  }

  private async executer(
    dependance: (() => Promise<unknown>) | undefined,
    requete: AuditHttpRequest,
    fallback: unknown,
  ): Promise<AuditHttpControllerResponse<unknown>> {
    const startedAt = Date.now();
    const contexte = extraireContexteRuntime(requete);
    const sortie = dependance ? await dependance() : fallback;
    return envelopperReponse(sortie, contexte, startedAt);
  }
}
