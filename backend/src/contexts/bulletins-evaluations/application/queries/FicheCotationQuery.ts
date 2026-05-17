import type { FicheCotationReadModel } from '../read-models/FicheCotationReadModel';

// Cette query lit rapidement une fiche de cotation prete a encoder.
export interface FicheCotationQuery {
  executer(idFicheCotationEleveCours: string): Promise<FicheCotationReadModel | null>;
}
