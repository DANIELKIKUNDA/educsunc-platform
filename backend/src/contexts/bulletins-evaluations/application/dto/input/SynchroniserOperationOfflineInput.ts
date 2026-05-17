// Ce DTO porte les informations necessaires au rejeu d'une operation offline.
export interface SynchroniserOperationOfflineInput {
  idOperationOffline: string;
  typeOperation: string;
  payload: unknown;
  cleIdempotence: string;
}
