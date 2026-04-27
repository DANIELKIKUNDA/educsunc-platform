import { ValidationError } from '../../../../../shared/exceptions/ValidationError';

// Ce fichier centralise les validations syntaxiques HTTP du BC Scolarite des Eleves.
export type ObjetHttpScolarite = Record<string, unknown>;

/**
 * Cette classe lit et normalise les valeurs HTTP sans appliquer de regle metier.
 */
export class OutilsValidationHttpScolarite {
  /** Transforme une valeur inconnue en objet JSON HTTP. */
  public static obtenirObjet(valeur: unknown, nomSource: string): ObjetHttpScolarite {
    if (valeur === null || valeur === undefined) return {};
    if (typeof valeur !== 'object' || Array.isArray(valeur)) {
      throw new ValidationError(`La source ${nomSource} doit etre un objet JSON.`, 'SCOLARITE_HTTP_SOURCE_INVALIDE');
    }
    return valeur as ObjetHttpScolarite;
  }

  /** Lit une chaine obligatoire non vide. */
  public static lireChaineRequise(donnees: ObjetHttpScolarite, nomChamp: string): string {
    const valeur = donnees[nomChamp];
    if (typeof valeur !== 'string' || valeur.trim().length === 0) {
      throw new ValidationError(`Le champ ${nomChamp} est obligatoire.`, 'SCOLARITE_HTTP_CHAMP_REQUIS');
    }
    return valeur.trim();
  }

  /** Lit une chaine optionnelle. */
  public static lireChaineOptionnelle(donnees: ObjetHttpScolarite, nomChamp: string): string | undefined {
    const valeur = donnees[nomChamp];
    if (valeur === undefined || valeur === null) return undefined;
    if (typeof valeur !== 'string') {
      throw new ValidationError(`Le champ ${nomChamp} doit etre une chaine.`, 'SCOLARITE_HTTP_CHAMP_INVALIDE');
    }
    const valeurNettoyee = valeur.trim();
    return valeurNettoyee.length === 0 ? undefined : valeurNettoyee;
  }

  /** Lit une chaine depuis params en acceptant plusieurs noms possibles. */
  public static lireParametre(donnees: ObjetHttpScolarite, ...noms: string[]): string {
    for (const nom of noms) {
      const valeur = this.lireChaineOptionnelle(donnees, nom);
      if (valeur !== undefined) return valeur;
    }
    throw new ValidationError(`Un des parametres ${noms.join(', ')} est obligatoire.`, 'SCOLARITE_HTTP_PARAMETRE_REQUIS');
  }

  /** Lit un nombre entier optionnel depuis body ou query. */
  public static lireNombreOptionnel(donnees: ObjetHttpScolarite, nomChamp: string): number | undefined {
    const valeur = donnees[nomChamp];
    if (valeur === undefined || valeur === null || valeur === '') return undefined;
    const nombre = typeof valeur === 'number' ? valeur : Number(valeur);
    if (!Number.isInteger(nombre)) {
      throw new ValidationError(`Le champ ${nomChamp} doit etre un entier.`, 'SCOLARITE_HTTP_NOMBRE_INVALIDE');
    }
    return nombre;
  }

  /** Lit une date locale obligatoire au format AAAA-MM-JJ. */
  public static lireDateLocaleRequise(donnees: ObjetHttpScolarite, nomChamp: string): string {
    const valeur = this.lireChaineRequise(donnees, nomChamp);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(valeur) || Number.isNaN(Date.parse(`${valeur}T00:00:00.000Z`))) {
      throw new ValidationError(`Le champ ${nomChamp} doit etre une date AAAA-MM-JJ.`, 'SCOLARITE_HTTP_DATE_INVALIDE');
    }
    return valeur;
  }

  /** Lit une valeur enum obligatoire. */
  public static lireEnumRequis<TValeur extends string>(donnees: ObjetHttpScolarite, nomChamp: string, enumeration: Record<string, TValeur>): TValeur {
    const valeur = this.lireChaineRequise(donnees, nomChamp);
    if (!Object.values(enumeration).includes(valeur as TValeur)) {
      throw new ValidationError(`Le champ ${nomChamp} ne correspond pas a l'enumeration attendue.`, 'SCOLARITE_HTTP_ENUM_INVALIDE');
    }
    return valeur as TValeur;
  }

  /** Lit la pagination query et applique les valeurs par defaut. */
  public static lirePagination(query: unknown): { page?: number; taillePage?: number } {
    const donnees = this.obtenirObjet(query, 'query');
    return {
      page: this.lireNombreOptionnel(donnees, 'page'),
      taillePage: this.lireNombreOptionnel(donnees, 'taillePage'),
    };
  }

  /** Exige une version attendue pour une modification critique. */
  public static lireVersionAttendue(donnees: ObjetHttpScolarite): number {
    const version = this.lireNombreOptionnel(donnees, 'versionAttendue');
    if (version === undefined) {
      throw new ValidationError('versionAttendue est obligatoire.', 'SCOLARITE_HTTP_VERSION_REQUISE');
    }
    return version;
  }

  /** Lit l'idempotency-key depuis les headers HTTP. */
  public static lireIdempotencyKey(headers: unknown, obligatoire: boolean): string | undefined {
    const donnees = this.obtenirObjet(headers, 'headers');
    const valeur = this.lireChaineOptionnelle(donnees, 'idempotency-key') ?? this.lireChaineOptionnelle(donnees, 'Idempotency-Key');
    if (obligatoire && valeur === undefined) {
      throw new ValidationError('Idempotency-Key est obligatoire.', 'SCOLARITE_HTTP_IDEMPOTENCE_REQUISE');
    }
    return valeur;
  }

  /** Construit le contexte commun attendu par les DTO applicatifs. */
  public static lireContexte(headers: unknown, obligatoireIdempotence: boolean): { idOrganisation: string; idEcole: string; idUtilisateur: string; idempotencyKey?: string } {
    const donnees = this.obtenirObjet(headers, 'headers');
    return {
      idOrganisation: this.lireChaineRequise(donnees, 'x-organisation-id'),
      idEcole: this.lireChaineRequise(donnees, 'x-tenant-id'),
      idUtilisateur: this.lireChaineOptionnelle(donnees, 'x-user-id') ?? 'systeme',
      idempotencyKey: this.lireIdempotencyKey(headers, obligatoireIdempotence),
    };
  }
}
