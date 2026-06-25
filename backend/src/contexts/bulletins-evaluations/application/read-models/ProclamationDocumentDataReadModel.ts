import type { CodeColonneBulletin } from '../../domain/value-objects/CodeColonneBulletin';
import type { TypeProclamation } from '../../domain/value-objects/TypeProclamation';
import type { AbandonOutput } from '../dto/output/AbandonOutput';
import type { LigneProclamationOutput } from '../dto/output/LigneProclamationOutput';
import type { NonClasseOutput } from '../dto/output/NonClasseOutput';
import type { StatistiquesProclamationOutput } from '../dto/output/StatistiquesProclamationOutput';

export type ProclamationTemplateDocumentaire = 'PROCL-TPL-01';

export interface ProclamationDocumentAssetReadModel {
  nomFichier: string;
  mimeType: string;
  contenu: Uint8Array | Buffer;
}

export interface ProclamationDocumentAssetsReadModel {
  logo?: ProclamationDocumentAssetReadModel;
  cachet?: ProclamationDocumentAssetReadModel;
  signatureChefEtablissement?: ProclamationDocumentAssetReadModel;
}

export interface ProclamationDocumentMetaReadModel {
  idProclamationClasse: string;
  idEcole?: string;
  idClassePedagogique: string;
  idAnneeScolaire: string;
  codeColonne: CodeColonneBulletin;
  typeProclamation: TypeProclamation;
  templateDocumentaire: ProclamationTemplateDocumentaire;
  dateGenerationDocument: string;
  libelleAnneeScolaire?: string;
  libellePeriode?: string;
  dateEditionDocument?: string;
}

export interface ProclamationDocumentIdentiteInstitutionnelleReadModel {
  nomEcole: string;
  codeEcole?: string;
  sigleEcole?: string;
  adresseEcole?: string;
  telephoneEcole?: string;
  emailEcole?: string;
  provinceEducationnelle?: string;
  ville?: string;
  communeOuTerritoire?: string;
}

export interface ProclamationDocumentContexteClasseReadModel {
  idClassePedagogique: string;
  libelleClasse?: string;
  idSectionScolaire?: string;
  libelleSection?: string;
  nomTitulaire?: string;
}

export interface ProclamationDocumentStructureReadModel {
  lignesClassees: LigneProclamationOutput[];
  nonClasses: NonClasseOutput[];
  abandons: AbandonOutput[];
  statistiques?: StatistiquesProclamationOutput;
}

export interface ProclamationDocumentDataReadModel {
  meta: ProclamationDocumentMetaReadModel;
  identiteInstitutionnelle: ProclamationDocumentIdentiteInstitutionnelleReadModel;
  contexteClasse: ProclamationDocumentContexteClasseReadModel;
  structure: ProclamationDocumentStructureReadModel;
  assets: ProclamationDocumentAssetsReadModel;
}
