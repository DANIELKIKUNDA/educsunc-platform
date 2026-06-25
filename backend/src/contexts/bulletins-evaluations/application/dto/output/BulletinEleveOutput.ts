import type { EtatBulletin } from 'contexts/bulletins-evaluations/domain/value-objects/EtatBulletin';
import type { TypeStructureEvaluation } from 'contexts/bulletins-evaluations/domain/value-objects/TypeStructureEvaluation';
import type { ApplicationConduiteOutput } from './ApplicationConduiteOutput';
import type { BulletinTemplateDocumentaire } from '../../read-models/BulletinDocumentDataReadModel';
import type { LigneBulletinOutput } from './LigneBulletinOutput';

// Ce DTO represente un bulletin complet pret pour l'UI ou le PDF.
export interface BulletinEleveOutput {
  idBulletinEleve: string;
  idEcole: string;
  idEleve: string;
  idInscriptionScolaire: string;
  idClassePedagogique: string;
  idAnneeScolaire: string;
  idProgrammeNiveau: string;
  versionReferentielProgramme: string;
  typeStructureEvaluation: TypeStructureEvaluation;
  templateDocumentaireSuggere: BulletinTemplateDocumentaire;
  etatBulletin: EtatBulletin;
  versionBulletin: number;
  lignes: LigneBulletinOutput[];
  blocsApplicationConduite: ApplicationConduiteOutput[];
}
