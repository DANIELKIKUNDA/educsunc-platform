import { GestionnaireTransactionPostgres } from '../../../../../../contexts/referentiel-academique/infrastructure/persistence/postgres/transaction/TransactionManager';

// Ce type represente un client transactionnel generique pour AUTH.
export type ClientTransactionnelAuth = Record<string, unknown>;

// Ce gestionnaire ouvre et ferme les transactions techniques AUTH.
export class AuthTransactionManager extends GestionnaireTransactionPostgres<ClientTransactionnelAuth> {}
