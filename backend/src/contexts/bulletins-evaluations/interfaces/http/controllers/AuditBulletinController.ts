import type { AuditEncodageQuery } from 'contexts/bulletins-evaluations/application/queries/AuditEncodageQuery';
import { AuditPresenter } from '../presenters/AuditPresenter';

// Ce controleur expose les endpoints HTTP d'audit du BC.
export class AuditBulletinController {
  // Ce constructeur injecte la query de lecture des traces d'encodage.
  constructor(private readonly auditEncodageQuery: AuditEncodageQuery) {}

  // Cette methode lit l'audit des cotes pour une fiche.
  public async consulterAuditCotes(query: { idFicheCotationEleveCours: string }): Promise<{ donnee: unknown }> {
    const donnees = await this.auditEncodageQuery.executer(query.idFicheCotationEleveCours);
    return AuditPresenter.presenter(donnees);
  }

  // Cette methode expose un historique d'audit bulletin quand il sera branche.
  public async consulterAuditBulletins(): Promise<{ donnee: unknown[] }> {
    return { donnee: [] };
  }

  // Cette methode expose un historique d'audit classement quand il sera branche.
  public async consulterAuditClassements(): Promise<{ donnee: unknown[] }> {
    return { donnee: [] };
  }
}
