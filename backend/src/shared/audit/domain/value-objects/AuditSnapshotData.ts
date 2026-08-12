import { ObjetValeur } from '../../../domain/ValueObject';

export type ValeurAuditSnapshot = Record<string, unknown> | null | undefined;

const CLE_SENSIBLE_INTERDITE = /mot.?de.?passe|password|token|jwt|cookie|secret|private.?key|authorization/i;

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
      if (CLE_SENSIBLE_INTERDITE.test(cle)) {
        continue;
      }

      if (Array.isArray(contenu)) {
        resultat[cle] = contenu.map((element) => {
          if (element && typeof element === 'object' && !Array.isArray(element)) {
            return AuditSnapshotData.nettoyerObjet(element as Record<string, unknown>);
          }
          return element;
        });
      } else if (contenu && typeof contenu === 'object') {
        resultat[cle] = AuditSnapshotData.nettoyerObjet(contenu as Record<string, unknown>);
      } else {
        resultat[cle] = contenu;
      }
    }
    return resultat;
  }
}
