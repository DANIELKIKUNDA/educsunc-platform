import { GrilleTarification } from '../../domain/aggregates/GrilleTarification';
import type { DepotGrilleTarification } from '../../domain/repositories/DepotGrilleTarification';

// Ce fichier orchestre un import technique de grilles tarifaires sans y meler de logique HTTP.
export class ServiceImportTarificationPaiement {
  // Ce constructeur injecte le depot cible pour persister les grilles importees.
  constructor(
    private readonly depotGrilleTarification: DepotGrilleTarification,
  ) {}

  // Cette methode persiste une liste de grilles deja validees par la couche appelante.
  public async importer(grilles: readonly GrilleTarification[]): Promise<number> {
    for (const grille of grilles) {
      await this.depotGrilleTarification.sauvegarder(grille);
    }

    return grilles.length;
  }
}
