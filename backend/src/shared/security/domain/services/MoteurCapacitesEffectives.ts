import type { AffectationTitulariat } from '../aggregates/AffectationTitulariat';
import { PolicyCapacitesTitulariat } from '../policies/PolicyCapacitesTitulariat';

export class MoteurCapacitesEffectives {
  public calculerPermissionsEffectives(params: {
    permissionsBase: readonly string[];
    titulariats: readonly AffectationTitulariat[];
    titulariatEffectifFinal?: boolean;
    contexte: {
      idOrganisation?: string;
      idEcole?: string;
      idClasse?: string;
      idAnneeScolaire?: string;
    };
  }): readonly string[] {
    const permissions = new Set(params.permissionsBase);

    if (this.aTitulariatEffectif(params.titulariatEffectifFinal)) {
      for (const permission of PolicyCapacitesTitulariat.listerPermissionsAdditionnelles()) {
        permissions.add(permission);
      }
    }

    return [...permissions];
  }

  public aTitulariatEffectif(titulariatEffectifFinal = false): boolean {
    return titulariatEffectifFinal;
  }

  public possedeTitulariatActifDansScope(
    titulariats: readonly AffectationTitulariat[],
    contexte: {
      idOrganisation?: string;
      idEcole?: string;
      idClasse?: string;
      idAnneeScolaire?: string;
    },
  ): boolean {
    if (!contexte.idClasse || !contexte.idAnneeScolaire) {
      return false;
    }

    return titulariats.some((titulariat) =>
      titulariat.estActifDansScope({
        idOrganisation: contexte.idOrganisation,
        idEcole: contexte.idEcole,
        idClasse: contexte.idClasse,
        idAnneeScolaire: contexte.idAnneeScolaire,
      }));
    }
}
