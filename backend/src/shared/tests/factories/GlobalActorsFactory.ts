import type { RoleFixture } from '../fixtures/GlobalFixtures';
import { ROLE_FIXTURES, TENANT_FIXTURES, WORKFLOW_FIXTURES } from '../fixtures/GlobalFixtures';

// Ce fichier fournit des profils d'acteurs prets a l'emploi pour les tests globaux.

export interface ActeurFixture {
  role: RoleFixture;
  organisationId: string;
  ecoleId: string;
  classeId?: string;
  coursId?: string;
  titulaireClasseId?: string;
  titulaireAnneeScolaireId?: string;
  elevesAutorises?: string[];
}

export function creerActeurFixture(typeActeur: keyof typeof ROLE_FIXTURES): ActeurFixture {
  const role = ROLE_FIXTURES[typeActeur];
  return {
    role,
    organisationId: role.niveauAcces === 'ORGANISATION' ? TENANT_FIXTURES.organisationA : TENANT_FIXTURES.organisationA,
    ecoleId:
      role.niveauAcces === 'ORGANISATION'
        ? TENANT_FIXTURES.ecoleA1
        : TENANT_FIXTURES.ecoleA1,
    classeId: WORKFLOW_FIXTURES.classeA,
    coursId: WORKFLOW_FIXTURES.coursMath,
    titulaireClasseId: typeActeur === 'ENSEIGNANT' ? undefined : undefined,
    titulaireAnneeScolaireId: undefined,
    elevesAutorises: typeActeur === 'PARENT' ? [WORKFLOW_FIXTURES.parentEnfantA] : undefined,
  };
}
