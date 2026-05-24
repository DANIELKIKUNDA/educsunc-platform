import { AuditSnapshotData, MasquageDonneesSensibles } from '../../../../domain/value-objects';

const masquage = new MasquageDonneesSensibles();

type JsonStructure = Record<string, unknown> | unknown[] | string | number | boolean | null;

// Ce mapper centralise la gestion JSONB pour eviter les formats divergents.
export class AuditJsonbMapper {
  public static serialiser(valeur: unknown): JsonStructure | null {
    if (valeur === undefined) {
      return null;
    }
    return this.normaliser(valeur);
  }

  public static deserialiserObjet(valeur: unknown): Record<string, unknown> | undefined {
    const normalise = this.normaliser(valeur);
    if (!normalise || typeof normalise !== 'object' || Array.isArray(normalise)) {
      return undefined;
    }
    return normalise;
  }

  public static deserialiserListe(valeur: unknown): unknown[] {
    const normalise = this.normaliser(valeur);
    return Array.isArray(normalise) ? normalise : [];
  }

  public static nettoyerSnapshot(valeur: unknown): Record<string, unknown> | undefined {
    return masquage.nettoyer(this.deserialiserObjet(valeur));
  }

  public static serialiserSnapshot(ancienEtat: unknown, nouvelEtat: unknown): {
    ancien_etat: JsonStructure | null;
    nouvel_etat: JsonStructure | null;
  } {
    const snapshot = new AuditSnapshotData(ancienEtat as Record<string, unknown> | null, nouvelEtat as Record<string, unknown> | null);
    return {
      ancien_etat: this.serialiser(snapshot.obtenirAncienEtat()),
      nouvel_etat: this.serialiser(snapshot.obtenirNouvelEtat()),
    };
  }

  private static normaliser(valeur: unknown): JsonStructure | null {
    if (valeur === null) {
      return null;
    }
    if (valeur instanceof Date) {
      return valeur.toISOString();
    }
    if (typeof valeur === 'string' || typeof valeur === 'number' || typeof valeur === 'boolean') {
      return valeur;
    }
    if (Array.isArray(valeur)) {
      return valeur.map((element) => this.normaliser(element));
    }
    if (typeof valeur === 'object' && valeur) {
      const resultat: Record<string, unknown> = {};
      for (const [cle, contenu] of Object.entries(valeur as Record<string, unknown>)) {
        if (contenu === undefined) {
          continue;
        }
        resultat[cle] = this.normaliser(contenu);
      }
      return resultat;
    }
    return String(valeur);
  }
}
