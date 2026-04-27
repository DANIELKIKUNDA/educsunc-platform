import { Famille } from '../../domain/aggregates/Famille';
import { LienParente } from '../../domain/value-objects/LienParente';
import { ResponsableFamille } from '../../domain/entities/ResponsableFamille';
import { idsScolariteTest } from './eleves.fixture';

// Ce fichier fournit des fixtures reutilisables pour les tests de familles.
/** Cree une famille valide pour les tests. */
export function creerFamilleFixture(): Famille {
  return Famille.creer({
    idFamille: idsScolariteTest.idFamille,
    idOrganisation: idsScolariteTest.idOrganisation,
    idEcole: idsScolariteTest.idEcole,
    codeFamille: 'FAM-001',
    nomFamille: 'Famille Mbuyi',
    telephonePrincipal: '+243810000000',
    responsables: [],
    creePar: idsScolariteTest.idUtilisateur,
  });
}

/** Cree un responsable familial valide pour les tests. */
export function creerResponsableFixture(): ResponsableFamille {
  return ResponsableFamille.creer({
    idResponsableFamille: '66666666-6666-6666-6666-666666666666',
    nomComplet: 'Jean Mbuyi',
    telephone: '+243820000000',
    lienParente: LienParente.PERE,
    estPrincipal: true,
  });
}
