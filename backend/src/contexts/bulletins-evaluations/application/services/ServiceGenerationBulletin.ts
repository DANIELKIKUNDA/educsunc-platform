import { MoteurGenerationBulletin } from '../../domain/services/MoteurGenerationBulletin';
import type { BulletinEleve } from '../../domain/aggregates/BulletinEleve';
import type { BlocApplicationConduite } from '../../domain/entities/BlocApplicationConduite';
import type { LigneBulletinEleve } from '../../domain/entities/LigneBulletinEleve';

// Ce service coordonne la generation applicative d'un bulletin.
export class ServiceGenerationBulletin {
  constructor(private readonly moteurGenerationBulletin = new MoteurGenerationBulletin()) {}

  // Cette methode demande au moteur de generer ou mettre a jour le bulletin.
  public generer(
    bulletin: BulletinEleve,
    lignes: LigneBulletinEleve[],
    blocs: BlocApplicationConduite[],
    idUtilisateur: string,
    motifGeneration?: string,
  ): void {
    this.moteurGenerationBulletin.genererOuMettreAJour(
      bulletin,
      lignes,
      blocs,
      idUtilisateur,
      motifGeneration,
    );
  }
}
