const lirePort = (valeur: string | undefined, portParDefaut: number): number => {
  const port = Number(valeur);

  return Number.isInteger(port) && port > 0 ? port : portParDefaut;
};

// Centralise les placeholders PostgreSQL.
export const configurationBaseDonnees = Object.freeze({
  host: process.env.DB_HOST ?? 'localhost',
  port: lirePort(process.env.DB_PORT, 5432),
  user: process.env.DB_USER ?? 'postgres',
  password: process.env.DB_PASSWORD ?? 'postgres',
  database: process.env.DB_NAME ?? 'educsyn',
});
