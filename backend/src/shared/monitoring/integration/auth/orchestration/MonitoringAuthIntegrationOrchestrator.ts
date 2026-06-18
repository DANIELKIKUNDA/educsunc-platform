import type { MonitoringContextInputDto } from '../../../application';
import { MonitoringAuthContextMapper } from '../mappers/MonitoringAuthContextMapper';
import type {
  MonitoringAuthContexteActif,
  MonitoringAuthDemandeAutorisation,
  MonitoringAuthEvenement,
} from '../MonitoringAuthIntegrationTypes';

// Ce fichier orchestre le pont Auth vers Monitoring.

export class MonitoringAuthIntegrationOrchestrator {
  private readonly contextes = new Map<string, MonitoringAuthContexteActif>();

  public async synchroniserEvenement(evenement: MonitoringAuthEvenement): Promise<void> {
    this.contextes.set(evenement.utilisateurId, {
      utilisateurId: evenement.utilisateurId,
      sessionId: evenement.sessionId,
      permissions: [...evenement.permissions],
      scopes: [...evenement.scopes],
      estSuperAdmin: evenement.scopes.includes('SYSTEM'),
    });
  }

  public async autoriser(demande: MonitoringAuthDemandeAutorisation): Promise<boolean> {
    const contexte = this.contextes.get(demande.utilisateurId);
    if (!contexte) {
      return false;
    }
    if (contexte.estSuperAdmin) {
      return true;
    }
    return contexte.permissions.includes(demande.permission)
      && (!demande.scope || contexte.scopes.includes(demande.scope));
  }

  public async resoudreContexte(
    contexte: MonitoringContextInputDto,
    utilisateurId?: string,
  ): Promise<MonitoringContextInputDto> {
    return MonitoringAuthContextMapper.enrichir(
      contexte,
      utilisateurId ? this.contextes.get(utilisateurId) ?? null : null,
    );
  }

  public snapshot(): readonly MonitoringAuthContexteActif[] {
    return [...this.contextes.values()];
  }
}
