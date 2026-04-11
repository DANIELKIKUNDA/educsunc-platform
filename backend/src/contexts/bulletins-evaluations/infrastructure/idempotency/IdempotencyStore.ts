// Definit le contrat d'idempotence du contexte bulletins evaluations.
export interface IdempotencyStore {
  existe(cle: string): Promise<boolean>;
  enregistrer(cle: string): Promise<void>;
}
