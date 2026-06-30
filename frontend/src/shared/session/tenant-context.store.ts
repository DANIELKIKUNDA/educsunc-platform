import { reactive } from 'vue';

export interface TenantContextState {
  organizationId: string;
  schoolId: string;
  userId: string;
}

function lireVariableEnvironnement(nom: string): string {
  const valeur = import.meta.env[nom];
  return typeof valeur === 'string' ? valeur.trim() : '';
}

const state = reactive<TenantContextState>({
  organizationId: lireVariableEnvironnement('VITE_REFERENTIEL_ORGANISATION_ID'),
  schoolId: lireVariableEnvironnement('VITE_REFERENTIEL_ECOLE_ID'),
  userId: lireVariableEnvironnement('VITE_REFERENTIEL_UTILISATEUR_ID'),
});

export const tenantContextStore = {
  state,
};
