import type { FastifyRequest } from 'fastify';
import { ValidationError } from '../../../../../shared/exceptions/ValidationError';
import { IdempotencyStore } from 'shared/infrastructure/idempotency/IdempotencyStore';

const STATUT_IDEMPOTENCE_EN_COURS = 'EN_COURS';
const STATUT_IDEMPOTENCE_TERMINEE = 'TERMINEE';
const STATUT_IDEMPOTENCE_ECHEC = 'ECHEC';

// Cette interface porte la configuration d'une route HTTP protegee par idempotence.
export interface ConfigurationExecutionRouteIdempotenteReferentielAcademique {
  operation: string;
  dureeExpirationHeures?: number;
}

// Ce type decrit l'executeur reutilisable des routes idempotentes du BC.
export type ExecuteurRouteIdempotenteReferentielAcademique = <TResultat>(
  requete: FastifyRequest,
  operation: () => Promise<TResultat>,
  configuration: ConfigurationExecutionRouteIdempotenteReferentielAcademique,
) => Promise<TResultat>;

// Cette fonction fabrique un executeur idempotent base sur le store PostgreSQL du BC.
export function creerExecuteurRouteIdempotenteReferentielAcademique(
  storeIdempotence: IdempotencyStore,
): ExecuteurRouteIdempotenteReferentielAcademique {
  return async <TResultat>(
    requete: FastifyRequest,
    operation: () => Promise<TResultat>,
    configuration: ConfigurationExecutionRouteIdempotenteReferentielAcademique,
  ): Promise<TResultat> => {
    const cleIdempotence = lireCleIdempotence(requete);
    const empreinteRequete = calculerEmpreinteRequete(requete, configuration.operation);
    const enregistrementExistant = await storeIdempotence.obtenir(cleIdempotence);

    if (enregistrementExistant !== null) {
      verifierCoherenceEnregistrementExistant(
        enregistrementExistant.operation,
        enregistrementExistant.empreinteRequete,
        configuration.operation,
        empreinteRequete,
      );

      if (
        enregistrementExistant.statut === STATUT_IDEMPOTENCE_TERMINEE
        && enregistrementExistant.resultat !== null
      ) {
        return enregistrementExistant.resultat as TResultat;
      }

      if (enregistrementExistant.statut === STATUT_IDEMPOTENCE_EN_COURS) {
        throw new ValidationError(
          "Cette operation idempotente est deja en cours d'execution.",
          'OPERATION_IDEMPOTENTE_DEJA_EN_COURS',
          {
            operation: configuration.operation,
            cleIdempotence,
          },
        );
      }

      throw new ValidationError(
        "Cette operation idempotente a deja ete traitee en echec pour cette cle.",
        'OPERATION_IDEMPOTENTE_DEJA_ECHOUee',
        {
          operation: configuration.operation,
          cleIdempotence,
        },
      );
    }

    await storeIdempotence.enregistrer({
      cle: cleIdempotence,
      statut: STATUT_IDEMPOTENCE_EN_COURS,
      operation: configuration.operation,
      empreinteRequete,
      expireLe: calculerDateExpiration(configuration.dureeExpirationHeures),
    });

    try {
      const resultat = await operation();
      await storeIdempotence.marquerResultat(
        cleIdempotence,
        STATUT_IDEMPOTENCE_TERMINEE,
        normaliserResultatIdempotent(resultat),
      );

      return resultat;
    } catch (erreur) {
      await storeIdempotence.marquerResultat(
        cleIdempotence,
        STATUT_IDEMPOTENCE_ECHEC,
        {
          message: decrireErreur(erreur),
          operation: configuration.operation,
        },
      );

      throw erreur;
    }
  };
}

// Cette fonction lit la cle d'idempotence obligatoire dans les entetes HTTP.
function lireCleIdempotence(requete: FastifyRequest): string {
  const valeur = requete.headers['idempotency-key']
    ?? requete.headers['x-idempotency-key'];

  if (typeof valeur !== 'string' || valeur.trim().length === 0) {
    throw new ValidationError(
      "Cette operation exige l'entete HTTP Idempotency-Key.",
      'CLE_IDEMPOTENCE_HTTP_OBLIGATOIRE',
    );
  }

  return valeur.trim();
}

// Cette fonction verifie qu'une cle existante correspond bien a la meme intention HTTP.
function verifierCoherenceEnregistrementExistant(
  operationPersistante: string | null,
  empreintePersistante: string | null,
  operationDemandee: string,
  empreinteDemandee: string,
): void {
  if (
    operationPersistante !== null
    && operationPersistante !== operationDemandee
  ) {
    throw new ValidationError(
      "La cle d'idempotence fournie est deja utilisee pour une autre operation.",
      'CLE_IDEMPOTENCE_OPERATION_DIFFERENTE',
      {
        operationPersistante,
        operationDemandee,
      },
    );
  }

  if (
    empreintePersistante !== null
    && empreintePersistante !== empreinteDemandee
  ) {
    throw new ValidationError(
      "La cle d'idempotence fournie est deja associee a une requete differente.",
      'CLE_IDEMPOTENCE_EMPREINTE_DIFFERENTE',
      {
        empreintePersistante,
        empreinteDemandee,
      },
    );
  }
}

// Cette fonction calcule une empreinte stable de la requete HTTP.
function calculerEmpreinteRequete(
  requete: FastifyRequest,
  operation: string,
): string {
  return serialiserStable({
    operation,
    methode: requete.method,
    url: requete.url,
    query: requete.query ?? null,
    params: requete.params ?? null,
    body: requete.body ?? null,
  });
}

// Cette fonction normalise le resultat pour le stockage JSON de l'idempotence.
function normaliserResultatIdempotent<TResultat>(
  resultat: TResultat,
): Record<string, unknown> {
  if (resultat === null || resultat === undefined) {
    return { resultat: null };
  }

  if (typeof resultat === 'object' && !Array.isArray(resultat)) {
    return resultat as Record<string, unknown>;
  }

  return { resultat };
}

// Cette fonction calcule la date d'expiration de la reservation idempotente.
function calculerDateExpiration(dureeExpirationHeures = 24): Date {
  const expiration = new Date();

  expiration.setHours(expiration.getHours() + dureeExpirationHeures);

  return expiration;
}

// Cette fonction produit une serialisation stable, independante de l'ordre des cles.
function serialiserStable(valeur: unknown): string {
  if (valeur === null || valeur === undefined) {
    return 'null';
  }

  if (typeof valeur === 'string') {
    return JSON.stringify(valeur);
  }

  if (
    typeof valeur === 'number'
    || typeof valeur === 'boolean'
  ) {
    return JSON.stringify(valeur);
  }

  if (valeur instanceof Date) {
    return JSON.stringify(valeur.toISOString());
  }

  if (Array.isArray(valeur)) {
    return `[${valeur.map((element) => serialiserStable(element)).join(',')}]`;
  }

  if (typeof valeur === 'object') {
    const enregistrement = valeur as Record<string, unknown>;
    const clesTriees = Object.keys(enregistrement).sort();

    return `{${clesTriees
      .map((cle) => `${JSON.stringify(cle)}:${serialiserStable(enregistrement[cle])}`)
      .join(',')}}`;
  }

  return JSON.stringify(String(valeur));
}

// Cette fonction transforme une erreur inconnue en message robuste.
function decrireErreur(erreur: unknown): string {
  if (erreur instanceof Error) {
    return erreur.message;
  }

  if (typeof erreur === 'string') {
    return erreur;
  }

  try {
    return JSON.stringify(erreur);
  } catch {
    return 'Erreur inconnue';
  }
}
