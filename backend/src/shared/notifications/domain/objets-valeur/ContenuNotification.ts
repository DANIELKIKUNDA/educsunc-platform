import { ObjetValeur } from '../../../domain/ValueObject';
import { CanalNotification } from '../enumerations';

/**
 * Cet objet-valeur represente le contenu metier et ses differentes variantes de rendu.
 */
export class ContenuNotification extends ObjetValeur<{
  titre?: string;
  message: string;
  placeholders: Record<string, string>;
  codeModele?: string;
  versionModele?: number;
  instantRendu?: Date;
  snapshotRendu?: string;
  chargesParCanal: Partial<Record<CanalNotification, string>>;
}> {
  /**
   * Ce constructeur valide les elements minimums du contenu.
   */
  constructor(
    message: string,
    titre?: string,
    placeholders: Record<string, string> = {},
    codeModele?: string,
    versionModele?: number,
    instantRendu?: Date,
    snapshotRendu?: string,
    chargesParCanal: Partial<Record<CanalNotification, string>> = {},
  ) {
    super({
      titre: ContenuNotification.nettoyer(titre),
      message: ContenuNotification.valider(message),
      placeholders: { ...placeholders },
      codeModele: ContenuNotification.nettoyer(codeModele),
      versionModele,
      instantRendu,
      snapshotRendu: ContenuNotification.nettoyer(snapshotRendu),
      chargesParCanal: { ...chargesParCanal },
    });
  }

  /** Cette methode expose le message principal de la notification. */
  public obtenirMessage(): string { return this.proprietes.message; }

  /** Cette methode expose les placeholders declares pour le rendu. */
  public obtenirPlaceholders(): Record<string, string> { return { ...this.proprietes.placeholders }; }

  /** Cette methode expose le snapshot du rendu si un moteur a deja produit un texte final. */
  public obtenirSnapshotRendu(): string | undefined { return this.proprietes.snapshotRendu; }

  /** Cette methode centralise la validation du contenu principal. */
  private static valider(valeur: string): string {
    if (typeof valeur !== 'string' || valeur.trim().length === 0) {
      throw new Error('Le message principal d une notification est obligatoire.');
    }
    return valeur.trim();
  }

  /** Cette methode normalise les champs textuels optionnels. */
  private static nettoyer(valeur?: string): string | undefined {
    const propre = String(valeur ?? '').trim();
    return propre.length > 0 ? propre : undefined;
  }
}
