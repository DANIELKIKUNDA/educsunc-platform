import { ObligationFinanciereEleve } from '../../domain/aggregates/ObligationFinanciereEleve';
import { TypeFrais } from '../../domain/value-objects/TypeFrais';
import { FraisDisponibleReadModel, FraisExigiblesEleveReadModel } from '../read-models/FraisExigiblesEleveReadModel';

export class ServiceLectureFraisExigibles {
  public construire(idEleve: string, obligations: ObligationFinanciereEleve[], paiementPartielAutoriseParType: Map<TypeFrais, boolean> = new Map()): FraisExigiblesEleveReadModel {
    const frais: FraisDisponibleReadModel[] = obligations
      .filter((obligation) => !obligation.estSoldee())
      .map((obligation) => ({
        typeFrais: obligation.obtenirTypeFrais(),
        libelle: obligation.obtenirLibelle(),
        montantAttendu: obligation.obtenirMontantDuHistorique(),
        resteAPayer: obligation.obtenirSolde(),
        paiementPartielAutorise: paiementPartielAutoriseParType.get(obligation.obtenirTypeFrais()) ?? false,
      }));

    return {
      idEleve,
      frais,
    };
  }
}
