import { ObjetValeur } from '../../../domain/ValueObject';

export type ValeurAuditSnapshot = Record<string, unknown> | null | undefined;

const CLES_SENSIBLES_INTERDITES = [
  'motDePasse',
  'password',
  'passwordHash',
  'refreshToken',
  'jwt',
  'accessToken',
  'secret',
  'privateKey',
  'mobileMoneyToken',
] as const;

// Ce value object porte les anciens et nouveaux etats apres nettoyage des données sensibles.
export class AuditSnapshotData extends ObjetValeur<{
  ancienEtat?: Record<string, unknown>;
  nouvelEtat?: Record<string, unknown>;
}> {
  constructor(ancienEtat?: ValeurAuditSnapshot, nouvelEtat?: ValeurAuditSnapshot) {
    super({
      ancienEtat: AuditSnapshotData.nettoyerObjet(ancienEtat),
      nouvelEtat: AuditSnapshotData.nettoyerObjet(nouvelEtat),
    });
  }

  public obtenirAncienEtat(): Record<string, unknown> | undefined {
    return this.proprietes.ancienEtat ? { ...this.proprietes.ancienEtat } : undefined;
  }

  public obtenirNouvelEtat(): Record<string, unknown> | undefined {
    return this.proprietes.nouvelEtat ? { ...this.proprietes.nouvelEtat } : undefined;
  }

  public static nettoyerObjet(valeur?: ValeurAuditSnapshot): Record<string, unknown> | undefined {
    if (!valeur || typeof valeur !== 'object' || Array.isArray(valeur)) {
      return undefined;
    }

    const entree = valeur as Record<string, unknown>;
    const resultat: Record<string, unknown> = {};
    for (const [cle, contenu] of Object.entries(entree)) {
      if (CLES_SENSIBLES_INTERDITES.includes(cle as (typeof CLES_SENSIBLES_INTERDITES)[number])) {
        continue;
      }

      if (contenu && typeof contenu === 'object' && !Array.isArray(contenu)) {
        resultat[cle] = AuditSnapshotData.nettoyerObjet(contenu as Record<string, unknown>);
      } else {
        resultat[cle] = contenu;
      }
    }
    return resultat;
  }
}
