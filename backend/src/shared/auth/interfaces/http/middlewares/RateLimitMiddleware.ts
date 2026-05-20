import { ErreurTentativesConnexionExcessives } from 'shared/auth/domain/exceptions';

interface FenetreRateLimit {
  resetAt: number;
  compteur: number;
}

// Ce middleware HTTP applique un rate limiting local simple sur les routes sensibles AUTH.
export class RateLimitMiddleware {
  private readonly fenetres = new Map<string, FenetreRateLimit>();

  // Cette methode incremente le compteur d'une cle et bloque si la limite est depassee.
  public verifier(cle: string, limite: number, fenetreMs: number): void {
    const maintenant = Date.now();
    const existante = this.fenetres.get(cle);

    if (!existante || existante.resetAt <= maintenant) {
      this.fenetres.set(cle, { compteur: 1, resetAt: maintenant + fenetreMs });
      return;
    }

    if (existante.compteur >= limite) {
      throw new ErreurTentativesConnexionExcessives('Trop de tentatives. Veuillez reessayer plus tard.');
    }

    existante.compteur += 1;
  }
}
