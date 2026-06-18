// Ce fichier masque les donnees sensibles du moteur Notifications.

/** Cette classe centralise le masquage des secrets et metadonnees sensibles. */
export class MasqueurDonneesNotification {
  private readonly clesSensibles = ['secret', 'token', 'password', 'credential', 'authorization', 'apiKey'];

  /** Cette methode masque un dictionnaire technique potentiellement sensible. */
  public masquerObjet(
    objet: Readonly<Record<string, unknown>> = {},
  ): Record<string, unknown> {
    const resultat: Record<string, unknown> = {};

    for (const [cle, valeur] of Object.entries(objet)) {
      if (this.estCleSensible(cle)) {
        resultat[cle] = this.masquerValeur(String(valeur ?? ''));
        continue;
      }

      if (valeur && typeof valeur === 'object' && !Array.isArray(valeur)) {
        resultat[cle] = this.masquerObjet(valeur as Record<string, unknown>);
        continue;
      }

      resultat[cle] = valeur;
    }

    return resultat;
  }

  /** Cette methode masque une chaine sensible de facon deterministic simple. */
  public masquerValeur(valeur: string): string {
    if (valeur.length <= 4) {
      return '****';
    }
    return `${valeur.slice(0, 2)}***${valeur.slice(-2)}`;
  }

  /** Cette methode detecte si une cle est consideree comme sensible. */
  private estCleSensible(cle: string): boolean {
    const normalisee = cle.toLowerCase();
    return this.clesSensibles.some((fragment) => normalisee.includes(fragment.toLowerCase()));
  }
}
