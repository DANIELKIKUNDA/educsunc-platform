// Ce fichier expose le nom documentaire du gestionnaire de transaction paiements.

export {
  GestionnaireTransactionPostgresPaiements as PaiementTransactionManager,
  type AdaptateurClientTransactionPostgresPaiements,
  type ContexteTransactionPostgresPaiements,
  type TransactionManager,
} from './TransactionManager';
