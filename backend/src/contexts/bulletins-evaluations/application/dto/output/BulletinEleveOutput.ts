import type { EtatBulletin } from 'contexts/bulletins-evaluations/domain/value-objects/EtatBulletin';
import type { ApplicationConduiteOutput } from './ApplicationConduiteOutput';
import type { LigneBulletinOutput } from './LigneBulletinOutput';

// Ce DTO represente un bulletin complet pret pour l'UI ou le PDF.
export interface BulletinEleveOutput {
  idBulletinEleve: string;
  idEleve: string;
  idInscriptionScolaire: string;
  idClassePedagogique: string;
  idAnneeScolaire: string;
  etatBulletin: EtatBulletin;
  versionBulletin: number;
  lignes: LigneBulletinOutput[];
  blocsApplicationConduite: ApplicationConduiteOutput[];
}
