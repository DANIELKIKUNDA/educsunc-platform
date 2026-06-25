import test from 'node:test';
import assert from 'node:assert/strict';
import { ScolariteElevesAdapter } from 'contexts/bulletins-evaluations/infrastructure/adapters/ScolariteElevesAdapter';
import { SexeEleve } from 'contexts/bulletins-evaluations/domain/value-objects/SexeEleve';
import { StatutEleve } from 'contexts/scolarite-eleves/domain/value-objects/StatutEleve';
import { TypeEvenementParcours } from 'contexts/scolarite-eleves/domain/value-objects/TypeEvenementParcours';

test("ScolariteElevesAdapter lit l'identite reelle, l'inscription active et l'abandon par annee", async () => {
  const adapter = new ScolariteElevesAdapter(undefined, undefined, {
    consulterEleve: {
      async executer() {
        return {
          eleve: {
            idEleve: 'eleve-1',
            idOrganisation: 'org-1',
            idEcole: 'ecole-1',
            matricule: 'MAT-1',
            nom: 'Kanku',
            postNom: 'Ilunga',
            prenom: 'Aime',
            sexe: SexeEleve.F,
            dateNaissance: '2010-01-01',
            statutGlobal: StatutEleve.ABANDONNE,
            typeProvenance: 'AUTRE' as never,
            nomEcoleProvenance: 'Ecole source',
            version: 1,
            creePar: 'user-1',
            creeLe: '2026-01-01T00:00:00.000Z',
            supprimeLogiquement: false,
          },
        };
      },
    } as never,
    consulterInscription: {
      async executer() {
        return {
          inscription: {
            idInscriptionScolaire: 'inscription-1',
            idOrganisation: 'org-1',
            idEcole: 'ecole-1',
            idEleve: 'eleve-1',
            idAnneeScolaire: 'annee-1',
            dateInscription: '2026-01-01',
            origineInscription: 'NOUVELLE' as never,
            statutInscription: 'VALIDEE' as never,
            version: 1,
          },
        };
      },
    } as never,
    consulterAffectationActive: {
      async executer() {
        return {
          affectation: {
            idAffectationClasse: 'affectation-1',
            idOrganisation: 'org-1',
            idEcole: 'ecole-1',
            idInscriptionScolaire: 'inscription-1',
            idClassePedagogique: 'classe-1',
            dateAffectation: '2026-01-02',
            active: true,
            version: 1,
          },
        };
      },
    } as never,
    consulterParcours: {
      async executer() {
        return {
          parcours: {
            idParcoursScolaireEleve: 'parcours-1',
            idOrganisation: 'org-1',
            idEcole: 'ecole-1',
            idEleve: 'eleve-1',
            version: 1,
            historique: [
              {
                idEvenementParcours: 'evt-1',
                typeEvenement: TypeEvenementParcours.ABANDON,
                dateEvenement: '2026-02-10T00:00:00.000Z',
                idAnneeScolaire: 'annee-1',
                description: 'Abandon confirme',
                declenchePar: 'user-1',
              },
            ],
          },
        };
      },
    } as never,
    async consulterClassePedagogique(idClassePedagogique: string) {
      return {
        idClassePedagogique,
        libelleClasse: '2e Commerciale',
        idEcole: 'ecole-1',
        idSectionScolaire: 'section-secondaire',
        sectionCode: 'SECONDAIRE',
        sectionLibelle: 'Secondaire',
      };
    },
  });

  const eleve = await adapter.consulterEleve('eleve-1');
  const inscription = await adapter.consulterInscription('inscription-1');
  const classePedagogique = await adapter.consulterClassePedagogique('classe-1');
  const abandon = await adapter.verifierAbandon('eleve-1', 'annee-1');

  assert.deepEqual(eleve, {
    idEleve: 'eleve-1',
    nomComplet: 'Kanku Ilunga Aime',
    sexe: SexeEleve.F,
    idEcole: 'ecole-1',
    matricule: 'MAT-1',
    nom: 'Kanku',
    postNom: 'Ilunga',
    prenom: 'Aime',
    dateNaissance: '2010-01-01',
    lieuNaissance: undefined,
  });
  assert.deepEqual(inscription, {
    idInscriptionScolaire: 'inscription-1',
    idEleve: 'eleve-1',
    idClassePedagogique: 'classe-1',
    idAnneeScolaire: 'annee-1',
  });
  assert.deepEqual(classePedagogique, {
    idClassePedagogique: 'classe-1',
    libelleClasse: '2e Commerciale',
    idEcole: 'ecole-1',
    idSectionScolaire: 'section-secondaire',
    sectionCode: 'SECONDAIRE',
    sectionLibelle: 'Secondaire',
  });
  assert.equal(abandon?.idEleve, 'eleve-1');
  assert.equal(abandon?.motifAbandon, 'Abandon confirme');
});
