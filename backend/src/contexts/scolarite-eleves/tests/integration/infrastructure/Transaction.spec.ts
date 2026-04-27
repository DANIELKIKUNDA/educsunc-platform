import test from 'node:test';
import assert from 'node:assert/strict';
import { ContexteTransactionPostgres, TransactionManager } from '../../../infrastructure/persistence/postgres/transaction/TransactionManager';
import { PostgresUnitOfWork } from '../../../infrastructure/persistence/postgres/transaction/PostgresUnitOfWork';

class GestionnaireTransactionMemoire implements TransactionManager<string> {
  public commit = 0;
  public rollback = 0;
  public async ouvrirTransaction(): Promise<ContexteTransactionPostgres<string>> { return { idTransaction: 'tx-1', clientTransactionnel: 'client' }; }
  public async validerTransaction(): Promise<void> { this.commit += 1; }
  public async annulerTransaction(): Promise<void> { this.rollback += 1; }
  public async libererTransaction(): Promise<void> {}
}

test('PostgresUnitOfWork commit une transaction reussie', async () => {
  const gestionnaire = new GestionnaireTransactionMemoire();
  const uow = new PostgresUnitOfWork(gestionnaire);
  await uow.executerDansTransaction(async () => 'ok');
  assert.equal(gestionnaire.commit, 1);
});

test('PostgresUnitOfWork rollback une transaction echouee', async () => {
  const gestionnaire = new GestionnaireTransactionMemoire();
  const uow = new PostgresUnitOfWork(gestionnaire);
  await assert.rejects(() => uow.executerDansTransaction(async () => { throw new Error('boom'); }));
  assert.equal(gestionnaire.rollback, 1);
});
