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
  description?: string;
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
