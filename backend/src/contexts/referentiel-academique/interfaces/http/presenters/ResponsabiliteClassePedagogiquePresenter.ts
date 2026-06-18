import { ResponsabiliteClassePedagogiqueSortie } from '../../../application/dto/output/ResponsabiliteClassePedagogiqueSortie';

export interface ReponseResponsabiliteClassePedagogiqueHttp {
  donnee: ResponsabiliteClassePedagogiqueSortie | null;
}

// Ce presenter encapsule les reponses HTTP des responsabilites de classes pedagogiques.
export class ResponsabiliteClassePedagogiquePresenter {
  public static presenterDetail(
    responsabiliteClassePedagogique: ResponsabiliteClassePedagogiqueSortie | null,
  ): ReponseResponsabiliteClassePedagogiqueHttp {
    return {
      donnee:
        responsabiliteClassePedagogique === null
          ? null
          : { ...responsabiliteClassePedagogique },
    };
  }
}
