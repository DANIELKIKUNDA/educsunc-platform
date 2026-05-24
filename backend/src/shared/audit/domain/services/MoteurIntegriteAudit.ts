import { AuditEntry } from '../aggregates';
import { PolicyAuditDonneesSensibles, PolicyAuditForensic, PolicyAuditIntegrite } from '../policies';

// Ce moteur exécute les contrôles de cohérence et d'intégrité d'une entrée audit.
export class MoteurIntegriteAudit {
  public verifier(entree: AuditEntry): void {
    PolicyAuditIntegrite.verifier({
      acteurAudit: entree.obtenirActeurAudit(),
      contexteAudit: entree.obtenirContexteAudit(),
      tenantAudit: entree.obtenirTenantAudit(),
      ressourceAudit: entree.obtenirRessourceAudit(),
    });
    PolicyAuditForensic.verifier(entree.obtenirContexteAudit());
    const snapshots = entree.obtenirAuditSnapshot()?.obtenirSnapshots();
    PolicyAuditDonneesSensibles.verifierSnapshots(JSON.stringify({
      ancienEtat: snapshots?.obtenirAncienEtat(),
      nouvelEtat: snapshots?.obtenirNouvelEtat(),
    }));
  }
}
