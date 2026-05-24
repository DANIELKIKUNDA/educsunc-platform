import type { OfflineAuditReplayInput } from '../offline/OfflineAuditReplayInput';

// Cette commande formalise le rejeu d'un audit offline.
export interface ReplayAuditCommand extends OfflineAuditReplayInput {}
