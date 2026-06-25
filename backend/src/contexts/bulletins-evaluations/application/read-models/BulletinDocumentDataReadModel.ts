import type { TypeStructureEvaluation } from '../../../bulletins-evaluations/domain/value-objects/TypeStructureEvaluation';
import type { ApplicationConduiteOutput } from '../dto/output/ApplicationConduiteOutput';
import type { LigneBulletinReadModel } from './LigneBulletinReadModel';

export type BulletinTemplateDocumentaire =
  | 'BULL-TPL-01'
  | 'BULL-TPL-02'
  | 'BULL-TPL-03'
  | 'BULL-TPL-04'
  | 'BULL-TPL-05'
  | 'BULL-TPL-06';

export type BulletinFamilleDocumentaire =
  | 'GENERAL'
  | 'BRANCHES'
  | 'DOMAINES'
  | 'SPECIAL';

export interface BulletinDocumentAssetReadModel {
  nomFichier: string;
  mimeType: string;
  contenu: Uint8Array | Buffer;
}

export interface BulletinDocumentAssetsReadModel {
  logo?: BulletinDocumentAssetReadModel;
  cachet?: BulletinDocumentAssetReadModel;
  signatureChefEtablissement?: BulletinDocumentAssetReadModel;
  drapeau?: BulletinDocumentAssetReadModel;
  filigrane?: BulletinDocumentAssetReadModel;
}

export interface BulletinDocumentMetaReadModel {
  idBulletinEleve: string;
  idEcole: string;
  idEleve: string;
  idClassePedagogique: string;
  idClasseAcademique?: string;
  idAnneeScolaire: string;
  idProgrammeNiveau: string;
  versionReferentielProgramme: string;
  typeStructureEvaluation: TypeStructureEvaluation;
  familleDocumentaire: BulletinFamilleDocumentaire;
  templateDocumentaire: BulletinTemplateDocumentaire;
  estClasseEXETAT?: boolean;
  estClasseFinaliste?: boolean;
  dateGeneration: string;
  libelleAnneeScolaire?: string;
  libelleNiveauDocumentaire?: string;
  dateEditionDocument?: string;
  referenceDocumentaire?: string;
}

export interface BulletinDocumentIdentiteInstitutionnelleReadModel {
  pays: string;
  ministere: string;
  sousTitre: string;
  nomEcole: string;
  codeEcole: string;
  sigleEcole?: string;
  adresseEcole?: string;
  telephoneEcole?: string;
  emailEcole?: string;
  provinceEducationnelle?: string;
  ville?: string;
  communeOuTerritoire?: string;
  villeSignature?: string;
}

export interface BulletinDocumentIdentiteEleveReadModel {
  idEleve: string;
  idClassePedagogique: string;
  idAnneeScolaire: string;
  matricule?: string;
  nom?: string;
  postNom?: string;
  prenom?: string;
  nomComplet?: string;
  sexe?: string;
  dateNaissance?: string;
  lieuNaissance?: string;
  libelleClasse?: string;
  numeroPermanent?: string;
}

export interface BulletinDocumentResumeGlobalReadModel {
  application?: ApplicationConduiteOutput['application'];
  conduite?: ApplicationConduiteOutput['conduite'];
  pointsConduite?: ApplicationConduiteOutput['pointsConduite'];
}

export interface BulletinDocumentStructureReadModel {
  entetesColonnes: string[];
  lignes: LigneBulletinReadModel[];
  blocsApplicationConduite: ApplicationConduiteOutput[];
  resumeGlobal?: BulletinDocumentResumeGlobalReadModel;
}

export interface BulletinDocumentDataReadModel {
  meta: BulletinDocumentMetaReadModel;
  identiteInstitutionnelle: BulletinDocumentIdentiteInstitutionnelleReadModel;
  identiteEleve: BulletinDocumentIdentiteEleveReadModel;
  structure: BulletinDocumentStructureReadModel;
  assets: BulletinDocumentAssetsReadModel;
}
