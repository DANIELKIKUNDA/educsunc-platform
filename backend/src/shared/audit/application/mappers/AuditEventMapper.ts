import type { CreateAuditEntryInput } from '../dto/inputs/CreateAuditEntryInput';

// Ce mapper applicatif convertit les contrats Audit sans embarquer la persistence.
export class AuditEventMapper {
  public static depuisEvenement(action: string, evenement: Record<string, unknown>): CreateAuditEntryInput {
    return {
      action,
      typePrincipal: typeof evenement.typePrincipal === 'string' ? evenement.typePrincipal : 'SYSTEME',
      resultat: typeof evenement.resultat === 'string' ? evenement.resultat : 'SUCCES',
      acteur: {
        idUtilisateur: typeof evenement.idUtilisateur === 'string' ? evenement.idUtilisateur : undefined,
        typeActeur: typeof evenement.typeActeur === 'string' ? evenement.typeActeur : 'SYSTEME',
        roleActif: typeof evenement.roleActif === 'string' ? evenement.roleActif : undefined,
      },
      contexte: {
        sourceAudit: typeof evenement.sourceAudit === 'string' ? evenement.sourceAudit : 'EVENT_BUS',
        modeOffline: evenement.modeOffline === true,
        correlationId: typeof evenement.correlationId === 'string' ? evenement.correlationId : undefined,
        requestId: typeof evenement.requestId === 'string' ? evenement.requestId : undefined,
      },
      tenant: {
        organisationId: typeof evenement.organisationId === 'string' ? evenement.organisationId : undefined,
        ecoleId: typeof evenement.ecoleId === 'string' ? evenement.ecoleId : undefined,
        scope: typeof evenement.scope === 'string' ? evenement.scope : 'ECOLE',
      },
      metadata: { ...evenement },
    };
  }
}
