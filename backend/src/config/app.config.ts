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

// Centralise la configuration generale du backend.
export const configurationApplication = Object.freeze({
  nomApplication: process.env.APP_NAME ?? 'EducSyn API',
  environnement: lireEnvironnement(process.env.APP_ENV ?? process.env.NODE_ENV),
  host: process.env.HOST ?? '0.0.0.0',
  port: lirePort(process.env.PORT, 3000),
});
