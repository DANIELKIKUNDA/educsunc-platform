import type { FicheCotationQuery } from 'contexts/bulletins-evaluations/application/queries/FicheCotationQuery';
import type { FicheCotationReadModel } from 'contexts/bulletins-evaluations/application/read-models/FicheCotationReadModel';
import { PostgresDepotFicheCotationEleveCours } from '../depots/PostgresDepotFicheCotationEleveCours';
import { FicheCotationPostgresMapper } from '../mappers';

// Ce fichier fournit la lecture locale d'une fiche de cotation prete pour l'encodage.
export class PostgresFicheCotationQuery implements FicheCotationQuery {
  private readonly depot = new PostgresDepotFicheCotationEleveCours();

  // Cette methode relit la fiche complete telle qu'elle a ete enregistree dans le depot.
  public async executer(idFicheCotationEleveCours: string): Promise<FicheCotationReadModel | null> {
    const fiche = await this.depot.trouverParId(idFicheCotationEleveCours);
    return fiche === null ? null : FicheCotationPostgresMapper.versReadModel(fiche);
  }
}
