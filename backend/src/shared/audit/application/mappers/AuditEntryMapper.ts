import type { CreateAuditEntryInput } from '../dto/inputs/CreateAuditEntryInput';
import type { AuditEntryOutput } from '../dto/outputs/AuditEntryOutput';
import { AuditActorMapper } from './AuditActorMapper';
import { AuditClassificationMapper } from './AuditClassificationMapper';
import { AuditContextMapper } from './AuditContextMapper';
import { AuditSnapshotMapper } from './AuditSnapshotMapper';

// Ce mapper applicatif convertit les contrats Audit sans embarquer la persistence.
export class AuditEntryMapper {
  public static depuisCreateAuditEntryInput(valeur: CreateAuditEntryInput): AuditEntryOutput {
    const classification = AuditClassificationMapper.determinerClassification(valeur.action, valeur.typePrincipal, valeur.categories, valeur.gravite, valeur.niveau);
    const contexte = AuditContextMapper.depuisContexte(valeur.contexte as Record<string, unknown>);
    const acteur = AuditActorMapper.depuisActeur(valeur.acteur as Record<string, unknown>);
    const maintenant = new Date().toISOString();
    return {
      idAuditEntry: `${valeur.typePrincipal}-${valeur.action}-${Date.now()}`,
      action: valeur.action,
      typePrincipal: valeur.typePrincipal,
      typeAuditPrincipal: valeur.typePrincipal,
      categories: classification.categories,
      gravite: classification.gravite,
      resultat: valeur.resultat,
      acteur,
      ressource: valeur.ressource,
      tenant: valeur.tenant,
      contexte,
      organisationId: valeur.tenant.organisationId,
      ecoleId: valeur.tenant.ecoleId,
      correlationId: contexte.correlationId,
      metadata: {
        ...valeur.metadata,
        ancienEtat: AuditSnapshotMapper.sanitiserSnapshot(valeur.ancienEtat),
        nouvelEtat: AuditSnapshotMapper.sanitiserSnapshot(valeur.nouvelEtat),
      },
      createdAt: maintenant,
      dateAction: maintenant,
    };
  }

  public static versAuditEntryOutput(valeur: AuditEntryOutput): AuditEntryOutput {
    return { ...valeur, categories: [...valeur.categories] };
  }
}
