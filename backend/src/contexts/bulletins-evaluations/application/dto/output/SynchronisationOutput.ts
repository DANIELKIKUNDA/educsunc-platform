// Ce DTO represente le resultat expose d'une synchronisation offline.
export interface SynchronisationOutput {
  idOperationOffline: string;
  statut: 'SYNCHRONISEE' | 'CONFLIT' | 'REJETEE';
  message: string;
}
