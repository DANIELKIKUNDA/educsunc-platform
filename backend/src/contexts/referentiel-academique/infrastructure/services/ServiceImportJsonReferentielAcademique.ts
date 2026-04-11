import { InfrastructureError } from '../../../../shared/exceptions/InfrastructureError';
import { ValidationError } from '../../../../shared/exceptions/ValidationError';

// Cette interface represente le resultat technique d'un chargement JSON du BC.
export interface ResultatImportJsonReferentielAcademique<TValeur> {
  readonly valeur: TValeur;
  readonly tailleOctets: number;
}

// Ce service technique centralise le chargement et le parsing JSON du BC.
export class ServiceImportJsonReferentielAcademique {
  // Cette methode parse un contenu JSON brut en objet ou tableau exploitable.
  public chargerDepuisTexte<TValeur extends object>(
    contenu: string | Buffer,
  ): ResultatImportJsonReferentielAcademique<TValeur> {
    const texte = this.normaliserContenu(contenu);

    try {
      const valeur = JSON.parse(texte) as unknown;

      if (typeof valeur !== 'object' || valeur === null) {
        throw new ValidationError(
          "Le contenu JSON du referentiel doit produire un objet ou un tableau.",
          'IMPORT_JSON_REFERENTIEL_STRUCTURE_INVALIDE',
        );
      }

      return {
        valeur: valeur as TValeur,
        tailleOctets: Buffer.byteLength(texte, 'utf8'),
      };
    } catch (erreur) {
      if (erreur instanceof ValidationError) {
        throw erreur;
      }

      throw new InfrastructureError(
        "Le contenu JSON du referentiel academique est invalide.",
        'IMPORT_JSON_REFERENTIEL_PARSE',
        {
          messageErreur: this.decrireErreur(erreur),
        },
      );
    }
  }

  // Cette methode retourne un objet racine et refuse les tableaux directs.
  public chargerObjetDepuisTexte<TObjet extends Record<string, unknown>>(
    contenu: string | Buffer,
  ): ResultatImportJsonReferentielAcademique<TObjet> {
    const resultat = this.chargerDepuisTexte<TObjet | readonly unknown[]>(contenu);

    if (Array.isArray(resultat.valeur)) {
      throw new ValidationError(
        "Le contenu JSON du referentiel doit etre un objet racine.",
        'IMPORT_JSON_REFERENTIEL_OBJET_ATTENDU',
      );
    }

    return {
      valeur: resultat.valeur as TObjet,
      tailleOctets: resultat.tailleOctets,
    };
  }

  // Cette methode extrait un tableau situe sous une cle racine connue.
  public chargerTableauDepuisCle<TElement extends object>(
    contenu: string | Buffer,
    cleRacine: string,
  ): ResultatImportJsonReferentielAcademique<readonly TElement[]> {
    const cleNormalisee = this.normaliserCleRacine(cleRacine);
    const resultat = this.chargerObjetDepuisTexte<Record<string, unknown>>(contenu);
    const valeur = resultat.valeur[cleNormalisee];

    if (!Array.isArray(valeur)) {
      throw new ValidationError(
        `La cle racine "${cleNormalisee}" doit contenir un tableau JSON.`,
        'IMPORT_JSON_REFERENTIEL_TABLEAU_ATTENDU',
        {
          cleRacine: cleNormalisee,
        },
      );
    }

    for (const element of valeur) {
      if (typeof element !== 'object' || element === null || Array.isArray(element)) {
        throw new ValidationError(
          `La cle racine "${cleNormalisee}" doit contenir uniquement des objets JSON.`,
          'IMPORT_JSON_REFERENTIEL_ELEMENT_INVALIDE',
          {
            cleRacine: cleNormalisee,
          },
        );
      }
    }

    return {
      valeur: valeur as readonly TElement[],
      tailleOctets: resultat.tailleOctets,
    };
  }

  // Cette methode transforme un contenu brut en texte JSON exploitable.
  private normaliserContenu(contenu: string | Buffer): string {
    const texte = typeof contenu === 'string' ? contenu : contenu.toString('utf8');
    const texteNormalise = texte.trim();

    if (texteNormalise.length === 0) {
      throw new ValidationError(
        "Le contenu JSON du referentiel academique ne peut pas etre vide.",
        'IMPORT_JSON_REFERENTIEL_VIDE',
      );
    }

    return texteNormalise;
  }

  // Cette methode valide la cle racine attendue dans le document JSON.
  private normaliserCleRacine(cleRacine: string): string {
    const valeur = cleRacine.trim();

    if (valeur.length === 0) {
      throw new ValidationError(
        'La cle racine du chargement JSON est obligatoire.',
        'IMPORT_JSON_REFERENTIEL_CLE_RACINE_INVALIDE',
      );
    }

    return valeur;
  }

  // Cette methode decrit une erreur inconnue de maniere robuste.
  private decrireErreur(erreur: unknown): string {
    if (erreur instanceof Error) {
      return erreur.message;
    }

    if (typeof erreur === 'string') {
      return erreur;
    }

    try {
      return JSON.stringify(erreur);
    } catch {
      return 'Erreur inconnue';
    }
  }
}
