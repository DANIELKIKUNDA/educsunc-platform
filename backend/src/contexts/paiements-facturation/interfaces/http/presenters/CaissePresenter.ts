import type { CaisseJourOutput } from '../../../application/dto/output/CaisseSortieDTO';
import { PresentationHttpPaiementsFacturation } from './PresentationHttpPaiementsFacturation';

// Ce fichier presente la synthese d'une caisse journaliere pour l'interface HTTP.
export class CaissePresenter {
  // Cette methode presente une caisse journaliere sous une forme stable pour le frontend.
  public static presenterCaisse(caisse: CaisseJourOutput): { donnee: unknown } {
    return PresentationHttpPaiementsFacturation.detail({
      idCaisseJour: caisse.idCaisseJour,
      idEcole: caisse.idEcole,
      date: caisse.date,
      totalEncaisse: PresentationHttpPaiementsFacturation.presenterMontant(
        caisse.totalEncaisse,
      ),
      totalCash: PresentationHttpPaiementsFacturation.presenterMontant(caisse.totalCash),
      totalMobileMoney: PresentationHttpPaiementsFacturation.presenterMontant(
        caisse.totalMobileMoney,
      ),
      totalParCaissier: caisse.totalParCaissier.map((ligne) => ({
        idCaissier: ligne.idCaissier,
        total: PresentationHttpPaiementsFacturation.presenterMontant(ligne.total),
      })),
      totalParTypeFrais: caisse.totalParTypeFrais.map((ligne) => ({
        typeFrais: ligne.typeFrais,
        total: PresentationHttpPaiementsFacturation.presenterMontant(ligne.total),
      })),
      totalFondsAnticipes: PresentationHttpPaiementsFacturation.presenterMontant(
        caisse.totalFondsAnticipes,
      ),
      totalFondsConsommes: PresentationHttpPaiementsFacturation.presenterMontant(
        caisse.totalFondsConsommes,
      ),
      disponibleReel: PresentationHttpPaiementsFacturation.presenterMontant(
        caisse.disponibleReel,
      ),
      statut: caisse.statut,
    });
  }
}
