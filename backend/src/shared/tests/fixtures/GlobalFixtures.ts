// Ce fichier centralise les jeux de roles et de donnees metier utilises par les tests globaux.

export interface RoleFixture {
  codeRole: string;
  nomRole: string;
  niveauAcces: 'PLATEFORME' | 'ORGANISATION' | 'ECOLE';
  permissions: string[];
  restrictions?: string[];
}

export const ROLE_FIXTURES: Record<string, RoleFixture> = {
  ENSEIGNANT: {
    codeRole: 'ENSEIGNANT',
    nomRole: 'Enseignant',
    niveauAcces: 'ECOLE',
    permissions: ['cotes.read', 'cotes.write', 'bulletins.read', 'referentiel.read', 'eleves.read', 'paiements.read'],
  },
  TITULAIRE: {
    codeRole: 'ENSEIGNANT',
    nomRole: 'Titulaire',
    niveauAcces: 'ECOLE',
    permissions: ['cotes.write', 'bulletins.generate', 'proclamations.generate', 'bulletins.read', 'paiements.read', 'eleves.read'],
  },
  PREFET: {
    codeRole: 'PREFET_ETUDES',
    nomRole: 'Prefet des etudes',
    niveauAcces: 'ECOLE',
    permissions: ['bulletins.read', 'eleves.read', 'abandons.write', 'transferts.write', 'paiements.read', 'referentiel.read'],
  },
  DIRECTEUR_ETUDES: {
    codeRole: 'DIRECTEUR_ETUDES',
    nomRole: 'Directeur des etudes',
    niveauAcces: 'ECOLE',
    permissions: ['bulletins.read', 'eleves.read', 'paiements.read'],
    restrictions: ['INTERDICTION_CAISSE'],
  },
  DIRECTEUR_DISCIPLINE: {
    codeRole: 'DIRECTEUR_DISCIPLINE',
    nomRole: 'Directeur de discipline',
    niveauAcces: 'ECOLE',
    permissions: ['eleves.read', 'convocations.send', 'paiements.read'],
    restrictions: ['INTERDICTION_CAISSE'],
  },
  CAISSIER: {
    codeRole: 'CAISSIER',
    nomRole: 'Caissier',
    niveauAcces: 'ECOLE',
    permissions: ['paiements.write', 'paiements.read', 'caisse.write', 'caisse.read'],
    restrictions: ['INTERDICTION_BULLETINS', 'INTERDICTION_TRANSFERT', 'INTERDICTION_ABANDON'],
  },
  ADMIN_ECOLE: {
    codeRole: 'ADMINISTRATEUR_ECOLE',
    nomRole: 'Administrateur ecole',
    niveauAcces: 'ECOLE',
    permissions: [
      'cotes.write',
      'bulletins.generate',
      'proclamations.generate',
      'paiements.write',
      'caisse.write',
      'referentiel.write',
      'abandons.write',
      'transferts.write',
      'utilisateurs.write',
      'bulletins.read',
      'paiements.read',
      'referentiel.read',
      'eleves.read',
      'eleves.write',
      'utilisateurs.read',
      'roles.read',
      'roles.write',
      'permissions.read',
      'permissions.write',
      'caisse.read',
    ],
  },
  PROMOTEUR_ORGANISATION: {
    codeRole: 'PROMOTEUR_ORGANISATION',
    nomRole: 'Promoteur organisation',
    niveauAcces: 'ORGANISATION',
    permissions: ['referentiel.read', 'eleves.read', 'paiements.read', 'utilisateurs.read'],
  },
  PARENT: {
    codeRole: 'PARENT',
    nomRole: 'Parent',
    niveauAcces: 'ECOLE',
    permissions: ['bulletins.read', 'paiements.read', 'eleves.read', 'notifications.send'],
    restrictions: ['INTERDICTION_CAISSE'],
  },
  ADMIN_SYSTEME_ECOLE: {
    codeRole: 'ADMIN_SYSTEME_ECOLE',
    nomRole: 'Administrateur systeme ecole',
    niveauAcces: 'ECOLE',
    permissions: ['referentiel.write', 'referentiel.read', 'utilisateurs.write', 'utilisateurs.read'],
  },
};

export const TENANT_FIXTURES = {
  organisationA: 'org-a',
  organisationB: 'org-b',
  ecoleA1: 'ecole-a-1',
  ecoleA2: 'ecole-a-2',
  ecoleB1: 'ecole-b-1',
};

export const WORKFLOW_FIXTURES = {
  anneeScolaireId: 'annee-2026',
  classeA: 'classe-a',
  classeB: 'classe-b',
  coursMath: 'cours-math',
  eleveA: 'eleve-a',
  eleveB: 'eleve-b',
  parentEnfantA: 'eleve-a',
};
