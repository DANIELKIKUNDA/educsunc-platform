import { ErreurCompatibiliteReferentiel } from '../exceptions/ErreurCompatibiliteReferentiel';

// Cette policy verifie qu'une version de referentiel reste compatible entre les objets du domaine.
export class PolicyCompatibiliteVersionReferentiel {
  // Cette methode compare deux versions de referentiel et interdit toute conversion implicite.
  public verifier(
    versionAttendue: string,
    versionUtilisee: string,
    justification?: string,
  ): void {
    if (versionAttendue.trim().length === 0 || versionUtilisee.trim().length === 0) {
      throw new ErreurCompatibiliteReferentiel(
        'Les versions de referentiel doivent toujours etre renseignees.',
      );
    }

    if (versionAttendue !== versionUtilisee && (justification ?? '').trim().length === 0) {
      throw new ErreurCompatibiliteReferentiel(
        'Une incompatibilite de referentiel exige une migration ou un diagnostic trace.',
      );
    }
  }
}
