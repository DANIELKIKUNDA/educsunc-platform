import { Entite } from '../../../../shared/domain/Entity';
import { CodeColonneBulletin } from '../value-objects/CodeColonneBulletin';
import { StyleAffichageCote } from '../value-objects/StyleAffichageCote';

// Cette entite represente une ligne de cours affichee sur le bulletin.
export class LigneBulletinEleve extends Entite<string> {
  private idReferentielCours: string;
  private libelleCours: string;
  private ordreAffichage: number;
  private estCalculable: boolean;
  private aExamen: boolean;
  private cotesColonnes: Partial<Record<CodeColonneBulletin, number | null>>;
  private totauxColonnes: Partial<Record<CodeColonneBulletin, number | null>>;
  private stylesColonnes: Partial<Record<CodeColonneBulletin, StyleAffichageCote>>;

  // Ce constructeur initialise la representation metier d'une ligne du bulletin.
  constructor(params: {
    idLigneBulletinEleve: string;
    idReferentielCours: string;
    libelleCours: string;
    ordreAffichage: number;
    estCalculable: boolean;
    aExamen: boolean;
    cotesColonnes?: Partial<Record<CodeColonneBulletin, number | null>>;
    totauxColonnes?: Partial<Record<CodeColonneBulletin, number | null>>;
    stylesColonnes?: Partial<Record<CodeColonneBulletin, StyleAffichageCote>>;
  }) {
    super(params.idLigneBulletinEleve);
    this.idReferentielCours = params.idReferentielCours;
    this.libelleCours = params.libelleCours;
    this.ordreAffichage = params.ordreAffichage;
    this.estCalculable = params.estCalculable;
    this.aExamen = params.aExamen;
    this.cotesColonnes = { ...(params.cotesColonnes ?? {}) };
    this.totauxColonnes = { ...(params.totauxColonnes ?? {}) };
    this.stylesColonnes = { ...(params.stylesColonnes ?? {}) };
  }

  // Cette methode expose l'identifiant du cours de reference.
  public obtenirIdReferentielCours(): string {
    return this.idReferentielCours;
  }

  // Cette methode expose le libelle du cours.
  public obtenirLibelleCours(): string {
    return this.libelleCours;
  }

  // Cette methode expose l'ordre officiel d'affichage.
  public obtenirOrdreAffichage(): number {
    return this.ordreAffichage;
  }

  // Cette methode indique si le cours participe aux calculs globaux.
  public obtenirEstCalculable(): boolean {
    return this.estCalculable;
  }

  // Cette methode indique si le cours comporte une colonne examen.
  public obtenirAExamen(): boolean {
    return this.aExamen;
  }

  // Cette methode expose les cotes directes visibles sur la ligne.
  public obtenirCotesColonnes(): Partial<Record<CodeColonneBulletin, number | null>> {
    return { ...this.cotesColonnes };
  }

  // Cette methode expose les totaux calcules visibles sur la ligne.
  public obtenirTotauxColonnes(): Partial<Record<CodeColonneBulletin, number | null>> {
    return { ...this.totauxColonnes };
  }

  // Cette methode expose les styles visuels de chaque colonne.
  public obtenirStylesColonnes(): Partial<Record<CodeColonneBulletin, StyleAffichageCote>> {
    return { ...this.stylesColonnes };
  }

  // Cette methode pose une cote visible pour une colonne.
  public definirCote(codeColonne: CodeColonneBulletin, valeur: number | null): void {
    this.cotesColonnes[codeColonne] = valeur;
  }

  // Cette methode pose un total visible pour une colonne calculee.
  public definirTotal(codeColonne: CodeColonneBulletin, valeur: number | null): void {
    this.totauxColonnes[codeColonne] = valeur;
  }

  // Cette methode memorise le style visuel d'une colonne.
  public definirStyle(codeColonne: CodeColonneBulletin, style: StyleAffichageCote): void {
    this.stylesColonnes[codeColonne] = style;
  }
}
