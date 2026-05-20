import { PostgresUnitOfWork } from '../../../../../../contexts/scolarite-eleves/infrastructure/persistence/postgres/transaction/PostgresUnitOfWork';
import type { ClientTransactionnelAuth } from './AuthTransactionManager';

// Cette unite de travail expose le contrat transactionnel applicatif d'AUTH.
export class PostgresAuthUnitOfWork extends PostgresUnitOfWork<ClientTransactionnelAuth> {}
