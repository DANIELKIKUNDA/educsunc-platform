import type { FastifyRequest } from 'fastify';
import { ValidationError } from 'shared/exceptions/ValidationError';
import { calculerTaillePayload } from '../AuditMiddlewareSupport';

const FORMATS_EXPORT_AUTORISES = new Set(['PDF', 'CSV', 'JSON']);

// Ce middleware durcit les exports Audit avant leur delegation aux workers.
export class AuditExportsMiddleware {
  constructor(private readonly tailleMaxExport = 500_000) {}

  public verifier(requete: FastifyRequest): void {
    const body = requete.body;
    if (typeof body === 'object' && body !== null && !Array.isArray(body)) {
      const format = (body as Record<string, unknown>).format;
      if (typeof format === 'string' && !FORMATS_EXPORT_AUTORISES.has(format.toUpperCase())) {
        throw new ValidationError(
          `Le format d'export ${format} est invalide.`,
          'AUDIT_EXPORT_FORMAT_INVALID',
        );
      }
    }

    if (calculerTaillePayload(body) > this.tailleMaxExport) {
      throw new ValidationError(
        "La requete d'export Audit est trop volumineuse.",
        'AUDIT_EXPORT_REQUEST_TOO_LARGE',
      );
    }
  }
}

