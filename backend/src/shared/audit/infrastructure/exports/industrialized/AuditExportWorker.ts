import { AuditExportFileGenerator } from './AuditExportFileGenerator';
import { PostgresAuditExportJobStore } from './PostgresAuditExportJobStore';

export class AuditExportWorker {
  private timer?: NodeJS.Timeout;
  private traitement?: Promise<void>;
  private fermetureDemandee = false;

  public constructor(
    private readonly travaux: PostgresAuditExportJobStore,
    private readonly generateur: AuditExportFileGenerator,
    private readonly intervalleMs = 2_000,
    private readonly signalerErreur: (erreur: unknown) => void = () => undefined,
    private readonly auditerGeneration: (job: import('./PostgresAuditExportJobStore').AuditExportJob, resultat: 'SUCCESS' | 'FAILED') => Promise<void> = async () => undefined,
  ) {}

  public async start(): Promise<void> {
    if (this.timer) return;
    this.fermetureDemandee = false;
    await this.travaux.reprendreTravauxInterrompus();
    this.timer = setInterval(() => this.reveiller(), this.intervalleMs);
    this.timer.unref();
    this.reveiller();
  }

  public reveiller(): void {
    if (this.fermetureDemandee || this.traitement) return;
    this.traitement = this.traiter().finally(() => { this.traitement = undefined; });
  }

  public async stop(): Promise<void> {
    this.fermetureDemandee = true;
    if (this.timer) clearInterval(this.timer);
    this.timer = undefined;
    await this.traitement;
  }

  private async traiter(): Promise<void> {
    while (!this.fermetureDemandee) {
      const travail = await this.travaux.reclamerSuivant();
      if (!travail) return;
      try {
        const fichier = await this.generateur.generer(travail);
        await this.travaux.terminer(travail.idExport, fichier);
        await this.auditerSansCasser(travail, 'SUCCESS');
      } catch (erreur) {
        if (travail.tentativeCount < 3) {
          await this.travaux.reessayer(travail.idExport, this.message(erreur));
          return;
        }
        await this.travaux.echouer(travail.idExport, this.message(erreur));
        await this.auditerSansCasser(travail, 'FAILED');
        this.signalerErreur(erreur);
      }
    }
  }

  private message(erreur: unknown): string {
    return erreur instanceof Error ? erreur.message : "La generation de l'export a echoue.";
  }

  private async auditerSansCasser(job: import('./PostgresAuditExportJobStore').AuditExportJob, resultat: 'SUCCESS' | 'FAILED'): Promise<void> {
    try {
      await this.auditerGeneration(job, resultat);
    } catch (erreur) {
      this.signalerErreur(erreur);
    }
  }
}
