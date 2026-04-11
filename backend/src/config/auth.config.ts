// Centralise les placeholders d'authentification.
export const configurationAuthentification = Object.freeze({
  secret: process.env.AUTH_SECRET ?? 'educsyn-secret-dev',
  expiration: process.env.AUTH_EXPIRATION ?? '1h',
  issuer: process.env.AUTH_ISSUER ?? 'educsyn-api',
});
