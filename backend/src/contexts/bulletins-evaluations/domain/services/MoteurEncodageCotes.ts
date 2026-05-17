import { FicheCotationEleveCours } from '../aggregates/FicheCotationEleveCours';
import { CodeColonneBulletin } from '../value-objects/CodeColonneBulletin';

// Ce moteur centralise l'encodage des cotes pour garder un point d'entree metier clair.
export class MoteurEncodageCotes {
  // Cette methode delegue un encodage de cote a la fiche tout en gardant le contexte de version.
  public encoder(
    fiche: FicheCotationEleveCours,
    codeColonne: CodeColonneBulletin,
    valeur: number,
    auteur: string,
    versionAttendue?: number,
  ): void {
    fiche.encoderCote(codeColonne, valeur, auteur, versionAttendue);
    fiche.calculerColonnesTotal();
  }

  // Cette methode delegue une modification de cote existante.
  public modifier(
    fiche: FicheCotationEleveCours,
    codeColonne: CodeColonneBulletin,
    valeur: number,
    auteur: string,
    versionAttendue?: number,
  ): void {
    fiche.modifierCote(codeColonne, valeur, auteur, versionAttendue);
    fiche.calculerColonnesTotal();
  }

  // Cette methode vide une cote puis recalcule les colonnes total impactees.
  public vider(
    fiche: FicheCotationEleveCours,
    codeColonne: CodeColonneBulletin,
    auteur: string,
    versionAttendue?: number,
  ): void {
    fiche.viderCote(codeColonne, auteur, versionAttendue);
    fiche.calculerColonnesTotal();
  }
}
