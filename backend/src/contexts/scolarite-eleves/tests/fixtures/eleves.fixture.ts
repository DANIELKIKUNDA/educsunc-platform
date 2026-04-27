import { EcoleProvenance } from '../../domain/value-objects/EcoleProvenance';
import { SexeEleve } from '../../domain/value-objects/SexeEleve';
import { Eleve } from '../../domain/aggregates/Eleve';

// Ce fichier fournit des fixtures reutilisables pour les tests d'eleves.
export const idsScolariteTest = {
  idOrganisation: '11111111-1111-1111-1111-111111111111',
  idEcole: '22222222-2222-2222-2222-222222222222',
  idUtilisateur: '33333333-3333-3333-3333-333333333333',
  idEleve: '44444444-4444-4444-4444-444444444444',
  idFamille: '55555555-5555-5555-5555-555555555555',
};

/** Cree un eleve valide pour les tests. */
export function creerEleveFixture(): Eleve {
  return Eleve.creer({
    idEleve: idsScolariteTest.idEleve,
    idOrganisation: idsScolariteTest.idOrganisation,
    idEcole: idsScolariteTest.idEcole,
    matricule: 'EL-001',
    nom: 'Mbuyi',
    postNom: 'Kalala',
    prenom: 'Grace',
    sexe: SexeEleve.F,
    dateNaissance: '2015-09-12',
    ecoleProvenance: EcoleProvenance.externe('Institut Mapendo'),
    creePar: idsScolariteTest.idUtilisateur,
  });
}
