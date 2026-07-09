export interface PaginationHttp {
  total: number;
  page: number;
  taillePage: number;
  totalPages: number;
}

export interface OrganisationItem {
  id: string;
  code: string;
  nom: string;
  typeOrganisation: string;
  actif: boolean;
  creeLe: string;
  creePar?: string;
  modifieLe?: string;
  modifiePar?: string;
  description?: string;
  promoteurPrincipal?: {
    utilisateurId?: string;
    nomComplet: string;
    email?: string;
    telephone?: string;
    identifiant?: string;
  };
  version: number;
}

export interface EcoleItem {
  id: string;
  idOrganisation: string;
  code: string;
  nom: string;
  modeExploitation: string;
  actif: boolean;
  creeLe: string;
  version: number;
  sigle?: string;
  adresse?: string;
  telephone?: string;
  email?: string;
  provinceEducationnelle?: string;
  ville?: string;
  communeOuTerritoire?: string;
  creePar?: string;
  modifieLe?: string;
  modifiePar?: string;
}

export interface OrganisationIndicatorsItem {
  organisationId: string;
  totalUtilisateursActifs: number;
  responsablePrincipal?: {
    utilisateurId?: string;
    etatCompte: string;
    dernierAccesLe?: string;
    dernierLoginLe?: string;
  };
}

export interface OrganisationHistoryItem {
  id: string;
  action: string;
  acteur?: string;
  description: string;
  creeLe: string;
  details?: Record<string, unknown>;
}

export interface DetailResponse<TDonnee> {
  donnee: TDonnee;
}

export interface ListResponse<TDonnee> {
  donnees: TDonnee[];
  pagination: PaginationHttp;
}

export interface CreerOrganisationPayload {
  code: string;
  nom: string;
  typeOrganisation: string;
  description?: string;
  promoteurPrincipal?: {
    nomComplet: string;
    email: string;
    telephone?: string;
    identifiant?: string;
    motDePasseInitial: string;
  };
}

export interface MettreAJourOrganisationPayload {
  nom: string;
  typeOrganisation: string;
  description?: string;
  promoteurPrincipal?: {
    nomComplet: string;
    email?: string;
    telephone?: string;
    identifiant?: string;
  };
}

export interface CreerEcolePayload {
  idOrganisation: string;
  code: string;
  nom: string;
  modeExploitation: string;
  sigle?: string;
  adresse?: string;
  telephone?: string;
  email?: string;
  provinceEducationnelle?: string;
  ville?: string;
  communeOuTerritoire?: string;
}

export interface InformationsInstitutionnellesPayload {
  sigle?: string;
  adresse?: string;
  telephone?: string;
  email?: string;
  provinceEducationnelle?: string;
  ville?: string;
  communeOuTerritoire?: string;
}

export const organizationTypeOptions = [
  'PROMOTEUR',
  'COORDINATION',
  'RESEAU',
  'ECOLE_SEULE',
  'AUTRE',
] as const;
