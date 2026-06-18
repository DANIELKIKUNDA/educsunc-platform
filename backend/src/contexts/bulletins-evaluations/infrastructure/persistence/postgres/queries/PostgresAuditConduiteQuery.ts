import type {
  AuditConduiteQuery,
  AuditConduiteReadModel,
} from 'contexts/bulletins-evaluations/application/queries/AuditConduiteQuery';
import { PostgresDepotResultatBulletinEleve } from '../depots/PostgresDepotResultatBulletinEleve';

// Ce fichier fournit la lecture locale des traces d'encodage et de modification de conduite.
export class PostgresAuditConduiteQuery implements AuditConduiteQuery {
  private readonly depot = new PostgresDepotResultatBulletinEleve();

  public async executer(idResultatBulletinEleve: string): Promise<AuditConduiteReadModel[]> {
    const historiques = await this.depot.listerHistoriqueEncodageConduite(idResultatBulletinEleve);

    return historiques.map((historique) => ({
      action: historique.obtenirAnciensPointsConduite() === null ? 'ENCODAGE_CONDUITE' : 'MODIFICATION_CONDUITE',
      dateAction: historique.obtenirDateEncodage(),
      idUtilisateur: historique.obtenirEncodeePar(),
      commentaire: `Periode ${String(historique.obtenirCodePeriode())} : ${historique.obtenirAnciensPointsConduite() ?? 'null'} -> ${historique.obtenirNouveauxPointsConduite()}`,
    }));
  }
}
