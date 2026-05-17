import type {
  AuditEncodageQuery,
  AuditEncodageReadModel,
} from 'contexts/bulletins-evaluations/application/queries/AuditEncodageQuery';
import { PostgresDepotFicheCotationEleveCours } from '../depots/PostgresDepotFicheCotationEleveCours';
import { obtenirMemoireTechniqueBulletins } from '../depots/outilsDepotBulletin';
import { FicheCotationPostgresMapper } from '../mappers';

// Ce fichier fournit la lecture locale des traces d'encodage et de modification.
export class PostgresAuditEncodageQuery implements AuditEncodageQuery {
  private readonly depot = new PostgresDepotFicheCotationEleveCours();

  // Cette methode reconstruit les traces a partir des colonnes historisees dans la fiche.
  public async executer(idFicheCotationEleveCours: string): Promise<AuditEncodageReadModel[]> {
    const fiche = await this.depot.trouverParId(idFicheCotationEleveCours);
    if (fiche !== null) {
      obtenirMemoireTechniqueBulletins().auditsEncodage.set(
        fiche.obtenirId(),
        FicheCotationPostgresMapper.versAuditsEncodage(fiche),
      );
    }

    return obtenirMemoireTechniqueBulletins().auditsEncodage.get(idFicheCotationEleveCours) ?? [];
  }
}
