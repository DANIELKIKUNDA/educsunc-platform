import type { GenererObligationsMasseInput } from 'contexts/paiements-facturation/application/dto/input/ObligationsEntreeDTO';
import type { ObligationFinanciereOutput } from 'contexts/paiements-facturation/application/dto/output/ObligationsSortieDTO';
import { GenererObligationsEleveUseCase } from './GenererObligationsEleveUseCase';

export class GenererObligationsMasseUseCase {
  constructor(private readonly genererObligationsEleveUseCase: GenererObligationsEleveUseCase) {}

  public async executer(input: GenererObligationsMasseInput): Promise<Record<string, ObligationFinanciereOutput[]>> {
    const resultat: Record<string, ObligationFinanciereOutput[]> = {};
    for (const idEleve of input.idsEleves ?? []) {
      resultat[idEleve] = await this.genererObligationsEleveUseCase.executer({
        idEleve,
        idInscriptionScolaire: `${idEleve}-${input.idAnneeScolaire}`,
        idOrganisation: input.idOrganisation,
        idEcole: input.idEcole,
        idAnneeScolaire: input.idAnneeScolaire,
        creePar: input.creePar,
        roleActif: input.roleActif,
      });
    }
    return resultat;
  }
}
