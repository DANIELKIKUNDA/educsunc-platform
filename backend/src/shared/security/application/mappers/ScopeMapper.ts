import type { ScopeAcces } from '../../../security/domain';
import type { ScopeUtilisateurOutput } from '../dto/output';
export class ScopeMapper {
  public static depuisDomaine(scope: ScopeAcces): ScopeUtilisateurOutput {
    return {
      typeScope: scope.obtenirTypeScope().obtenirValeur(),
      valeurScope: scope.obtenirValeurScope(),
      estLectureSeule: scope.obtenirEstLectureSeule(),
    };
  }
}
