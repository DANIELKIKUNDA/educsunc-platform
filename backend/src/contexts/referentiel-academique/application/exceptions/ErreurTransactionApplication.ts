import { ApplicationError, type ErrorMetadata } from '../../../../shared/exceptions/ApplicationError';

// Cette exception signale qu'une transaction applicative n'a pas pu etre menee a son terme.
export class ErreurTransactionApplication extends ApplicationError {
  // Ce constructeur initialise une erreur applicative de transaction.
  constructor(
    message: string,
    metadata?: ErrorMetadata,
  ) {
    super(message, 'ERREUR_TRANSACTION_APPLICATION', metadata);
    this.name = 'ErreurTransactionApplication';
  }
}
