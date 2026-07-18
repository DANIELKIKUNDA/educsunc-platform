import { AuditRetentionLifecycleService } from '../lifecycle/AuditRetentionLifecycleService';
import { AuditRetentionRulesService } from '../rules/AuditRetentionRulesService';
import { AuditRetentionArchivalService } from '../archival/AuditRetentionArchivalService';
import { AuditRetentionColdStorageService } from '../cold-storage/AuditRetentionColdStorageService';
import { AuditRetentionPurgeService } from '../purge/AuditRetentionPurgeService';
import { AuditRetentionExportService } from '../exports/AuditRetentionExportService';

// L orchestration retention applique le cycle de vie de façon incrémentale.
export class AuditRetentionOrchestrator {
  public constructor(
    private readonly lifecycle: AuditRetentionLifecycleService = new AuditRetentionLifecycleService(),
    private readonly rules: AuditRetentionRulesService = new AuditRetentionRulesService(),
    private readonly archival: AuditRetentionArchivalService = new AuditRetentionArchivalService(),
    private readonly coldStorage: AuditRetentionColdStorageService = new AuditRetentionColdStorageService(),
    private readonly purge: AuditRetentionPurgeService = new AuditRetentionPurgeService(),
    private readonly exports: AuditRetentionExportService = new AuditRetentionExportService(),
  ) {}

  public async executerCycle(reference = new Date()): Promise<void> {
    const candidats = await this.lifecycle.listerCandidats();
    for (const candidat of candidats) {
      const politique = this.rules.choisirPolitique('TECHNIQUE');
      const etat = this.rules.determinerEtat(candidat, politique, reference);
      if (etat === 'ARCHIVE') {
        await this.archival.archiver(candidat);
      } else if (etat === 'COLD_STORAGE') {
        await this.coldStorage.deplacerVersColdStorage({
          typeArchive: 'RETENTION',
          organisationId: candidat.organisationId,
          ecoleId: candidat.ecoleId,
          scope: candidat.scope,
        });
      } else if (etat === 'PURGE') {
        await this.purge.executer({ ...candidat, lifecycleState: etat });
      }
    }

    await this.exports.nettoyerExportsExpires();
  }
}
