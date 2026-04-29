export interface OperationSynchronisableInput {
  typeOperation: string;
  referenceMetier: string;
  idEcole: string;
  payload: Record<string, unknown>;
}

export interface SynchronisationPort {
  enregistrerOperationSynchronisable(input: OperationSynchronisableInput): Promise<void>;
}
