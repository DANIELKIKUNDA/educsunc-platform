import { ErreurAuth } from './ErreurAuth';

// Cette erreur signale un echec de synchronisation des etats auth offline.
export class ErreurSynchronisationAuth extends ErreurAuth {
  constructor(message = 'Synchronisation auth impossible') {
    super(message);
    this.name = 'ErreurSynchronisationAuth';
  }
}
