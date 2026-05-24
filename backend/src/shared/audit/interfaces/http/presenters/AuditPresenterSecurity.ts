import type { AuditEntryOutput } from 'shared/audit/application';

export class AuditPresenterSecurity {
  public static masquerAuditEntry(sortie: AuditEntryOutput): AuditEntryOutput {
    return {
      ...sortie,
      acteur: {
        ...sortie.acteur,
        idUtilisateur: this.masquerIdentifiant(sortie.acteur.idUtilisateur),
      },
      metadata: this.nettoyerMetadata(sortie.metadata),
    };
  }

  private static masquerIdentifiant(valeur?: string): string | undefined {
    if (!valeur) {
      return undefined;
    }
    if (valeur.length <= 4) {
      return '****';
    }
    return `${valeur.slice(0, 2)}****${valeur.slice(-2)}`;
  }

  private static nettoyerMetadata(metadata?: Record<string, unknown>): Record<string, unknown> | undefined {
    if (!metadata) {
      return undefined;
    }

    const resultat: Record<string, unknown> = {};
    for (const [cle, valeur] of Object.entries(metadata)) {
      const cleMinuscule = cle.toLowerCase();
      if (
        cleMinuscule.includes('token')
        || cleMinuscule.includes('password')
        || cleMinuscule.includes('secret')
        || cleMinuscule.includes('apikey')
        || cleMinuscule.includes('api_key')
      ) {
        continue;
      }
      resultat[cle] = valeur;
    }

    return resultat;
  }
}
