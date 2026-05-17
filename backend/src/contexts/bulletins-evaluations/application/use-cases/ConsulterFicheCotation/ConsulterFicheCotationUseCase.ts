import type { ConsulterFicheCotationInput } from '../../dto/input/ConsulterFicheCotationInput';
import type { FicheCotationOutput } from '../../dto/output/FicheCotationOutput';
import { QueryException } from '../../exceptions/QueryException';
import type { FicheCotationQuery } from '../../queries/FicheCotationQuery';

// Ce use case expose la lecture optimisee d'une fiche de cotation.
export class ConsulterFicheCotationUseCase {
  constructor(private readonly query: FicheCotationQuery) {}

  // Cette methode retourne la fiche demandee ou echoue proprement.
  public async executer(input: ConsulterFicheCotationInput): Promise<FicheCotationOutput> {
    const fiche = await this.query.executer(input.idFicheCotationEleveCours);
    if (fiche === null) {
      throw new QueryException('La fiche de cotation demandee est introuvable.');
    }

    return fiche;
  }
}
