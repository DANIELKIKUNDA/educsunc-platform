import { ErreurCalendrierEncodageInexploitable } from '../exceptions/ErreurCalendrierEncodageInexploitable';
import { ErreurFenetreEncodageFermee } from '../exceptions/ErreurFenetreEncodageFermee';
import {
  CodeColonneBulletin,
  estColonneExamenBulletin,
  estColonneTotalBulletin,
} from '../value-objects/CodeColonneBulletin';

// Cette policy decide si une colonne de cote est actuellement ouverte a l'encodage.
export class PolicyFenetreEncodageCotes {
  public verifier(params: {
    codeColonne: CodeColonneBulletin;
    calendrierTrouve: boolean;
    calendrierVerrouille: boolean;
    periodeCouranteCode: string | null;
    examenCourantCode: string | null;
  }): void {
    if (estColonneTotalBulletin(params.codeColonne)) {
      return;
    }

    if (!params.calendrierTrouve) {
      throw new ErreurCalendrierEncodageInexploitable(
        "Aucun calendrier academique local n'est disponible pour gouverner l'encodage des cotes.",
      );
    }

    if (!params.calendrierVerrouille) {
      throw new ErreurCalendrierEncodageInexploitable(
        "Le calendrier academique local doit etre verrouille avant d'autoriser l'encodage des cotes.",
      );
    }

    if (estColonneExamenBulletin(params.codeColonne)) {
      if (params.examenCourantCode !== params.codeColonne) {
        throw new ErreurFenetreEncodageFermee(
          `La colonne "${params.codeColonne}" n'est pas ouverte a l'encodage a la date courante.`,
        );
      }

      return;
    }

    if (params.periodeCouranteCode !== params.codeColonne) {
      throw new ErreurFenetreEncodageFermee(
        `La colonne "${params.codeColonne}" n'est pas ouverte a l'encodage a la date courante.`,
      );
    }
  }
}
