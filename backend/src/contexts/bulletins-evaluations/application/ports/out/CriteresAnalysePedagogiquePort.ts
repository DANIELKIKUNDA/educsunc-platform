import type { CriteresAnalysePedagogique } from '../../../domain/entities/CriteresAnalysePedagogique';

export interface CriteresAnalysePedagogiquePort {
  resoudreCriteresAnalysePedagogique(params: {
    idEcole: string;
    idClassePedagogique: string;
    idAnneeScolaire: string;
    idProgrammeNiveau: string;
  }): Promise<CriteresAnalysePedagogique>;
}
