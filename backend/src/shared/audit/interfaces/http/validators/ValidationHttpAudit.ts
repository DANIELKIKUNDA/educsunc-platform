export class ValidationHttpAudit {
  public static obtenirObjet(entree: unknown, source: string): Record<string, unknown> {
    if (typeof entree !== 'object' || entree === null || Array.isArray(entree)) {
      throw new Error(`${source} doit être un objet.`);
    }
    return entree as Record<string, unknown>;
  }

  public static lireChaineOptionnelle(objet: Record<string, unknown>, cle: string): string | undefined {
    const valeur = objet[cle];
    if (valeur == null) {
      return undefined;
    }
    if (typeof valeur !== 'string') {
      throw new Error(`${cle} doit être une chaîne.`);
    }
    const nettoyee = valeur.trim();
    return nettoyee.length > 0 ? nettoyee : undefined;
  }

  public static lireChaineRequise(objet: Record<string, unknown>, cle: string): string {
    const valeur = this.lireChaineOptionnelle(objet, cle);
    if (!valeur) {
      throw new Error(`${cle} est requis.`);
    }
    return valeur;
  }

  public static lireBooleenOptionnel(objet: Record<string, unknown>, cle: string): boolean | undefined {
    const valeur = objet[cle];
    if (valeur == null) {
      return undefined;
    }
    if (typeof valeur !== 'boolean') {
      throw new Error(`${cle} doit être un booléen.`);
    }
    return valeur;
  }

  public static lireNombreOptionnel(objet: Record<string, unknown>, cle: string): number | undefined {
    const valeur = objet[cle];
    if (valeur == null) {
      return undefined;
    }
    if (typeof valeur !== 'number' || !Number.isFinite(valeur)) {
      throw new Error(`${cle} doit être un nombre.`);
    }
    return valeur;
  }

  public static lireEntierOptionnel(objet: Record<string, unknown>, cle: string): number | undefined {
    const valeur = this.lireNombreOptionnel(objet, cle);
    if (valeur == null) {
      return undefined;
    }
    if (!Number.isInteger(valeur)) {
      throw new Error(`${cle} doit être un entier.`);
    }
    return valeur;
  }

  public static lireEntierDansBornes(
    objet: Record<string, unknown>,
    cle: string,
    min: number,
    max: number,
    requis = false,
  ): number | undefined {
    const valeur = requis ? this.lireEntierRequis(objet, cle) : this.lireEntierOptionnel(objet, cle);
    if (valeur == null) {
      return undefined;
    }
    if (valeur < min || valeur > max) {
      throw new Error(`${cle} doit être compris entre ${min} et ${max}.`);
    }
    return valeur;
  }

  public static lireEntierQueryDansBornes(
    objet: Record<string, unknown>,
    cle: string,
    min: number,
    max: number,
  ): number | undefined {
    const valeurBrute = objet[cle];
    if (valeurBrute == null) {
      return undefined;
    }

    const valeur = typeof valeurBrute === 'string' && /^-?\d+$/.test(valeurBrute.trim())
      ? Number(valeurBrute)
      : valeurBrute;
    if (typeof valeur !== 'number' || !Number.isSafeInteger(valeur)) {
      throw new Error(`${cle} doit être un entier.`);
    }
    if (valeur < min || valeur > max) {
      throw new Error(`${cle} doit être compris entre ${min} et ${max}.`);
    }
    return valeur;
  }

  public static lireEntierRequis(objet: Record<string, unknown>, cle: string): number {
    const valeur = this.lireEntierOptionnel(objet, cle);
    if (valeur == null) {
      throw new Error(`${cle} est requis.`);
    }
    return valeur;
  }

  public static lireDateIsoOptionnelle(objet: Record<string, unknown>, cle: string): string | undefined {
    const valeur = this.lireChaineOptionnelle(objet, cle);
    if (!valeur) {
      return undefined;
    }
    if (Number.isNaN(Date.parse(valeur))) {
      throw new Error(`${cle} doit être une date ISO valide.`);
    }
    return valeur;
  }

  public static lireTableauChainesOptionnel(objet: Record<string, unknown>, cle: string): string[] | undefined {
    const valeur = objet[cle];
    if (valeur == null) {
      return undefined;
    }
    if (!Array.isArray(valeur)) {
      throw new Error(`${cle} doit être une liste.`);
    }
    return valeur.map((item, index) => {
      if (typeof item !== 'string' || item.trim().length === 0) {
        throw new Error(`${cle}[${index}] doit être une chaîne non vide.`);
      }
      return item.trim();
    });
  }

  public static lireEnumOptionnel<T extends string>(
    objet: Record<string, unknown>,
    cle: string,
    valeurs: readonly T[],
  ): T | undefined {
    const valeur = this.lireChaineOptionnelle(objet, cle);
    if (!valeur) {
      return undefined;
    }
    if (!valeurs.includes(valeur as T)) {
      throw new Error(`${cle} doit être l'une des valeurs suivantes: ${valeurs.join(', ')}.`);
    }
    return valeur as T;
  }

  public static lireRecordOptionnel(objet: Record<string, unknown>, cle: string): Record<string, unknown> | undefined {
    const valeur = objet[cle];
    if (valeur == null) {
      return undefined;
    }
    return this.obtenirObjet(valeur, cle);
  }

  public static lireHeaders(headers: unknown): Record<string, unknown> {
    return this.obtenirObjet(headers ?? {}, 'headers');
  }

  public static lireHeaderChaine(headers: unknown, cle: string): string | undefined {
    const objet = this.lireHeaders(headers);
    const valeur = objet[cle];
    if (typeof valeur === 'string') {
      return valeur;
    }
    if (Array.isArray(valeur) && typeof valeur[0] === 'string') {
      return valeur[0];
    }
    return undefined;
  }

  public static validerPagination(objet: Record<string, unknown>): void {
    this.lireEntierQueryDansBornes(objet, 'page', 1, 10_000);
    this.lireEntierQueryDansBornes(objet, 'taillePage', 1, 500);
  }

  public static validerTenant(objet: Record<string, unknown>): void {
    this.lireChaineOptionnelle(objet, 'organisationId');
    this.lireChaineOptionnelle(objet, 'ecoleId');
    this.lireChaineOptionnelle(objet, 'scope');
  }

  public static validerCorrelation(objet: Record<string, unknown>): void {
    this.lireChaineOptionnelle(objet, 'correlationId');
    this.lireChaineOptionnelle(objet, 'requestId');
  }
}
