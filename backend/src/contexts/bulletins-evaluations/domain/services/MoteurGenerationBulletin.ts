import { BulletinEleve } from '../aggregates/BulletinEleve';
import { BlocApplicationConduite } from '../entities/BlocApplicationConduite';
import { LigneBulletinEleve } from '../entities/LigneBulletinEleve';

// Ce moteur orchestre la generation metier du bulletin a partir de donnees deja consolidees.
export class MoteurGenerationBulletin {
  // Cette methode remplit ou met a jour le bulletin avec ses lignes et ses blocs.
  public genererOuMettreAJour(
    bulletin: BulletinEleve,
    lignesBulletin: LigneBulletinEleve[],
    blocsApplicationConduite: BlocApplicationConduite[],
    generePar: string,
    motifGeneration?: string,
  ): void {
    bulletin.genererOuMettreAJour({
      lignesBulletin,
      blocsApplicationConduite,
      generePar,
      motifGeneration,
    });
    bulletin.marquerLignesEchecEnRouge();
  }
}
