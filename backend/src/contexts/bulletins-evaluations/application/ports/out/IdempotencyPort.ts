// Ce port abstrait la memorisation des executions idempotentes du BC.
export interface IdempotencyPort<TSortie = unknown> {
  trouver(cleIdempotence: string): Promise<EnregistrementIdempotence<TSortie> | null>;
  enregistrer(cleIdempotence: string, empreintePayload: string, sortie: TSortie): Promise<void>;
}

export interface EnregistrementIdempotence<TSortie = unknown> {
  cleIdempotence: string;
  empreintePayload: string;
  sortie: TSortie;
}
