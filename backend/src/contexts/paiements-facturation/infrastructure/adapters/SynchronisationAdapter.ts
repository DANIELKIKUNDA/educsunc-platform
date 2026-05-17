import type {
  OperationSynchronisableInput,
  SynchronisationPort,
} from '../../application/ports/SynchronisationPort';
import type { ServiceSynchronisation } from '../../../../shared/infrastructure/sync/SyncService';

// Ce fichier branche le BC Paiements sur le moteur shared de synchronisation sans le dupliquer.
export class SynchronisationAdapter implements SynchronisationPort {
  // Ce constructeur recoit le service transverse shared facultatif.
  constructor(
    private readonly serviceSynchronisation?: ServiceSynchronisation,
  ) {}

  // Cette methode enregistre une operation synchronisable exploitable par l'offline-first.
  public async enregistrerOperationSynchronisable(
    input: OperationSynchronisableInput,
  ): Promise<void> {
    if (this.serviceSynchronisation === undefined) {
      return;
    }

    await this.serviceSynchronisation.pousser([input], {
      bc: 'paiements-facturation',
      idEcole: input.idEcole,
      referenceMetier: input.referenceMetier,
      typeOperation: input.typeOperation,
    });
  }
}
