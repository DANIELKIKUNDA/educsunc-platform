// Ce mapper applicatif convertit les contrats Audit sans embarquer la persistence.
export class AuditSnapshotMapper {
  private static readonly champsInterdits = new Set(['password', 'motDePasse', 'jwt', 'refreshToken', 'token', 'secret', 'apiKey']);

  public static sanitiserSnapshot(valeur: unknown): unknown {
    if (Array.isArray(valeur)) {
      return valeur.map((item) => this.sanitiserSnapshot(item));
    }
    if (!valeur || typeof valeur !== 'object') {
      return valeur;
    }
    const source = valeur as Record<string, unknown>;
    const sortie: Record<string, unknown> = {};
    for (const [cle, element] of Object.entries(source)) {
      if (this.champsInterdits.has(cle)) continue;
      sortie[cle] = this.sanitiserSnapshot(element);
    }
    return sortie;
  }
}
