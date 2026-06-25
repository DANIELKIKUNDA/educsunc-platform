import type { NavigationEntry } from './navigation.types';

export const navigationConfig: NavigationEntry[] = [
  {
    label: 'Finances',
    description: 'Caisse, recouvrements et recus',
    route: '/app/finances',
    capability: 'module.finances.access',
    shortCode: 'PF',
  },
  {
    label: 'Pedagogique',
    description: 'Resultats, bulletins et analyses',
    route: '/app/pedagogique',
    capability: 'module.pedagogique.access',
    shortCode: 'PED',
  },
  {
    label: 'Scolarite',
    description: 'Inscriptions et vie scolaire',
    route: '/app/scolarite',
    capability: 'module.scolarite.access',
    shortCode: 'SCO',
  },
  {
    label: 'Academique',
    description: 'Referentiels, classes et programmes',
    route: '/app/academique',
    capability: 'module.academique.access',
    shortCode: 'ACA',
  },
  {
    label: 'Monitoring',
    description: 'Observation et sante plateforme',
    route: '/app/monitoring',
    capability: 'module.monitoring.access',
    shortCode: 'MON',
  },
  {
    label: 'Audit',
    description: 'Traces et controle des mutations',
    route: '/app/audit',
    capability: 'module.audit.access',
    shortCode: 'AUD',
  },
  {
    label: 'Configuration',
    description: 'Parametrage par niveau',
    route: '/app/configuration',
    capability: 'module.configuration.access',
    shortCode: 'CFG',
  },
  {
    label: 'Notifications',
    description: 'Canaux et diffusions',
    route: '/app/notifications',
    capability: 'module.notifications.access',
    shortCode: 'NTF',
  },
  {
    label: 'Security',
    description: 'Permissions et perimetres visibles',
    route: '/app/security',
    capability: 'module.security.access',
    shortCode: 'SEC',
  },
];
