import type { FastifyReply, FastifyRequest } from 'fastify';
import { ErreurMigrationImpossible } from '../../../domain/exceptions/ErreurMigrationImpossible';
import { ErreurVersionReferentielInvalide } from '../../../domain/exceptions/ErreurVersionReferentielInvalide';
import { ValidationError } from '../../../../../shared/exceptions/ValidationError';
import { ErreurAccesRefuse } from '../../../../../shared/security/application/exceptions/ErreurAccesRefuse';
import type { ExecuteurRouteTenantReferentielAcademique } from './ExecutionRouteTenantReferentielAcademique';

interface DependancesRouteProtegeeReferentielAcademique {
  executerRouteTenant: ExecuteurRouteTenantReferentielAcademique;
}

export async function executerRouteProtegeeReferentielAcademique(
  dependances: DependancesRouteProtegeeReferentielAcademique,
  requete: FastifyRequest,
  reponse: FastifyReply,
  operation: () => Promise<unknown>,
  configuration?: Parameters<ExecuteurRouteTenantReferentielAcademique>[2],
) {
  if (!requete.context?.utilisateurId) {
    return reponse.code(401).send({
      success: false,
      error: {
        code: 'REFERENTIEL_AUTH_REQUIRED',
        message: 'Authentification requise.',
      },
    });
  }

  try {
    const resultat = await dependances.executerRouteTenant(
      requete,
      operation,
      configuration,
    );
    return reponse.code(200).send(resultat);
  } catch (erreur) {
    if (erreur instanceof ValidationError) {
      return reponse.code(400).send({
        success: false,
        error: {
          code: erreur.code ?? 'REFERENTIEL_VALIDATION_ERROR',
          message: erreur.message,
        },
      });
    }

    if (erreur instanceof ErreurAccesRefuse || erreur instanceof Error && /pas autorise/i.test(erreur.message)) {
      return reponse.code(403).send({
        success: false,
        error: {
          code: 'REFERENTIEL_FORBIDDEN',
          message: erreur.message,
        },
      });
    }

    if (erreur instanceof ErreurVersionReferentielInvalide || erreur instanceof ErreurMigrationImpossible) {
      return reponse.code(409).send({
        success: false,
        error: {
          code: 'REFERENTIEL_CONFLICT',
          message: erreur.message,
        },
      });
    }

    throw erreur;
  }
}
