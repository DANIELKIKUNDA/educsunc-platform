import { AuditInvalidClassificationException } from '../exceptions';
import { AUDIT_ACTION_MATRIX } from '../invariants';
import { ActionAudit, GraviteAudit, NiveauAudit, TypeAudit } from '../value-objects';

// Ce moteur attribue une classification cohérente à une action auditée.
export class MoteurClassificationAudit {
  public classer(actionAudit: ActionAudit): {
    typeAuditPrincipal: TypeAudit;
    categoriesAudit: TypeAudit[];
    niveauAudit: NiveauAudit;
    graviteAudit: GraviteAudit;
  } {
    const action = actionAudit.obtenirValeur();
    const definition = AUDIT_ACTION_MATRIX[action];

    if (!definition) {
      throw new AuditInvalidClassificationException(`Aucune classification officielle pour l'action ${action}.`);
    }

    return {
      typeAuditPrincipal: new TypeAudit(definition.typeAuditPrincipal),
      categoriesAudit: definition.categoriesAudit.map((categorie) => new TypeAudit(categorie)),
      niveauAudit: new NiveauAudit(definition.niveauAudit),
      graviteAudit: new GraviteAudit(definition.gravitesAutorisees[0]),
    };
  }
}
