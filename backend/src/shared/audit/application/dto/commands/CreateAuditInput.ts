import type { CreateAuditEntryCommand } from './CreateAuditEntryCommand';

// Cette commande legacy reste exposee pour compatibilite applicative.
export interface CreateAuditInput extends CreateAuditEntryCommand {}
