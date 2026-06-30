export type ScolariteActorCode =
  | 'CAISSIER'
  | 'PREFET_ETUDES'
  | 'DIRECTEUR_ETUDES'
  | 'DIRECTEUR_PRIMAIRE'
  | 'DIRECTEUR_MATERNELLE'
  | 'DIRECTEUR_DISCIPLINE';

export interface ScolariteApiContext {
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

export interface EleveItem {
  idEleve: string;
  idOrganisation: string;
  idEcole: string;
  matricule: string;
  nom: string;
  postNom: string;
  prenom?: string;
  sexe: 'M' | 'F';
  dateNaissance: string;
  statutGlobal: string;
  idFamille?: string;
  typeProvenance: 'INTERNE' | 'EXTERNE';
  nomEcoleProvenance: string;
  version: number;
}

export interface EleveDetail extends EleveItem {
  lieuNaissance?: string;
  nationalite?: string;
  idEcoleProvenance?: string;
  creePar: string;
  creeLe: string;
  modifiePar?: string;
  modifieLe?: string;
  supprimeLogiquement: boolean;
}

export interface ResponsableFamilleItem {
  idResponsableFamille: string;
  nomComplet: string;
  telephone: string;
  telephoneSecondaire?: string;
  profession?: string;
  lienParente: 'PERE' | 'MERE' | 'TUTEUR' | 'TUTRICE' | 'AUTRE';
  adresse?: string;
  estPrincipal: boolean;
  idUtilisateurAuth?: string;
}

export interface FamilleItem {
  idFamille: string;
  idOrganisation: string;
  idEcole: string;
  codeFamille: string;
  nomFamille: string;
  adresse?: string;
  telephonePrincipal: string;
  email?: string;
  responsables: ResponsableFamilleItem[];
  elevesLies?: EleveItem[];
  nombreElevesActifs?: number;
  version: number;
}

export interface FamilleNombreuseItem {
  idFamille: string;
  nombreElevesEligibles: number;
  seuilFamilleNombreuse: number;
  eligible: boolean;
}

export interface InscriptionItem {
  idInscriptionScolaire: string;
  idOrganisation: string;
  idEcole: string;
  idEleve: string;
  idAnneeScolaire: string;
  dateInscription: string;
  origineInscription: 'NOUVEAU' | 'ANCIEN' | 'TRANSFERE_ENTRANT' | 'REINTEGRE';
  statutInscription: string;
  numeroOrdre?: string;
  observation?: string;
  version: number;
}

export interface AffectationItem {
  idAffectationClasse: string;
  idOrganisation: string;
  idEcole: string;
  idInscriptionScolaire: string;
  idClassePedagogique: string;
  dateAffectation: string;
  motifAffectation?: string;
  active: boolean;
  version: number;
}

export interface EleveAffecteClasseItem {
  idEleve: string;
  matricule: string;
  nom: string;
  postNom: string;
  prenom?: string;
  sexe: 'M' | 'F';
  statutGlobal: string;
  idFamille?: string;
  idInscriptionScolaire: string;
  idAffectationClasse: string;
  idClassePedagogique: string;
  dateAffectation: string;
  motifAffectation?: string;
  versionAffectation: number;
}

export interface EvenementParcoursItem {
  idEvenementParcours: string;
  typeEvenement: string;
  dateEvenement: string;
  idAnneeScolaire?: string;
  idClassePedagogique?: string;
  referenceMetier?: string;
  description?: string;
  declenchePar: string;
}

export interface ParcoursEleveItem {
  idParcoursScolaireEleve: string;
  idOrganisation: string;
  idEcole: string;
  idEleve: string;
  historique: EvenementParcoursItem[];
  version: number;
}

export interface InscriptionCompleteRequest {
  eleve: {
    idEleve: string;
    matricule: string;
    nom: string;
    postNom: string;
    prenom?: string;
    sexe: 'M' | 'F';
    dateNaissance: string;
    lieuNaissance?: string;
    nationalite?: string;
    typeProvenance: 'INTERNE' | 'EXTERNE';
    nomEcoleProvenance: string;
    idEcoleProvenance?: string;
    idFamille?: string;
  };
  inscription: {
    idInscriptionScolaire: string;
    idEleve: string;
    idAnneeScolaire: string;
    dateInscription: string;
    origineInscription: 'NOUVEAU' | 'ANCIEN' | 'TRANSFERE_ENTRANT' | 'REINTEGRE';
    numeroOrdre?: string;
    observation?: string;
  };
  affectation?: {
    idAffectationClasse: string;
    idInscriptionScolaire: string;
    idClassePedagogique: string;
    dateAffectation: string;
    motifAffectation?: string;
  };
}

export interface FamilleCreationRequest {
  idFamille: string;
  codeFamille: string;
  nomFamille: string;
  adresse?: string;
  telephonePrincipal: string;
  email?: string;
}

export interface FamilleModificationRequest {
  nomFamille?: string;
  adresse?: string;
  telephonePrincipal?: string;
  email?: string;
  versionAttendue: number;
}

export interface ResponsableFamilleMutationRequest {
  idResponsableFamille: string;
  nomComplet: string;
  telephone: string;
  telephoneSecondaire?: string;
  profession?: string;
  lienParente: 'PERE' | 'MERE' | 'TUTEUR' | 'TUTRICE' | 'AUTRE';
  adresse?: string;
  estPrincipal: boolean;
  idUtilisateurAuth?: string;
  versionAttendue: number;
}

export interface ResponsableFamilleSuppressionRequest {
  versionAttendue: number;
}

export interface RattachementFamilleRequest {
  idFamille: string;
  versionAttendue: number;
}

export interface AffectationCreationRequest {
  idAffectationClasse: string;
  idInscriptionScolaire: string;
  idClassePedagogique: string;
  dateAffectation: string;
  motifAffectation?: string;
}

export interface ChangementClasseRequest {
  idNouvelleClassePedagogique: string;
  motifAffectation?: string;
  versionAttendue: number;
}

export interface ChangementStatutRequest {
  versionAttendue: number;
}

export type CycleVieActionCode =
  | 'abandon'
  | 'transfert'
  | 'reintegration'
  | 'reactivation'
  | 'deces'
  | 'suspension';

export const authorizedInscriptionActors: ScolariteActorCode[] = ['CAISSIER'];
export const authorizedElevesActors: ScolariteActorCode[] = [
  'CAISSIER',
  'PREFET_ETUDES',
  'DIRECTEUR_ETUDES',
  'DIRECTEUR_PRIMAIRE',
  'DIRECTEUR_MATERNELLE',
];
export const authorizedFamillesActors: ScolariteActorCode[] = ['CAISSIER'];
export const authorizedAffectationsActors: ScolariteActorCode[] = [
  'CAISSIER',
  'PREFET_ETUDES',
  'DIRECTEUR_ETUDES',
  'DIRECTEUR_PRIMAIRE',
  'DIRECTEUR_MATERNELLE',
];
export const authorizedCycleVieActors: ScolariteActorCode[] = [
  'CAISSIER',
  'PREFET_ETUDES',
  'DIRECTEUR_ETUDES',
  'DIRECTEUR_PRIMAIRE',
  'DIRECTEUR_MATERNELLE',
  'DIRECTEUR_DISCIPLINE',
];
export const authorizedSuspensionActors: ScolariteActorCode[] = [
  'DIRECTEUR_DISCIPLINE',
  'PREFET_ETUDES',
  'DIRECTEUR_ETUDES',
  'DIRECTEUR_PRIMAIRE',
  'DIRECTEUR_MATERNELLE',
];

export const cycleVieActionsParActeur: Record<ScolariteActorCode, CycleVieActionCode[]> = {
  CAISSIER: ['abandon', 'transfert', 'reintegration', 'reactivation', 'deces'],
  PREFET_ETUDES: ['abandon', 'transfert', 'reintegration', 'reactivation', 'deces', 'suspension'],
  DIRECTEUR_ETUDES: ['abandon', 'transfert', 'reintegration', 'reactivation', 'deces', 'suspension'],
  DIRECTEUR_PRIMAIRE: ['abandon', 'transfert', 'reintegration', 'reactivation', 'deces', 'suspension'],
  DIRECTEUR_MATERNELLE: ['abandon', 'transfert', 'reintegration', 'reactivation', 'deces', 'suspension'],
  DIRECTEUR_DISCIPLINE: ['suspension'],
};

export const cycleVieActionLabels: Record<CycleVieActionCode, string> = {
  abandon: 'Abandon',
  transfert: 'Transfert',
  reintegration: 'Reintegration',
  reactivation: 'Reactivation',
  deces: 'Deces',
  suspension: 'Suspension',
};

export const cycleVieActionDescriptions: Record<CycleVieActionCode, string> = {
  abandon: 'Sortie scolaire constatee et historisee.',
  transfert: 'Mutation externe de l eleve hors ecole.',
  reintegration: 'Retour administratif dans le cycle scolaire actif.',
  reactivation: 'Reouverture d un dossier precedemment inactif.',
  deces: 'Declaration definitive du deces de l eleve.',
  suspension: 'Suspension dans le perimetre disciplinaire ou pedagogique autorise.',
};

export function construireNomComplet(
  nom: string,
  postNom: string,
  prenom?: string,
): string {
  return [nom, postNom, prenom].filter(Boolean).join(' ');
}
