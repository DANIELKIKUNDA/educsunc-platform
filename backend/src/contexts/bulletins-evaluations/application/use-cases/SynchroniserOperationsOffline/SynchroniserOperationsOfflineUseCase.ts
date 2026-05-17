import type { SynchroniserOperationOfflineInput } from '../../dto/input/SynchroniserOperationOfflineInput';
import type { SynchronisationOutput } from '../../dto/output/SynchronisationOutput';
import { ServiceSynchronisationOffline } from '../../services/ServiceSynchronisationOffline';

// Ce use case orchestre le rejeu applicatif d'une operation offline.
export class SynchroniserOperationsOfflineUseCase {
  constructor(private readonly serviceSynchronisationOffline: ServiceSynchronisationOffline) {}

  // Cette methode marque l'operation comme synchronisee apres traitement.
  public async executer(input: SynchroniserOperationOfflineInput): Promise<SynchronisationOutput> {
    await this.serviceSynchronisationOffline.enregistrer({
      idOperationOffline: input.idOperationOffline,
      typeOperation: input.typeOperation,
      payload: input.payload,
      dateEmission: new Date(),
    });

    return this.serviceSynchronisationOffline.marquerSynchronisee(input.idOperationOffline);
  }
}
