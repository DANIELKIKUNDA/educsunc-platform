// Ce port abstrait le stockage et le rejeu des operations offline a synchroniser.
export interface OfflineSyncPort {
  enregistrerOperation(operation: OperationOfflineBulletin): Promise<void>;
  marquerOperationSynchronisee(idOperationOffline: string): Promise<void>;
}

export interface OperationOfflineBulletin {
  idOperationOffline: string;
  typeOperation: string;
  payload: unknown;
  dateEmission: Date;
}
