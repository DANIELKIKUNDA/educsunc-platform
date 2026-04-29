import { CaisseJour } from '../../domain/aggregates/CaisseJour';
import { CaisseJourOutput } from '../dto/output/CaisseSortieDTO';

export const versCaisseJourOutput = (caisse: CaisseJour): CaisseJourOutput => ({
  idCaisseJour: caisse.obtenirId(),
  idEcole: caisse.obtenirIdEcole(),
  date: caisse.obtenirDateCaisse(),
  totalEncaisse: caisse.obtenirTotalEncaisse(),
  totalCash: caisse.obtenirTotalCash(),
  totalMobileMoney: caisse.obtenirTotalMobileMoney(),
  totalParCaissier: Array.from(caisse.obtenirTotalParCaissier().entries()).map(([idCaissier, total]) => ({
    idCaissier,
    total,
  })),
  totalParTypeFrais: [],
  totalFondsAnticipes: caisse.obtenirTotalFondsAnticipes(),
  totalFondsConsommes: caisse.obtenirTotalFondsConsommes(),
  disponibleReel: caisse.obtenirDisponibleReel(),
  statut: caisse.obtenirStatut(),
});
