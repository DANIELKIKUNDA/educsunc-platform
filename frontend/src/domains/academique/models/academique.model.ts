export type AcademiqueActorCode =
  | 'MANAGER_SYSTEME'
  | 'OPERATEUR_SYSTEME'
  | 'SUPPORT_SYSTEME';

export interface AcademiqueApiContext {
  organisationId: string | null;
  ecoleId: string | null;
  utilisateurId: string | null;
}

export interface DetailResponse<TData> {
  donnee: TData;
}

export interface ListResponse<TData> {
  donnees: TData[];
  pagination?: {
    total: number;
    page: number;
    taillePage: number;
    totalPages: number;
  };
}

export interface SectionScolaireItem {
  id: string;
  code: string;
  libelle: string;
  ordreAffichage: number;
  active: boolean;
  creeLe: string;
  version: number;
  modifieLe?: string;
}

export interface ClasseAcademiqueItem {
  id: string;
  idSectionScolaire: string;
  idOptionEtude?: string;
  code: string;
  libelle: string;
  ordrePedagogique: number;
  cycle: string;
  accepteOptions: boolean;
  optionObligatoire: boolean;
  typeStructureEvaluation: string;
  estClasseTENASOSP: boolean;
  estClasseEXETAT: boolean;
  estClasseFinaliste: boolean;
  active: boolean;
  creeLe: string;
  version: number;
  modifieLe?: string;
}

export interface OptionEtudeItem {
  id: string;
  code: number;
  libelle: string;
  typeOption?: string;
  estTechnique: boolean;
  categorieTechnique: 'GROUPE_1' | 'GROUPE_2' | null;
  abreviation?: string;
  ordreAffichage?: number;
  active: boolean;
  creeLe: string;
  version: number;
  modifieLe?: string;
}

export interface ReferentielCoursItem {
  id: string;
  code: string;
  libelle: string;
  actif: boolean;
  creeLe: string;
  version: number;
  abreviation?: string;
  domaine?: string;
  sousDomaine?: string;
  modifieLe?: string;
}

export interface LigneReferentielProgrammeItem {
  id: string;
  idReferentielCours: string;
  ordreAffichage: number;
  obligatoire: boolean;
  aExamen: boolean;
  estCalculable: boolean;
  sourceLigne: string;
  ponderation: Record<string, number>;
  domaine?: string;
  sousDomaine?: string;
}

export interface VersionReferentielProgrammeItem {
  id: string;
  codeVersion: string;
  anneeReference: string;
  datePublication: string;
  active: boolean;
  publiee: boolean;
  sourceImport: string;
  creeLe: string;
  motifPublication?: string;
  lignes: LigneReferentielProgrammeItem[];
}

export interface ReferentielProgrammeItem {
  id: string;
  idClasseAcademique: string;
  typeStructureEvaluation: string;
  versionProjectionnee: VersionReferentielProgrammeItem | null;
  versions: VersionReferentielProgrammeItem[];
  actif: boolean;
  creeLe: string;
  version: number;
}

export interface CreerVersionTravailReferentielRequest {
  idVersionSource: string;
  codeVersion: string;
  anneeReference: string;
  datePublication: string;
  sourceImport?: string;
  motifPublication?: string;
}

export interface AjouterLigneVersionReferentielRequest {
  idReferentielCours: string;
  ordreAffichage: number;
  obligatoire: boolean;
  aExamen: boolean;
  estCalculable: boolean;
  sourceLigne?: string;
  ponderation: Record<string, number>;
  domaine?: string;
  sousDomaine?: string;
}

export interface ModifierLigneVersionReferentielRequest {
  ordreAffichage?: number;
  obligatoire?: boolean;
  aExamen?: boolean;
  estCalculable?: boolean;
  ponderation?: Record<string, number>;
  domaine?: string;
  sousDomaine?: string;
}

export interface ReordonnerLignesVersionReferentielRequest {
  lignes: Array<{
    idLigneReferentielProgramme: string;
    ordreAffichage: number;
  }>;
}

export interface ModifierPonderationLigneVersionReferentielRequest {
  ponderation: Record<string, number>;
}

export interface VerificationCoherenceVersionReferentielItem {
  estCoherente: boolean;
  erreurs: string[];
  avertissements: string[];
  versionReferentielProgramme: VersionReferentielProgrammeItem;
}

export interface RapportComparaisonReferentielItem {
  versionReferentielSource: string;
  versionReferentielCible: string;
  differences: LigneDiffMigrationItem[];
}

export interface LigneDiffMigrationItem {
  codeCours?: string;
  idReferentielCours?: string;
  typeDiff?: string;
  anciennePonderation?: Record<string, number>;
  nouvellePonderation?: Record<string, number>;
  ancienOrdre?: number;
  nouvelOrdre?: number;
  commentaire?: string;
  [key: string]: unknown;
}

export interface TransformationNoteItem {
  idNote?: string;
  ancienneValeur?: number;
  ancienMaximum?: number;
  nouveauMaximum?: number;
  [key: string]: unknown;
}

export interface MigrationReferentielItem {
  id: string;
  idProgrammeNiveau: string;
  idAncienneVersionReferentiel: string;
  idNouvelleVersionReferentiel: string;
  dateMigration: string;
  declenchePar?: string;
  statut: string;
  resumeDiff: string;
  version: number;
  lignesDiffMigration: LigneDiffMigrationItem[];
  transformationsNotes: TransformationNoteItem[];
}

export interface RapportMigrationItem {
  migrationReferentielProgramme: MigrationReferentielItem;
  totalDifferences: number;
  totalTransformationsNotes: number;
}

export interface ApplicationMigrationResultItem {
  migrationReferentielProgramme: MigrationReferentielItem;
  programmeNiveau: Record<string, unknown>;
}

export interface PublicationReferentielRequest {
  idReferentielProgramme: string;
  codeVersion: string;
  anneeReference: string;
  datePublication: string;
  sourceImport: string;
  motifPublication?: string;
}

export interface ComparaisonReferentielRequest {
  idClasseAcademique: string;
  versionReferentielSource: string;
  versionReferentielCible: string;
}

export interface AnalyseMigrationRequest {
  idProgrammeNiveau: string;
  idAncienneVersionReferentiel: string;
  idNouvelleVersionReferentiel: string;
}

export interface ApplicationMigrationRequest {
  idMigrationReferentielProgramme: string;
  demandesTransformationNotes?: Array<{
    idNote: string;
    ancienneValeur: number;
    ancienMaximum: number;
    nouveauMaximum: number;
  }>;
}

export const authorizedAcademiqueReadActors: AcademiqueActorCode[] = [
  'MANAGER_SYSTEME',
  'OPERATEUR_SYSTEME',
];

export const authorizedAcademiqueWriteActors: AcademiqueActorCode[] = [
  'MANAGER_SYSTEME',
  'OPERATEUR_SYSTEME',
];

export type AcademiqueLocalActorCode = 'ADMIN_SYSTEME_ECOLE';

export interface AnneeScolaireItem {
  id: string;
  idEcole: string;
  code: string;
  libelle: string;
  dateDebut: string;
  dateFin: string;
  statut: string;
  active: boolean;
  creeLe: string;
  version: number;
  creePar?: string;
  dateActivation?: string;
  dateCloture?: string;
  dateArchivage?: string;
  modifieLe?: string;
  modifiePar?: string;
}

export interface PreparationAnneeScolaireResponse {
  donnee: AnneeScolaireItem;
  meta: {
    dejaExistante: boolean;
  };
}

export interface GarantieAnneeActiveResponse {
  donnee: AnneeScolaireItem;
  meta: {
    action: string;
  };
}

export interface BasculeAnneeScolaireResponse {
  donnee: {
    anneeCloturee: AnneeScolaireItem;
    anneeActive: AnneeScolaireItem;
  };
  meta: {
    anneeSuivanteCreee: boolean;
  };
}

export interface ClassePedagogiqueItem {
  id: string;
  idEcole: string;
  idAnneeScolaire: string;
  idClasseAcademique: string;
  code: string;
  libelle: string;
  active: boolean;
  creeLe: string;
  version: number;
  suffixeParallele?: string;
  capaciteAccueil?: number;
  archiveLe?: string;
  modifieLe?: string;
}

export interface ReglesFraisClasseItem {
  [key: string]: unknown;
}

export interface ResponsabiliteClassePedagogiqueItem {
  id: string;
  idOrganisation: string;
  idEcole: string;
  idClassePedagogique: string;
  idClasseAcademique: string;
  idSectionScolaire: string;
  sectionCode: string;
  sectionLibelle: string;
  idAnneeScolaire: string;
  idUtilisateurEnseignant: string;
  active: boolean;
  dateDebut: string;
  dateFin?: string;
  creeLe: string;
  creePar?: string;
  version: number;
}

export interface PeriodeCalendrierItem {
  id: string;
  code: string;
  libelle: string;
  ordre: number;
  typePeriode: string;
  dateDebut: string;
  dateFin: string;
}

export interface CalendrierAcademiqueItem {
  id: string;
  idEcole: string;
  idAnneeScolaire: string;
  typeStructureEvaluation: string;
  dateDebutAnnee: string;
  dateFinAnnee: string;
  creeLe: string;
  creePar?: string;
  modifieLe?: string;
  modifiePar?: string;
  version: number;
  verrouille: boolean;
  periodes: PeriodeCalendrierItem[];
}

export interface LigneProgrammeNiveauItem {
  id: string;
  idReferentielCours: string;
  ordreAffichage: number;
  obligatoire: boolean;
  aExamen: boolean;
  estActifDansEcole: boolean;
  estCalculable: boolean;
  obsolete: boolean;
  sourceLigne: string;
  ponderation: Record<string, number>;
}

export interface ProgrammeNiveauItem {
  id: string;
  idEcole: string;
  idAnneeScolaire: string;
  idClasseAcademique: string;
  idReferentielProgramme: string;
  idVersionReferentielProgramme: string;
  statut: string;
  creeLe: string;
  version: number;
  lignes: LigneProgrammeNiveauItem[];
  creePar?: string;
  valideLe?: string;
  validePar?: string;
  archiveLe?: string;
}

export interface EtatLocalProgrammeNiveauItem {
  statut: string;
  lignes: LigneProgrammeNiveauItem[];
  nombreLignesActivesDansEcole: number;
  nombreLignesNonCalculables: number;
  nombreLignesObsoletes: number;
}

export const authorizedAcademiqueLocalActors: AcademiqueLocalActorCode[] = [
  'ADMIN_SYSTEME_ECOLE',
];
