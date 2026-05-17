import type { BlocApplicationConduite } from '../../domain/entities/BlocApplicationConduite';
import type { ApplicationConduiteOutput } from '../dto/output/ApplicationConduiteOutput';

// Ce mapper convertit un bloc application/conduite en DTO de sortie.
export class ApplicationConduiteMapper {
  // Cette methode produit le DTO de bloc application/conduite.
  public versSortie(bloc: BlocApplicationConduite): ApplicationConduiteOutput {
    return {
      codePeriode: bloc.obtenirCodePeriode(),
      application: bloc.obtenirApplication(),
      conduite: bloc.obtenirConduite(),
      pointsConduite: bloc.obtenirPointsConduite(),
    };
  }
}
