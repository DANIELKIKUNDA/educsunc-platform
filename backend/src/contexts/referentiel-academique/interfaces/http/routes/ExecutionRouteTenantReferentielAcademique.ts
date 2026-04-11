import type { FastifyRequest } from 'fastify';
import { ValidationError } from '../../../../../shared/exceptions/ValidationError';
import { ContexteTenant } from '../../../../../shared/tenancy/TenantContext';
import { ContexteExecutionTenantReferentielAcademique } from '../../../infrastructure/tenancy/ContexteExecutionTenantReferentielAcademique';

// Ce type decrit le niveau d'exigence tenant applicable a une route HTTP du BC.
export type ModeExecutionTenantRouteReferentielAcademique =
  | 'aucun'
  | 'tenant_requis'
  | 'lecture_organisationnelle_ou_tenant';

// Cette interface porte les regles d'execution tenant d'une route donnee.
export interface ConfigurationExecutionRouteTenantReferentielAcademique {
  mode: ModeExecutionTenantRouteReferentielAcademique;
  clesTenant?: readonly string[];
  clesOrganisation?: readonly string[];
}

// Ce type decrit l'executeur reutilisable par toutes les routes du BC.
export type ExecuteurRouteTenantReferentielAcademique = <TResultat>(
  requete: FastifyRequest,
  operation: () => Promise<TResultat>,
  configuration?: ConfigurationExecutionRouteTenantReferentielAcademique,
) => Promise<TResultat>;

interface ConteneurValeursRequete {
  readonly [cle: string]: unknown;
}

// Cette fonction fabrique un executeur tenant dedie au BC Referentiel Academique.
export function creerExecuteurRouteTenantReferentielAcademique(
  contexteExecutionTenant: ContexteExecutionTenantReferentielAcademique,
): ExecuteurRouteTenantReferentielAcademique {
  return async <TResultat>(
    requete: FastifyRequest,
    operation: () => Promise<TResultat>,
    configuration: ConfigurationExecutionRouteTenantReferentielAcademique = { mode: 'aucun' },
  ): Promise<TResultat> => {
    const contexteTenant = new ContexteTenant();

    appliquerContexteTenantRoute(requete, contexteTenant, configuration);

    return contexteExecutionTenant.executerAvecContexte(
      contexteTenant,
      operation,
    );
  };
}

// Cette fonction applique les regles tenant de la route sur le contexte d'execution.
function appliquerContexteTenantRoute(
  requete: FastifyRequest,
  contexteTenant: ContexteTenant,
  configuration: ConfigurationExecutionRouteTenantReferentielAcademique,
): void {
  if (configuration.mode === 'aucun') {
    return;
  }

  if (
    configuration.mode === 'lecture_organisationnelle_ou_tenant'
    && detecterLectureOrganisationnelle(requete)
  ) {
    const idOrganisation = resoudreOrganisationDepuisRequete(
      requete,
      configuration.clesOrganisation,
    );

    contexteTenant.definirOrganisation(idOrganisation);
    contexteTenant.activerLectureOrganisationnelle();
    return;
  }

  const idTenant = resoudreTenantDepuisRequete(
    requete,
    configuration.clesTenant,
  );

  contexteTenant.definirTenant(idTenant);
}

// Cette fonction detecte le mode de lecture organisationnelle via l'entete technique dedie.
function detecterLectureOrganisationnelle(requete: FastifyRequest): boolean {
  const valeurEntete = lireEntete(requete, 'x-lecture-organisation');

  return valeurEntete === 'true';
}

// Cette fonction resout un tenant depuis l'entete ou les charges routees autorisees.
function resoudreTenantDepuisRequete(
  requete: FastifyRequest,
  clesSpecifiques: readonly string[] = [],
): string {
  const valeur = lireEntete(requete, 'x-tenant-id')
    ?? lireValeurRequete(requete, [...clesSpecifiques, 'idEcole']);

  if (valeur === null) {
    throw new ValidationError(
      "Cette operation exige un tenant courant explicite via l'entete x-tenant-id ou un idEcole compatible.",
    );
  }

  return valeur;
}

// Cette fonction resout une organisation depuis l'entete ou les charges routees autorisees.
function resoudreOrganisationDepuisRequete(
  requete: FastifyRequest,
  clesSpecifiques: readonly string[] = [],
): string {
  const valeur = lireEntete(requete, 'x-organisation-id')
    ?? lireValeurRequete(requete, [...clesSpecifiques, 'idOrganisation']);

  if (valeur === null) {
    throw new ValidationError(
      "Une lecture organisationnelle exige l'entete x-organisation-id ou un idOrganisation compatible.",
    );
  }

  return valeur;
}

// Cette fonction lit une valeur texte dans les params, la query puis le body d'une requete.
function lireValeurRequete(
  requete: FastifyRequest,
  cles: readonly string[],
): string | null {
  const clesDedoublonnees = [...new Set(cles)];

  for (const cle of clesDedoublonnees) {
    const valeurParams = lireValeurDansConteneur(requete.params, cle);

    if (valeurParams !== null) {
      return valeurParams;
    }

    const valeurQuery = lireValeurDansConteneur(requete.query, cle);

    if (valeurQuery !== null) {
      return valeurQuery;
    }

    const valeurBody = lireValeurDansConteneur(requete.body, cle);

    if (valeurBody !== null) {
      return valeurBody;
    }
  }

  return null;
}

// Cette fonction lit un entete HTTP sous forme texte nettoyee.
function lireEntete(requete: FastifyRequest, nomEntete: string): string | null {
  const enteteBrut = requete.headers[nomEntete];

  return normaliserValeurTexte(enteteBrut);
}

// Cette fonction lit une valeur candidate dans un conteneur libre.
function lireValeurDansConteneur(
  conteneur: unknown,
  cle: string,
): string | null {
  if (conteneur === null || conteneur === undefined || typeof conteneur !== 'object') {
    return null;
  }

  const valeurBrute = (conteneur as ConteneurValeursRequete)[cle];

  return normaliserValeurTexte(valeurBrute);
}

// Cette fonction normalise une valeur candidate sous forme de chaine exploitable.
function normaliserValeurTexte(valeur: unknown): string | null {
  if (valeur === null || valeur === undefined) {
    return null;
  }

  if (Array.isArray(valeur)) {
    const premiereValeurTexte = valeur.find(
      (element): element is string => typeof element === 'string',
    );

    if (premiereValeurTexte === undefined) {
      return null;
    }

    return normaliserValeurTexte(premiereValeurTexte);
  }

  if (typeof valeur !== 'string') {
    return null;
  }

  const valeurNettoyee = valeur.trim();

  return valeurNettoyee.length === 0 ? null : valeurNettoyee;
}
