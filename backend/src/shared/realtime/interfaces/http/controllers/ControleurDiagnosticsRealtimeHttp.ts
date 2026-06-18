import type { FacadeInfrastructureRealtime } from '../../../../realtime/infrastructure';
import { PresentateurDiagnosticsRealtimeHttp } from '../presenters';
import { envelopperReponseHttpRealtime, extraireCorrelationRealtime } from './RealtimeControllerSupport';
import type { ReponseControleurHttpRealtime, RequeteHttpRealtime } from './HttpRealtimeControllerTypes';

export class ControleurDiagnosticsRealtimeHttp {
  constructor(private readonly facade: FacadeInfrastructureRealtime) {}

  public async consulter(
    requete: RequeteHttpRealtime,
  ): Promise<ReponseControleurHttpRealtime<ReturnType<typeof PresentateurDiagnosticsRealtimeHttp.presenterDiagnostic>>> {
    const commenceLe = Date.now();
    const correlationId = extraireCorrelationRealtime(requete);
    const observabilite = this.facade.registre.observabilite.lireCompteurs();
    const signaux = this.facade.registre.observabilite.lireSignaux();
    const journal = this.facade.registre.diffusion.lireJournal();
    return envelopperReponseHttpRealtime(
      PresentateurDiagnosticsRealtimeHttp.presenterDiagnostic({
        observabilite,
        totalSignaux: signaux.length,
        totalMessagesJournalises: journal.length,
      }),
      correlationId,
      commenceLe,
    );
  }
}
