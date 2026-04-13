import type { FastifyPluginAsync } from 'fastify';
import { ControleurAnneesScolaires } from '../controllers/ControleurAnneesScolaires';
import { ControleurCalendriersAcademiques } from '../controllers/ControleurCalendriersAcademiques';
import { ControleurEcoles } from '../controllers/ControleurEcoles';
import { ControleurMigrationsReferentiel } from '../controllers/ControleurMigrationsReferentiel';
import { ControleurOrganisations } from '../controllers/ControleurOrganisations';
import { ControleurProgrammesNiveau } from '../controllers/ControleurProgrammesNiveau';
import { ControleurReferentielsAcademiques } from '../controllers/ControleurReferentielsAcademiques';
import { ControleurStructureScolaire } from '../controllers/ControleurStructureScolaire';
import { ExecuteurRouteIdempotenteReferentielAcademique } from './ExecutionRouteIdempotenteReferentielAcademique';
import { ExecuteurRouteTenantReferentielAcademique } from './ExecutionRouteTenantReferentielAcademique';
import { creerRoutesAnneesScolaires } from './annees-scolaires.routes';
import { creerRoutesCalendriersAcademiques } from './calendriers-academiques.routes';
import { creerRoutesEcoles } from './ecoles.routes';
import { creerRoutesMigrationsReferentiel } from './migrations-referentiel.routes';
import { creerRoutesOrganisations } from './organisations.routes';
import { creerRoutesProgrammesNiveau } from './programmes-niveau.routes';
import { creerRoutesReferentielsAcademiques } from './referentiels-academiques.routes';
import { creerRoutesStructureScolaire } from './structure-scolaire.routes';

// Cette interface regroupe les controleurs requis pour enregistrer toutes les routes du BC.
export interface DependancesRoutesReferentielAcademique {
  controleurOrganisations: ControleurOrganisations;
  controleurEcoles: ControleurEcoles;
  controleurAnneesScolaires: ControleurAnneesScolaires;
  controleurStructureScolaire: ControleurStructureScolaire;
  controleurReferentielsAcademiques: ControleurReferentielsAcademiques;
  controleurProgrammesNiveau: ControleurProgrammesNiveau;
  controleurCalendriersAcademiques: ControleurCalendriersAcademiques;
  controleurMigrationsReferentiel: ControleurMigrationsReferentiel;
  executerRouteTenant: ExecuteurRouteTenantReferentielAcademique;
  executerRouteIdempotente: ExecuteurRouteIdempotenteReferentielAcademique;
}

// Cette fonction agrege toutes les routes HTTP du BC referentiel academique.
export const creerRoutesReferentielAcademique = (
  dependances: DependancesRoutesReferentielAcademique,
): FastifyPluginAsync => async (serveur) => {
  await serveur.register(
    creerRoutesOrganisations({
      controleurOrganisations: dependances.controleurOrganisations,
      executerRouteTenant: dependances.executerRouteTenant,
    }),
  );
  await serveur.register(
    creerRoutesEcoles({
      controleurEcoles: dependances.controleurEcoles,
      executerRouteTenant: dependances.executerRouteTenant,
    }),
  );
  await serveur.register(
    creerRoutesAnneesScolaires({
      controleurAnneesScolaires: dependances.controleurAnneesScolaires,
      executerRouteTenant: dependances.executerRouteTenant,
      executerRouteIdempotente: dependances.executerRouteIdempotente,
    }),
  );
  await serveur.register(
    creerRoutesStructureScolaire({
      controleurStructureScolaire: dependances.controleurStructureScolaire,
      executerRouteTenant: dependances.executerRouteTenant,
      executerRouteIdempotente: dependances.executerRouteIdempotente,
    }),
  );
  await serveur.register(
    creerRoutesReferentielsAcademiques({
      controleurReferentielsAcademiques: dependances.controleurReferentielsAcademiques,
      executerRouteTenant: dependances.executerRouteTenant,
      executerRouteIdempotente: dependances.executerRouteIdempotente,
    }),
  );
  await serveur.register(
    creerRoutesProgrammesNiveau({
      controleurProgrammesNiveau: dependances.controleurProgrammesNiveau,
      executerRouteTenant: dependances.executerRouteTenant,
      executerRouteIdempotente: dependances.executerRouteIdempotente,
    }),
  );
  await serveur.register(
    creerRoutesCalendriersAcademiques({
      controleurCalendriersAcademiques: dependances.controleurCalendriersAcademiques,
      executerRouteTenant: dependances.executerRouteTenant,
      executerRouteIdempotente: dependances.executerRouteIdempotente,
    }),
  );
  await serveur.register(
    creerRoutesMigrationsReferentiel({
      controleurMigrationsReferentiel: dependances.controleurMigrationsReferentiel,
      executerRouteTenant: dependances.executerRouteTenant,
      executerRouteIdempotente: dependances.executerRouteIdempotente,
    }),
  );
};

export * from './organisations.routes';
export * from './ecoles.routes';
export * from './annees-scolaires.routes';
export * from './structure-scolaire.routes';
export * from './referentiels-academiques.routes';
export * from './programmes-niveau.routes';
export * from './calendriers-academiques.routes';
export * from './migrations-referentiel.routes';
export * from './ExecutionRouteTenantReferentielAcademique';
export * from './ExecutionRouteIdempotenteReferentielAcademique';
