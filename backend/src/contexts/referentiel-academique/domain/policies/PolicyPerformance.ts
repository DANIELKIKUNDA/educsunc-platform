import { ValidationError } from '../../../../shared/exceptions/ValidationError';

// Cette policy porte les regles globales de performance imposees au bounded context.
export class PolicyPerformance {
  // Cette methode impose une pagination explicite pour toute lecture potentiellement volumineuse.
  public verifierPaginationObligatoire(
    pageCourante: number | undefined,
    taillePage: number | undefined,
  ): void {
    if (
      pageCourante === undefined
      || !Number.isInteger(pageCourante)
      || pageCourante <= 0
    ) {
      throw new ValidationError(
        'La pagination est obligatoire et doit porter un numero de page entier positif.',
        'POLICY_PERFORMANCE_PAGE_INVALIDE',
      );
    }

    if (
      taillePage === undefined
      || !Number.isInteger(taillePage)
      || taillePage <= 0
    ) {
      throw new ValidationError(
        'La pagination est obligatoire et doit porter une taille de page entiere positive.',
        'POLICY_PERFORMANCE_TAILLE_PAGE_INVALIDE',
      );
    }
  }

  // Cette methode impose qu'une cle de cache explicite soit definie pour les lectures a mettre en cache.
  public verifierCacheObligatoire(cleCache: string | undefined): void {
    if (cleCache === undefined || cleCache.trim().length === 0) {
      throw new ValidationError(
        'Le cache obligatoire exige une cle de cache explicite et non vide.',
        'POLICY_PERFORMANCE_CACHE_OBLIGATOIRE',
      );
    }
  }
}
