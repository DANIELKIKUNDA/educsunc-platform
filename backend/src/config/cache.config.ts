const lirePort = (valeur: string | undefined, portParDefaut: number): number => {
  const port = Number(valeur);

  return Number.isInteger(port) && port > 0 ? port : portParDefaut;
};

const lireTtl = (valeur: string | undefined, ttlParDefaut: number): number => {
  const ttl = Number(valeur);

  return Number.isInteger(ttl) && ttl > 0 ? ttl : ttlParDefaut;
};

// Centralise les placeholders Redis.
export const configurationCache = Object.freeze({
  host: process.env.REDIS_HOST ?? 'localhost',
  port: lirePort(process.env.REDIS_PORT, 6379),
  ttlParDefaut: lireTtl(process.env.REDIS_DEFAULT_TTL, 300),
});
