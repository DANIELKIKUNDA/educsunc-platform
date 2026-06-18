import type { CriteresAnalysePedagogiquePort } from '../../contexts/bulletins-evaluations/application/ports/out/CriteresAnalysePedagogiquePort';
import { CriteresAnalysePedagogique } from '../../contexts/bulletins-evaluations/domain/entities/CriteresAnalysePedagogique';

interface DependancesCriteresAnalysePedagogiqueAdapter {
  resoudreCriteres?: (params: {
    idEcole: string;
    idClassePedagogique: string;
    idAnneeScolaire: string;
    idProgrammeNiveau: string;
  }) => Promise<CriteresAnalysePedagogique | null>;
}

// Cet adaptateur fournit les criteres pedagogiques configurables du centre d'analyse.
export class CriteresAnalysePedagogiqueAdapter implements CriteresAnalysePedagogiquePort {
  constructor(private readonly dependances?: DependancesCriteresAnalysePedagogiqueAdapter) {}

  public async resoudreCriteresAnalysePedagogique(params: {
    idEcole: string;
    idClassePedagogique: string;
    idAnneeScolaire: string;
    idProgrammeNiveau: string;
  }): Promise<CriteresAnalysePedagogique> {
    const criteres = await this.dependances?.resoudreCriteres?.(params);
    return criteres ?? CriteresAnalysePedagogique.parDefaut();
  }

  public async fermer(): Promise<void> {
    return Promise.resolve();
  }
}
