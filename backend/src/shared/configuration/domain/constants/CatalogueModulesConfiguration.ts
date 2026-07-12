import type { TypeModuleConfiguration } from '../enums';

export interface CatalogueModuleConfigurationItem {
  readonly code: TypeModuleConfiguration;
  readonly libelle: string;
  readonly description: string;
  readonly ordre: number;
}

export const CATALOGUE_MODULES_CONFIGURATION: readonly CatalogueModuleConfigurationItem[] = [
  {
    code: 'REFERENTIEL_ACADEMIQUE',
    libelle: 'Referentiel academique',
    description: 'Socle academique, classes, options et programmes officiels.',
    ordre: 1,
  },
  {
    code: 'SCOLARITE_ELEVES',
    libelle: 'Scolarite eleves',
    description: 'Inscriptions, familles, affectations et cycle de vie des eleves.',
    ordre: 2,
  },
  {
    code: 'PAIEMENTS_FACTURATION',
    libelle: 'Paiements facturation',
    description: 'Caisse, perception, recouvrements et suivi financier.',
    ordre: 3,
  },
  {
    code: 'BULLETINS_EVALUATIONS',
    libelle: 'Bulletins evaluations',
    description: 'Resultats, bulletins, classements et analyses pedagogiques.',
    ordre: 4,
  },
  {
    code: 'NOTIFICATIONS',
    libelle: 'Notifications',
    description: 'Diffusions, alertes et messages selon les canaux actifs.',
    ordre: 5,
  },
  {
    code: 'AUDIT',
    libelle: 'Audit',
    description: 'Traces, controles et lecture des evenements sensibles.',
    ordre: 6,
  },
  {
    code: 'MONITORING',
    libelle: 'Monitoring',
    description: 'Observation, alertes et sante generale de la plateforme.',
    ordre: 7,
  },
] as const;
