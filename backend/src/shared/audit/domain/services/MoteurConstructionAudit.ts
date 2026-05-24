import { AuditEntry, type CommandeCreationAuditEntry } from '../aggregates';
import { PolicyAuditActionObligatoire, PolicyAuditClassification, PolicyAuditCorrelation, PolicyAuditExecutionContext, PolicyAuditHorodatage, PolicyAuditIntegrite, PolicyAuditOffline, PolicyAuditPermissionsHistoriques, PolicyAuditSnapshots, PolicyAuditTenantIsolation } from '../policies';

// Ce moteur construit l'entrée audit complète à partir des pièces métier déjà préparées.
export class MoteurConstructionAudit {
  public construire(entree: CommandeCreationAuditEntry): AuditEntry {
    PolicyAuditActionObligatoire.verifier(entree.actionAudit);
    PolicyAuditClassification.verifier(entree.typeAuditPrincipal, entree.categoriesAudit);
    PolicyAuditTenantIsolation.verifier(entree.tenantAudit);
    PolicyAuditHorodatage.verifier(entree.horodatageAudit);
    PolicyAuditSnapshots.verifier(entree.actionAudit, entree.auditSnapshot?.obtenirSnapshots());
    PolicyAuditCorrelation.verifier(entree.contexteAudit.obtenirSourceRuntime(), entree.auditCorrelation);
    PolicyAuditOffline.verifier(entree.auditOfflineMetadata, entree.contexteAudit.estOffline());
    PolicyAuditExecutionContext.verifier(entree.auditExecutionContext);
    PolicyAuditPermissionsHistoriques.verifier(
      entree.auditPermissionContext,
      ['SECURITE', 'FINANCIER', 'PEDAGOGIQUE', 'CONSULTATION_SENSIBLE'].includes(entree.typeAuditPrincipal.obtenirValeur()),
    );
    PolicyAuditIntegrite.verifier({
      acteurAudit: entree.acteurAudit,
      contexteAudit: entree.contexteAudit,
      tenantAudit: entree.tenantAudit,
      ressourceAudit: entree.ressourceAudit,
    });
    return AuditEntry.creer(entree);
  }
}
