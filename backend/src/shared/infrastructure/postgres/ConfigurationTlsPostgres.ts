import type { ConnectionOptions } from 'node:tls';

export function creerConfigurationTlsPostgres(
  sslActive: boolean | undefined,
  autoriteCertification = process.env.DB_SSL_CA,
): ConnectionOptions | undefined {
  if (!sslActive) {
    return undefined;
  }

  const ca = autoriteCertification?.replace(/\\n/gu, '\n').trim();
  return {
    rejectUnauthorized: true,
    ...(ca ? { ca } : {}),
  };
}
