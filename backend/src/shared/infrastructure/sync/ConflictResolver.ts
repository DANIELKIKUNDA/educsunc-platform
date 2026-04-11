// Cette interface represente le resultat standardise d'une resolution de conflit de synchronisation.
export interface ResolutionConflit {
  typeConflit: string;
  strategie: string;
  details: Record<string, any>;
}

// Ce resolveur fournit une base transverse de detection et de resolution de conflits.
// Les bounded contexts pourront enrichir ou specialiser ces strategies selon leurs besoins.
export class ResolveurConflit {
  // Cette methode verifie qu'une source peut etre manipulee comme un objet simple.
  private estObjetSimple(valeur: any): valeur is Record<string, any> {
    return valeur !== null && typeof valeur === 'object' && !Array.isArray(valeur);
  }

  // Cette methode normalise une valeur de comparaison pour gerer dates et valeurs primitives.
  private normaliserValeurComparable(valeur: any): string | number | boolean | null {
    if (valeur instanceof Date) {
      return valeur.toISOString();
    }

    if (typeof valeur === 'string' || typeof valeur === 'number' || typeof valeur === 'boolean') {
      return valeur;
    }

    if (valeur === null || valeur === undefined) {
      return null;
    }

    return JSON.stringify(valeur);
  }

  // Cette methode fusionne deux objets simples avec priorite a la source distante.
  private fusionnerObjets(sourceLocale: any, sourceDistante: any): Record<string, any> {
    const locale = this.estObjetSimple(sourceLocale) ? sourceLocale : {};
    const distante = this.estObjetSimple(sourceDistante) ? sourceDistante : {};

    return {
      ...locale,
      ...distante,
    };
  }

  // Cette methode detecte un conflit en comparant les champs techniques version et dateMiseAJour lorsqu'ils existent.
  public detecterConflit(sourceLocale: any, sourceDistante: any): boolean {
    if (!this.estObjetSimple(sourceLocale) || !this.estObjetSimple(sourceDistante)) {
      return false;
    }

    if ('version' in sourceLocale && 'version' in sourceDistante) {
      const versionLocale = this.normaliserValeurComparable(sourceLocale.version);
      const versionDistante = this.normaliserValeurComparable(sourceDistante.version);

      if (versionLocale !== null && versionDistante !== null && versionLocale !== versionDistante) {
        return true;
      }
    }

    if ('dateMiseAJour' in sourceLocale && 'dateMiseAJour' in sourceDistante) {
      const dateLocale = this.normaliserValeurComparable(sourceLocale.dateMiseAJour);
      const dateDistante = this.normaliserValeurComparable(sourceDistante.dateMiseAJour);

      if (dateLocale !== null && dateDistante !== null && dateLocale !== dateDistante) {
        return true;
      }
    }

    return false;
  }

  // Cette methode resout un conflit en favorisant la source distante.
  public resoudreParPrioriteDistante(sourceLocale: any, sourceDistante: any): ResolutionConflit {
    return {
      typeConflit: 'CONFLIT_DETECTE',
      strategie: 'PRIORITE_DISTANTE',
      details: {
        sourceLocale,
        sourceDistante,
        resultat: sourceDistante,
      },
    };
  }

  // Cette methode resout un conflit en favorisant la source locale.
  public resoudreParPrioriteLocale(sourceLocale: any, sourceDistante: any): ResolutionConflit {
    return {
      typeConflit: 'CONFLIT_DETECTE',
      strategie: 'PRIORITE_LOCALE',
      details: {
        sourceLocale,
        sourceDistante,
        resultat: sourceLocale,
      },
    };
  }

  // Cette methode resout un conflit par fusion simple avec priorite a la source distante sur les cles en conflit.
  public resoudreParFusionSimple(sourceLocale: any, sourceDistante: any): ResolutionConflit {
    return {
      typeConflit: 'CONFLIT_DETECTE',
      strategie: 'FUSION_SIMPLE',
      details: {
        sourceLocale,
        sourceDistante,
        resultat: this.fusionnerObjets(sourceLocale, sourceDistante),
      },
    };
  }
}
