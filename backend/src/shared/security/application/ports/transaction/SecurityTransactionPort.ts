export interface SecurityTransactionPort {
  executerDansTransaction<TResult>(operation: () => Promise<TResult>): Promise<TResult>;
}
