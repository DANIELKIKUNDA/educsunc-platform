import type { Journaliseur } from '../../../../shared/infrastructure/logger/Logger';
import { ActionAuditScolarite } from '../../application/ports/AuditPort';

// Ce fichier contient le service infrastructure d'audit enrichi propre au BC Scolarite.
/**
 * Ce service enrichit les journaux d'audit avec le nom du bounded context.
 */
export class AuditScolariteService {
  constructor(private readonly journaliseur: Journaliseur) {}

  /** Journalise une action de scolarite avec son contexte BC. */
  public journaliser(action: ActionAuditScolarite): void {
    this.journaliseur.info('Action critique scolarite eleves.', {
      bc: 'scolarite-eleves',
      ...action,
    });
  }
}
