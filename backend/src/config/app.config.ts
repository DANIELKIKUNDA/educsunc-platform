type EnvironnementApplication = 'development' | 'test' | 'production';

const environnementsSupportes: readonly EnvironnementApplication[] = ['development', 'test', 'production'];

const lirePort = (valeur: string | undefined, portParDefaut: number): number => {
  const port = Number(valeur);

  return Number.isInteger(port) && port > 0 ? port : portParDefaut;
};

const lireEnvironnement = (valeur: string | undefined): EnvironnementApplication => {
  if (valeur && environnementsSupportes.includes(valeur as EnvironnementApplication)) {
    return valeur as EnvironnementApplication;
  }

  return 'development';
};

const lireBooleen = (valeur: string | undefined, valeurParDefaut: boolean): boolean => {
  if (valeur === undefined) {
    return valeurParDefaut;
  }

  const valeurNormalisee = valeur.trim().toLowerCase();

  if (['1', 'true', 'oui', 'yes', 'on'].includes(valeurNormalisee)) {
    return true;
  }

  if (['0', 'false', 'non', 'no', 'off'].includes(valeurNormalisee)) {
    return false;
  }

  return valeurParDefaut;
};

// Centralise la configuration generale du backend.
export const configurationApplication = Object.freeze({
  nomApplication: process.env.APP_NAME ?? 'EducSyn API',
  environnement: lireEnvironnement(process.env.APP_ENV ?? process.env.NODE_ENV),
  host: process.env.HOST ?? '0.0.0.0',
  port: lirePort(process.env.PORT, 3000),
  autoriserOperateurWorkflowOrganisation: lireBooleen(
    process.env.EDUCSYN_ORG01_ALLOW_OPERATEUR_SYSTEME,
    false,
  ),
  autoriserOperateurWorkflowPublicationReferentiel: lireBooleen(
    process.env.EDUCSYN_PLT01_ALLOW_OPERATEUR_SYSTEME,
    false,
  ),
  autoriserOperateurWorkflowActivationReferentiel: lireBooleen(
    process.env.EDUCSYN_PLT02_ALLOW_OPERATEUR_SYSTEME,
    false,
  ),
  autoriserOperateurWorkflowImportReferentiel: lireBooleen(
    process.env.EDUCSYN_PLT03_ALLOW_OPERATEUR_SYSTEME,
    false,
  ),
  autoriserOperateurWorkflowComparaisonReferentiel: lireBooleen(
    process.env.EDUCSYN_PLT04_ALLOW_OPERATEUR_SYSTEME,
    false,
  ),
  autoriserOperateurWorkflowLectureReferentiel: lireBooleen(
    process.env.EDUCSYN_PLT05_ALLOW_OPERATEUR_SYSTEME,
    false,
  ),
});
