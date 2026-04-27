import test from 'node:test';
import assert from 'node:assert/strict';
import Fastify from 'fastify';
import { creerRoutesScolariteEleves } from '../../interfaces/http/routes';
import {
  ControleurAffectationsClasses,
  ControleurCycleVieEleves,
  ControleurEleves,
  ControleurFamilles,
  ControleurInscriptionsScolaires,
  ControleurParcoursEleves,
  ControleurScolariteOrganisation,
} from '../../interfaces/http/controllers';

const casUsage = (sortie: unknown) => ({ executer: async () => sortie });

test('API POST /api/eleves cree un eleve via le controleur', async () => {
  const app = Fastify();
  await app.register(creerRoutesScolariteEleves({
    controleurEleves: new ControleurEleves(
      casUsage({ eleve: { idEleve: 'eleve-1', matricule: 'EL-1' } }),
      casUsage({ eleve: {} }),
      casUsage({ eleve: {} }),
      casUsage({ donnees: [], total: 0, page: 1, taillePage: 25 }),
      casUsage({ donnees: [], total: 0, page: 1, taillePage: 25 }),
      casUsage({ eleve: {} }),
      casUsage({ eleve: {} }),
      casUsage({ eleve: {} }),
    ),
    controleurFamilles: new ControleurFamilles(casUsage({ famille: {} }), casUsage({ famille: {} }), casUsage({ famille: {} }), casUsage({ donnees: [], total: 0, page: 1, taillePage: 25 }), casUsage({ famille: {} }), casUsage({ famille: {} }), casUsage({ famille: {} }), casUsage({ famille: {} }), casUsage({})),
    controleurInscriptions: new ControleurInscriptionsScolaires(casUsage({ inscription: {} }), casUsage({}), casUsage({ inscription: {} }), casUsage({ inscription: {} }), casUsage({ inscription: {} }), casUsage([]), casUsage([])),
    controleurAffectations: new ControleurAffectationsClasses(casUsage({ affectation: {} }), casUsage({ affectation: {} }), casUsage({ affectation: {} }), casUsage([]), casUsage(undefined)),
    controleurCycleVie: new ControleurCycleVieEleves(casUsage({ eleve: {} }), casUsage({ eleve: {} }), casUsage({ eleve: {} }), casUsage({ eleve: {} }), casUsage({ eleve: {} }), casUsage({ eleve: {} })),
    controleurParcours: new ControleurParcoursEleves(casUsage({ parcours: {} }), casUsage([]), casUsage([]), casUsage({ parcours: {} })),
    controleurOrganisation: new ControleurScolariteOrganisation(casUsage({ donnees: [], total: 0, page: 1, taillePage: 25 }), casUsage([]), casUsage({ idOrganisation: 'org' }), casUsage([])),
  }));

  const reponse = await app.inject({
    method: 'POST',
    url: '/api/eleves',
    headers: {
      'x-organisation-id': 'org-1',
      'x-tenant-id': 'ecole-1',
      'idempotency-key': 'idem-1',
    },
    payload: {
      idEleve: 'eleve-1',
      matricule: 'EL-1',
      nom: 'Mbuyi',
      postNom: 'Kalala',
      sexe: 'F',
      dateNaissance: '2015-09-12',
      typeProvenance: 'EXTERNE',
      nomEcoleProvenance: 'Institut Mapendo',
    },
  });

  assert.equal(reponse.statusCode, 200);
  assert.equal(reponse.json().donnee.idEleve, 'eleve-1');
  await app.close();
});
