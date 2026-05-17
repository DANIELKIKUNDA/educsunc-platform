import type { EtatBulletin } from '../../../bulletins-evaluations/domain/value-objects/EtatBulletin';
import type { ApplicationConduiteOutput } from '../dto/output/ApplicationConduiteOutput';
import type { LigneBulletinReadModel } from './LigneBulletinReadModel';

// Ce read model represente un bulletin complet optimise pour l'UI ou le PDF.
export interface BulletinEleveReadModel {
  idBulletinEleve: string;
  idEleve: string;
  idInscriptionScolaire: string;
  idClassePedagogique: string;
  idAnneeScolaire: string;
  etatBulletin: EtatBulletin;
  versionBulletin: number;
  lignes: LigneBulletinReadModel[];
  blocsApplicationConduite: ApplicationConduiteOutput[];
}
