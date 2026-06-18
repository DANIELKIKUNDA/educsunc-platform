// Ce fichier declare les fixtures partagees des tests Configuration.

export const FIXTURE_SCOPE_SYSTEME = {
  niveau: 'SYSTEM' as const,
};

export const FIXTURE_SCOPE_ECOLE = {
  niveau: 'SCHOOL' as const,
  organisationId: 'org-1',
  ecoleId: 'ecole-1',
};

export const FIXTURE_SCOPE_UTILISATEUR = {
  niveau: 'USER' as const,
  organisationId: 'org-1',
  ecoleId: 'ecole-1',
  utilisateurId: 'user-1',
};

export const FIXTURE_CONFIGURATION_RUNTIME = {
  key: 'runtime.retry.max',
  value: 3,
};

export const FIXTURE_CONFIGURATION_BRANDING = {
  key: 'branding.logo.primary',
  value: 'https://cdn.educsyn.local/logo.svg',
};
