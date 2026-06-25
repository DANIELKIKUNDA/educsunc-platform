import type { EtatBulletin } from '../../../bulletins-evaluations/domain/value-objects/EtatBulletin';
import type { TypeStructureEvaluation } from '../../../bulletins-evaluations/domain/value-objects/TypeStructureEvaluation';
import type { ApplicationConduiteOutput } from '../dto/output/ApplicationConduiteOutput';
import type { BulletinTemplateDocumentaire } from './BulletinDocumentDataReadModel';
import type { LigneBulletinReadModel } from './LigneBulletinReadModel';

// Ce read model represente un bulletin complet optimise pour l'UI ou le PDF.
export interface BulletinEleveReadModel {
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
  lignes: LigneBulletinReadModel[];
  blocsApplicationConduite: ApplicationConduiteOutput[];
}
