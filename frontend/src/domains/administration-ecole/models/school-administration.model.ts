export interface PaginationHttp {
  total: number;
  page: number;
  taillePage: number;
  totalPages: number;
}

export interface DetailResponse<T> {
  donnee: T;
}

export interface ListResponse<T> {
  donnees: T[];
  pagination: PaginationHttp;
}

export interface SchoolAdministrationOrganizationItem {
  id: string;
  code: string;
  nom: string;
  actif: boolean;
}

export type SchoolModeValue = 'OFFLINE_ONLY' | 'SYNC' | 'MIGRATION';

export interface SchoolAdministrationItem {
  id: string;
  idOrganisation: string;
  code: string;
  nom: string;
  modeExploitation: SchoolModeValue;
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

export interface CreateSchoolPayload {
  idOrganisation: string;
  code: string;
  nom: string;
  modeExploitation: SchoolModeValue;
  sigle?: string;
  adresse?: string;
  telephone?: string;
  email?: string;
  provinceEducationnelle?: string;
  ville?: string;
  communeOuTerritoire?: string;
}

export interface SchoolInstitutionalInfoPayload {
  sigle?: string;
  adresse?: string;
  telephone?: string;
  email?: string;
  provinceEducationnelle?: string;
  ville?: string;
  communeOuTerritoire?: string;
}

export interface SchoolModeOption {
  value: SchoolModeValue;
  label: string;
  description: string;
}

export const schoolModeOptions: readonly SchoolModeOption[] = [
  {
    value: 'OFFLINE_ONLY',
    label: 'Hors ligne',
    description: 'Ecole administree en mode local sans synchronisation active.',
  },
  {
    value: 'SYNC',
    label: 'Synchronise',
    description: 'Ecole rattachee a un fonctionnement synchronise avec le socle central.',
  },
  {
    value: 'MIGRATION',
    label: 'Migration',
    description: 'Ecole en transition structurelle vers un autre mode d exploitation.',
  },
] as const;

export function labelForSchoolMode(mode: SchoolModeValue | string): string {
  return schoolModeOptions.find((option) => option.value === mode)?.label ?? mode;
}

