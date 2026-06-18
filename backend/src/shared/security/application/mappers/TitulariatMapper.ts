import type { AffectationTitulariat } from '../../../security/domain';
import type { TitulariatOutput } from '../dto/output';
export class TitulariatMapper {
  public static depuisDomaine(titulariat: AffectationTitulariat): TitulariatOutput {
    return {
      idAffectationTitulariat: titulariat.obtenirId(),
      idUtilisateur: titulariat.obtenirIdUtilisateur(),
      idOrganisation: titulariat.obtenirIdOrganisation(),
      idEcole: titulariat.obtenirIdEcole(),
      idClasse: titulariat.obtenirIdClasse(),
      idAnneeScolaire: titulariat.obtenirIdAnneeScolaire(),
      estActif: titulariat.obtenirEstActif(),
    };
  }
}
