import { FacadeInfrastructureRealtime } from '../../infrastructure';

export class RuntimeDiagnosticsRealtime {
  constructor(private readonly facade: FacadeInfrastructureRealtime) {}

  public lire() {
    return {
      observabilite: this.facade.registre.observabilite.lireCompteurs(),
      totalSignaux: this.facade.registre.observabilite.lireSignaux().length,
      totalMessagesJournalises: this.facade.registre.diffusion.lireJournal().length,
    };
  }
}
