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
  app.addHook('onRequest', async (requete) => {
    (requete as typeof requete & { context: unknown }).context = {
      requestId: 'req-1',
      utilisateurId: 'user-1',
      permissions: [],
      scopes: [],
      restrictions: [],
      titulariats: [],
      modeOffline: false,
    };
  });
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
    controleurAffectations: new ControleurAffectationsClasses(casUsage({ affectation: {} }), casUsage({ affectation: {} }), casUsage({ affectation: {} }), casUsage({ affectation: {} }), casUsage([]), casUsage(undefined)),
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

test('API POST /api/inscriptions-scolaires/complete valide le payload compose', async () => {
  const app = Fastify();
  let chargeUtile: unknown;
  const casUsageComplet = {
    executer: async (entree: unknown) => {
      chargeUtile = entree;
      return {
        eleve: { idEleve: 'eleve-1' },
        inscription: { idInscriptionScolaire: 'inscription-1' },
        affectation: { idAffectationClasse: 'affectation-1' },
      };
    },
  };
  app.addHook('onRequest', async (requete) => {
    (requete as typeof requete & { context: unknown }).context = {
      requestId: 'req-1',
      utilisateurId: 'user-1',
      permissions: [],
      scopes: [],
      restrictions: [],
      titulariats: [],
      modeOffline: false,
    };
  });

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
    controleurInscriptions: new ControleurInscriptionsScolaires(casUsage({ inscription: {} }), casUsageComplet, casUsage({ inscription: {} }), casUsage({ inscription: {} }), casUsage({ inscription: {} }), casUsage([]), casUsage([])),
    controleurAffectations: new ControleurAffectationsClasses(casUsage({ affectation: {} }), casUsage({ affectation: {} }), casUsage({ affectation: {} }), casUsage({ affectation: {} }), casUsage([]), casUsage(undefined)),
    controleurCycleVie: new ControleurCycleVieEleves(casUsage({ eleve: {} }), casUsage({ eleve: {} }), casUsage({ eleve: {} }), casUsage({ eleve: {} }), casUsage({ eleve: {} }), casUsage({ eleve: {} })),
    controleurParcours: new ControleurParcoursEleves(casUsage({ parcours: {} }), casUsage([]), casUsage([]), casUsage({ parcours: {} })),
    controleurOrganisation: new ControleurScolariteOrganisation(casUsage({ donnees: [], total: 0, page: 1, taillePage: 25 }), casUsage([]), casUsage({ idOrganisation: 'org' }), casUsage([])),
  }));

  const reponse = await app.inject({
    method: 'POST',
    url: '/api/inscriptions-scolaires/complete',
    headers: {
      'x-organisation-id': 'org-1',
      'x-tenant-id': 'ecole-1',
      'idempotency-key': 'idem-1',
    },
    payload: {
      eleve: {
        idEleve: 'eleve-1',
        matricule: 'EL-1',
        nom: 'Mbuyi',
        postNom: 'Kalala',
        sexe: 'F',
        dateNaissance: '2015-09-12',
        typeProvenance: 'EXTERNE',
        nomEcoleProvenance: 'Institut Mapendo',
      },
      inscription: {
        idInscriptionScolaire: 'inscription-1',
        idEleve: 'eleve-1',
        idAnneeScolaire: 'annee-2026',
        dateInscription: '2026-09-01',
        origineInscription: 'NOUVEAU',
      },
      affectation: {
        idAffectationClasse: 'affectation-1',
        idInscriptionScolaire: 'inscription-1',
        idClassePedagogique: 'classe-1',
        dateAffectation: '2026-09-02',
      },
    },
  });

  assert.equal(reponse.statusCode, 200);
  assert.equal(reponse.json().donnee.eleve.idEleve, 'eleve-1');
  assert.deepEqual(chargeUtile, {
    eleve: {
      idOrganisation: 'org-1',
      idEcole: 'ecole-1',
      idUtilisateur: 'user-1',
      idempotencyKey: 'idem-1',
      idEleve: 'eleve-1',
      matricule: 'EL-1',
      nom: 'Mbuyi',
      postNom: 'Kalala',
      prenom: undefined,
      sexe: 'F',
      dateNaissance: '2015-09-12',
      lieuNaissance: undefined,
      nationalite: undefined,
      typeProvenance: 'EXTERNE',
      nomEcoleProvenance: 'Institut Mapendo',
      idEcoleProvenance: undefined,
      idFamille: undefined,
    },
    inscription: {
      idOrganisation: 'org-1',
      idEcole: 'ecole-1',
      idUtilisateur: 'user-1',
      idempotencyKey: 'idem-1',
      idInscriptionScolaire: 'inscription-1',
      idEleve: 'eleve-1',
      idAnneeScolaire: 'annee-2026',
      dateInscription: '2026-09-01',
      origineInscription: 'NOUVEAU',
      numeroOrdre: undefined,
      observation: undefined,
    },
    affectation: {
      idOrganisation: 'org-1',
      idEcole: 'ecole-1',
      idUtilisateur: 'user-1',
      idempotencyKey: 'idem-1',
      idAffectationClasse: 'affectation-1',
      idInscriptionScolaire: 'inscription-1',
      idClassePedagogique: 'classe-1',
      dateAffectation: '2026-09-02',
      motifAffectation: undefined,
    },
  });

  await app.close();
});

test('API POST /api/inscriptions-scolaires/complete transporte la meme cle idempotente a chaque appel', async () => {
  const app = Fastify();
  const charges: unknown[] = [];
  const casUsageComplet = {
    executer: async (entree: unknown) => {
      charges.push(entree);
      return {
        eleve: { idEleve: 'eleve-1' },
        inscription: { idInscriptionScolaire: 'inscription-1' },
      };
    },
  };
  app.addHook('onRequest', async (requete) => {
    (requete as typeof requete & { context: unknown }).context = {
      requestId: 'req-1',
      utilisateurId: 'user-1',
      permissions: [],
      scopes: [],
      restrictions: [],
      titulariats: [],
      modeOffline: false,
    };
  });

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
    controleurInscriptions: new ControleurInscriptionsScolaires(casUsage({ inscription: {} }), casUsageComplet, casUsage({ inscription: {} }), casUsage({ inscription: {} }), casUsage({ inscription: {} }), casUsage([]), casUsage([])),
    controleurAffectations: new ControleurAffectationsClasses(casUsage({ affectation: {} }), casUsage({ affectation: {} }), casUsage({ affectation: {} }), casUsage({ affectation: {} }), casUsage([]), casUsage(undefined)),
    controleurCycleVie: new ControleurCycleVieEleves(casUsage({ eleve: {} }), casUsage({ eleve: {} }), casUsage({ eleve: {} }), casUsage({ eleve: {} }), casUsage({ eleve: {} }), casUsage({ eleve: {} })),
    controleurParcours: new ControleurParcoursEleves(casUsage({ parcours: {} }), casUsage([]), casUsage([]), casUsage({ parcours: {} })),
    controleurOrganisation: new ControleurScolariteOrganisation(casUsage({ donnees: [], total: 0, page: 1, taillePage: 25 }), casUsage([]), casUsage({ idOrganisation: 'org' }), casUsage([])),
  }));

  const requete = {
    method: 'POST' as const,
    url: '/api/inscriptions-scolaires/complete',
    headers: {
      'x-organisation-id': 'org-1',
      'x-tenant-id': 'ecole-1',
      'idempotency-key': 'idem-replay',
    },
    payload: {
      eleve: {
        idEleve: 'eleve-1',
        matricule: 'EL-1',
        nom: 'Mbuyi',
        postNom: 'Kalala',
        sexe: 'F',
        dateNaissance: '2015-09-12',
        typeProvenance: 'EXTERNE',
        nomEcoleProvenance: 'Institut Mapendo',
      },
      inscription: {
        idInscriptionScolaire: 'inscription-1',
        idEleve: 'eleve-1',
        idAnneeScolaire: 'annee-2026',
        dateInscription: '2026-09-01',
        origineInscription: 'NOUVEAU',
      },
    },
  };

  const reponse1 = await app.inject(requete);
  const reponse2 = await app.inject(requete);

  assert.equal(reponse1.statusCode, 200);
  assert.equal(reponse2.statusCode, 200);
  assert.equal(charges.length, 2);
  assert.equal((charges[0] as { eleve: { idempotencyKey: string } }).eleve.idempotencyKey, 'idem-replay');
  assert.equal((charges[1] as { eleve: { idempotencyKey: string } }).eleve.idempotencyKey, 'idem-replay');

  await app.close();
});

test('API POST /api/eleves/:id/abandon route bien vers le controleur cycle de vie', async () => {
  const app = Fastify();
  let appels = 0;
  const casCycleVie = {
    executer: async () => {
      appels += 1;
      return { eleve: { idEleve: 'eleve-1', statutGlobal: 'ABANDONNE' } };
    },
  };
  app.addHook('onRequest', async (requete) => {
    (requete as typeof requete & { context: unknown }).context = {
      requestId: 'req-1',
      utilisateurId: 'user-1',
      permissions: [],
      scopes: [],
      restrictions: [],
      titulariats: [],
      modeOffline: false,
    };
  });

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
    controleurAffectations: new ControleurAffectationsClasses(casUsage({ affectation: {} }), casUsage({ affectation: {} }), casUsage({ affectation: {} }), casUsage({ affectation: {} }), casUsage([]), casUsage(undefined)),
    controleurCycleVie: new ControleurCycleVieEleves(casCycleVie, casUsage({ eleve: {} }), casUsage({ eleve: {} }), casUsage({ eleve: {} }), casUsage({ eleve: {} }), casUsage({ eleve: {} })),
    controleurParcours: new ControleurParcoursEleves(casUsage({ parcours: {} }), casUsage([]), casUsage([]), casUsage({ parcours: {} })),
    controleurOrganisation: new ControleurScolariteOrganisation(casUsage({ donnees: [], total: 0, page: 1, taillePage: 25 }), casUsage([]), casUsage({ idOrganisation: 'org' }), casUsage([])),
  }));

  const reponse = await app.inject({
    method: 'POST',
    url: '/api/eleves/eleve-1/abandon',
    headers: {
      'x-organisation-id': 'org-1',
      'x-tenant-id': 'ecole-1',
      'x-user-id': 'user-1',
      'idempotency-key': 'idem-abandon',
    },
    payload: {
      versionAttendue: 1,
    },
  });

  assert.equal(reponse.statusCode, 200);
  assert.equal(appels, 1);
  assert.equal(reponse.json().donnee.idEleve, 'eleve-1');
  await app.close();
});

test('API POST /api/eleves/:id/deces passe par le controleur cycle de vie', async () => {
  const app = Fastify();
  let appelsDeces = 0;
  const casDeces = {
    executer: async () => {
      appelsDeces += 1;
      return { eleve: { idEleve: 'eleve-1', statutGlobal: 'DECEDE' } };
    },
  };
  app.addHook('onRequest', async (requete) => {
    (requete as typeof requete & { context: unknown }).context = {
      requestId: 'req-1',
      utilisateurId: 'user-1',
      permissions: [],
      scopes: [],
      restrictions: [],
      titulariats: [],
      modeOffline: false,
    };
  });

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
    controleurAffectations: new ControleurAffectationsClasses(casUsage({ affectation: {} }), casUsage({ affectation: {} }), casUsage({ affectation: {} }), casUsage({ affectation: {} }), casUsage([]), casUsage(undefined)),
    controleurCycleVie: new ControleurCycleVieEleves(casUsage({ eleve: {} }), casUsage({ eleve: {} }), casUsage({ eleve: {} }), casUsage({ eleve: {} }), casUsage({ eleve: {} }), casDeces),
    controleurParcours: new ControleurParcoursEleves(casUsage({ parcours: {} }), casUsage([]), casUsage([]), casUsage({ parcours: {} })),
    controleurOrganisation: new ControleurScolariteOrganisation(casUsage({ donnees: [], total: 0, page: 1, taillePage: 25 }), casUsage([]), casUsage({ idOrganisation: 'org' }), casUsage([])),
  }));

  const reponse = await app.inject({
    method: 'POST',
    url: '/api/eleves/eleve-1/deces',
    headers: {
      'x-organisation-id': 'org-1',
      'x-tenant-id': 'ecole-1',
      'x-user-id': 'user-1',
      'idempotency-key': 'idem-deces',
    },
    payload: {
      versionAttendue: 1,
    },
  });

  assert.equal(reponse.statusCode, 200);
  assert.equal(appelsDeces, 1);
  assert.equal(reponse.json().donnee.idEleve, 'eleve-1');
  await app.close();
});

test('API POST /api/affectations-classes transporte le contexte utilisateur au controleur', async () => {
  const app = Fastify();
  let chargeUtile: unknown;
  const casAffectation = {
    executer: async (entree: unknown) => {
      chargeUtile = entree;
      return { affectation: { idAffectationClasse: 'affectation-1' } };
    },
  };
  app.addHook('onRequest', async (requete) => {
    (requete as typeof requete & { context: unknown }).context = {
      requestId: 'req-1',
      utilisateurId: 'user-1',
      permissions: [],
      scopes: [],
      restrictions: [],
      titulariats: [],
      modeOffline: false,
    };
  });

  await app.register(creerRoutesScolariteEleves({
    controleurEleves: new ControleurEleves(casUsage({ eleve: { idEleve: 'eleve-1', matricule: 'EL-1' } }), casUsage({ eleve: {} }), casUsage({ eleve: {} }), casUsage({ donnees: [], total: 0, page: 1, taillePage: 25 }), casUsage({ donnees: [], total: 0, page: 1, taillePage: 25 }), casUsage({ eleve: {} }), casUsage({ eleve: {} }), casUsage({ eleve: {} })),
    controleurFamilles: new ControleurFamilles(casUsage({ famille: {} }), casUsage({ famille: {} }), casUsage({ famille: {} }), casUsage({ donnees: [], total: 0, page: 1, taillePage: 25 }), casUsage({ famille: {} }), casUsage({ famille: {} }), casUsage({ famille: {} }), casUsage({ famille: {} }), casUsage({})),
    controleurInscriptions: new ControleurInscriptionsScolaires(casUsage({ inscription: {} }), casUsage({}), casUsage({ inscription: {} }), casUsage({ inscription: {} }), casUsage({ inscription: {} }), casUsage([]), casUsage([])),
    controleurAffectations: new ControleurAffectationsClasses(casAffectation, casUsage({ affectation: {} }), casUsage({ affectation: {} }), casUsage({ affectation: {} }), casUsage([]), casUsage(undefined)),
    controleurCycleVie: new ControleurCycleVieEleves(casUsage({ eleve: {} }), casUsage({ eleve: {} }), casUsage({ eleve: {} }), casUsage({ eleve: {} }), casUsage({ eleve: {} }), casUsage({ eleve: {} })),
    controleurParcours: new ControleurParcoursEleves(casUsage({ parcours: {} }), casUsage([]), casUsage([]), casUsage({ parcours: {} })),
    controleurOrganisation: new ControleurScolariteOrganisation(casUsage({ donnees: [], total: 0, page: 1, taillePage: 25 }), casUsage([]), casUsage({ idOrganisation: 'org' }), casUsage([])),
  }));

  const reponse = await app.inject({
    method: 'POST',
    url: '/api/affectations-classes',
    headers: {
      'x-organisation-id': 'org-1',
      'x-tenant-id': 'ecole-1',
      'idempotency-key': 'idem-affectation',
    },
    payload: {
      idAffectationClasse: 'affectation-1',
      idInscriptionScolaire: 'inscription-1',
      idClassePedagogique: 'classe-1',
      dateAffectation: '2026-09-02',
    },
  });

  assert.equal(reponse.statusCode, 200);
  assert.deepEqual(chargeUtile, {
    idOrganisation: 'org-1',
    idEcole: 'ecole-1',
    idUtilisateur: 'user-1',
    idempotencyKey: 'idem-affectation',
    idAffectationClasse: 'affectation-1',
    idInscriptionScolaire: 'inscription-1',
    idClassePedagogique: 'classe-1',
    dateAffectation: '2026-09-02',
    motifAffectation: undefined,
  });
  await app.close();
});

test('API POST /api/familles transporte le contexte utilisateur au controleur', async () => {
  const app = Fastify();
  let chargeUtile: unknown;
  const casFamille = {
    executer: async (entree: unknown) => {
      chargeUtile = entree;
      return { famille: { idFamille: 'famille-1' } };
    },
  };
  app.addHook('onRequest', async (requete) => {
    (requete as typeof requete & { context: unknown }).context = {
      requestId: 'req-1',
      utilisateurId: 'user-1',
      permissions: [],
      scopes: [],
      restrictions: [],
      titulariats: [],
      modeOffline: false,
    };
  });

  await app.register(creerRoutesScolariteEleves({
    controleurEleves: new ControleurEleves(casUsage({ eleve: { idEleve: 'eleve-1', matricule: 'EL-1' } }), casUsage({ eleve: {} }), casUsage({ eleve: {} }), casUsage({ donnees: [], total: 0, page: 1, taillePage: 25 }), casUsage({ donnees: [], total: 0, page: 1, taillePage: 25 }), casUsage({ eleve: {} }), casUsage({ eleve: {} }), casUsage({ eleve: {} })),
    controleurFamilles: new ControleurFamilles(casFamille, casUsage({ famille: {} }), casUsage({ famille: {} }), casUsage({ donnees: [], total: 0, page: 1, taillePage: 25 }), casUsage({ famille: {} }), casUsage({ famille: {} }), casUsage({ famille: {} }), casUsage({ famille: {} }), casUsage({})),
    controleurInscriptions: new ControleurInscriptionsScolaires(casUsage({ inscription: {} }), casUsage({}), casUsage({ inscription: {} }), casUsage({ inscription: {} }), casUsage({ inscription: {} }), casUsage([]), casUsage([])),
    controleurAffectations: new ControleurAffectationsClasses(casUsage({ affectation: {} }), casUsage({ affectation: {} }), casUsage({ affectation: {} }), casUsage({ affectation: {} }), casUsage([]), casUsage(undefined)),
    controleurCycleVie: new ControleurCycleVieEleves(casUsage({ eleve: {} }), casUsage({ eleve: {} }), casUsage({ eleve: {} }), casUsage({ eleve: {} }), casUsage({ eleve: {} }), casUsage({ eleve: {} })),
    controleurParcours: new ControleurParcoursEleves(casUsage({ parcours: {} }), casUsage([]), casUsage([]), casUsage({ parcours: {} })),
    controleurOrganisation: new ControleurScolariteOrganisation(casUsage({ donnees: [], total: 0, page: 1, taillePage: 25 }), casUsage([]), casUsage({ idOrganisation: 'org' }), casUsage([])),
  }));

  const reponse = await app.inject({
    method: 'POST',
    url: '/api/familles',
    headers: {
      'x-organisation-id': 'org-1',
      'x-tenant-id': 'ecole-1',
      'idempotency-key': 'idem-famille',
    },
    payload: {
      idFamille: 'famille-1',
      codeFamille: 'FAM-001',
      nomFamille: 'Famille Mbuyi',
      telephonePrincipal: '0990000000',
    },
  });

  assert.equal(reponse.statusCode, 200);
  assert.deepEqual(chargeUtile, {
    idOrganisation: 'org-1',
    idEcole: 'ecole-1',
    idUtilisateur: 'user-1',
    idempotencyKey: 'idem-famille',
    idFamille: 'famille-1',
    codeFamille: 'FAM-001',
    nomFamille: 'Famille Mbuyi',
    adresse: undefined,
    telephonePrincipal: '0990000000',
    email: undefined,
  });
  await app.close();
});

test('API GET /api/eleves/:id transporte le contexte utilisateur au controleur', async () => {
  const app = Fastify();
  let chargeUtile: unknown;
  const casEleve = {
    executer: async (entree: unknown) => {
      chargeUtile = entree;
      return { eleve: { idEleve: 'eleve-1' } };
    },
  };
  app.addHook('onRequest', async (requete) => {
    (requete as typeof requete & { context: unknown }).context = {
      requestId: 'req-1',
      utilisateurId: 'user-1',
      permissions: [],
      scopes: [],
      restrictions: [],
      titulariats: [],
      modeOffline: false,
    };
  });

  await app.register(creerRoutesScolariteEleves({
    controleurEleves: new ControleurEleves(casUsage({ eleve: {} }), casUsage({ eleve: {} }), casEleve, casUsage({ donnees: [], total: 0, page: 1, taillePage: 25 }), casUsage({ donnees: [], total: 0, page: 1, taillePage: 25 }), casUsage({ eleve: {} }), casUsage({ eleve: {} }), casUsage({ eleve: {} })),
    controleurFamilles: new ControleurFamilles(casUsage({ famille: {} }), casUsage({ famille: {} }), casUsage({ famille: {} }), casUsage({ donnees: [], total: 0, page: 1, taillePage: 25 }), casUsage({ famille: {} }), casUsage({ famille: {} }), casUsage({ famille: {} }), casUsage({ famille: {} }), casUsage({})),
    controleurInscriptions: new ControleurInscriptionsScolaires(casUsage({ inscription: {} }), casUsage({}), casUsage({ inscription: {} }), casUsage({ inscription: {} }), casUsage({ inscription: {} }), casUsage([]), casUsage([])),
    controleurAffectations: new ControleurAffectationsClasses(casUsage({ affectation: {} }), casUsage({ affectation: {} }), casUsage({ affectation: {} }), casUsage({ affectation: {} }), casUsage([]), casUsage(undefined)),
    controleurCycleVie: new ControleurCycleVieEleves(casUsage({ eleve: {} }), casUsage({ eleve: {} }), casUsage({ eleve: {} }), casUsage({ eleve: {} }), casUsage({ eleve: {} }), casUsage({ eleve: {} })),
    controleurParcours: new ControleurParcoursEleves(casUsage({ parcours: {} }), casUsage([]), casUsage([]), casUsage({ parcours: {} })),
    controleurOrganisation: new ControleurScolariteOrganisation(casUsage({ donnees: [], total: 0, page: 1, taillePage: 25 }), casUsage([]), casUsage({ idOrganisation: 'org' }), casUsage([])),
  }));

  const reponse = await app.inject({
    method: 'GET',
    url: '/api/eleves/eleve-1',
    headers: {
      'x-organisation-id': 'org-1',
      'x-tenant-id': 'ecole-1',
    },
  });

  assert.equal(reponse.statusCode, 200);
  assert.deepEqual(chargeUtile, {
    idEleve: 'eleve-1',
    idOrganisation: 'org-1',
    idEcole: 'ecole-1',
    idUtilisateur: 'user-1',
    idempotencyKey: undefined,
  });
  await app.close();
});

test('API POST /api/eleves/:id/rattacher-famille transporte le contexte utilisateur au controleur', async () => {
  const app = Fastify();
  let chargeUtile: unknown;
  const casRattachement = {
    executer: async (entree: unknown) => {
      chargeUtile = entree;
      return { eleve: { idEleve: 'eleve-1' } };
    },
  };
  app.addHook('onRequest', async (requete) => {
    (requete as typeof requete & { context: unknown }).context = {
      requestId: 'req-1',
      utilisateurId: 'user-1',
      permissions: [],
      scopes: [],
      restrictions: [],
      titulariats: [],
      modeOffline: false,
    };
  });

  await app.register(creerRoutesScolariteEleves({
    controleurEleves: new ControleurEleves(casUsage({ eleve: {} }), casUsage({ eleve: {} }), casUsage({ eleve: {} }), casUsage({ donnees: [], total: 0, page: 1, taillePage: 25 }), casUsage({ donnees: [], total: 0, page: 1, taillePage: 25 }), casRattachement, casUsage({ eleve: {} }), casUsage({ eleve: {} })),
    controleurFamilles: new ControleurFamilles(casUsage({ famille: {} }), casUsage({ famille: {} }), casUsage({ famille: {} }), casUsage({ donnees: [], total: 0, page: 1, taillePage: 25 }), casUsage({ famille: {} }), casUsage({ famille: {} }), casUsage({ famille: {} }), casUsage({ famille: {} }), casUsage({})),
    controleurInscriptions: new ControleurInscriptionsScolaires(casUsage({ inscription: {} }), casUsage({}), casUsage({ inscription: {} }), casUsage({ inscription: {} }), casUsage({ inscription: {} }), casUsage([]), casUsage([])),
    controleurAffectations: new ControleurAffectationsClasses(casUsage({ affectation: {} }), casUsage({ affectation: {} }), casUsage({ affectation: {} }), casUsage({ affectation: {} }), casUsage([]), casUsage(undefined)),
    controleurCycleVie: new ControleurCycleVieEleves(casUsage({ eleve: {} }), casUsage({ eleve: {} }), casUsage({ eleve: {} }), casUsage({ eleve: {} }), casUsage({ eleve: {} }), casUsage({ eleve: {} })),
    controleurParcours: new ControleurParcoursEleves(casUsage({ parcours: {} }), casUsage([]), casUsage([]), casUsage({ parcours: {} })),
    controleurOrganisation: new ControleurScolariteOrganisation(casUsage({ donnees: [], total: 0, page: 1, taillePage: 25 }), casUsage([]), casUsage({ idOrganisation: 'org' }), casUsage([])),
  }));

  const reponse = await app.inject({
    method: 'POST',
    url: '/api/eleves/eleve-1/rattacher-famille',
    headers: {
      'x-organisation-id': 'org-1',
      'x-tenant-id': 'ecole-1',
    },
    payload: {
      idFamille: 'famille-1',
      versionAttendue: 1,
    },
  });

  assert.equal(reponse.statusCode, 200);
  assert.deepEqual(chargeUtile, {
    idOrganisation: 'org-1',
    idEcole: 'ecole-1',
    idUtilisateur: 'user-1',
    idempotencyKey: undefined,
    idEleve: 'eleve-1',
    idFamille: 'famille-1',
    versionAttendue: 1,
  });
  await app.close();
});

test('API GET /api/familles/:id transporte le contexte utilisateur au controleur', async () => {
  const app = Fastify();
  let chargeUtile: unknown;
  const casFamille = {
    executer: async (entree: unknown) => {
      chargeUtile = entree;
      return { famille: { idFamille: 'famille-1' } };
    },
  };
  app.addHook('onRequest', async (requete) => {
    (requete as typeof requete & { context: unknown }).context = {
      requestId: 'req-1',
      utilisateurId: 'user-1',
      permissions: [],
      scopes: [],
      restrictions: [],
      titulariats: [],
      modeOffline: false,
    };
  });

  await app.register(creerRoutesScolariteEleves({
    controleurEleves: new ControleurEleves(casUsage({ eleve: { idEleve: 'eleve-1', matricule: 'EL-1' } }), casUsage({ eleve: {} }), casUsage({ eleve: {} }), casUsage({ donnees: [], total: 0, page: 1, taillePage: 25 }), casUsage({ donnees: [], total: 0, page: 1, taillePage: 25 }), casUsage({ eleve: {} }), casUsage({ eleve: {} }), casUsage({ eleve: {} })),
    controleurFamilles: new ControleurFamilles(casUsage({ famille: {} }), casUsage({ famille: {} }), casFamille, casUsage({ donnees: [], total: 0, page: 1, taillePage: 25 }), casUsage({ famille: {} }), casUsage({ famille: {} }), casUsage({ famille: {} }), casUsage({ famille: {} }), casUsage({})),
    controleurInscriptions: new ControleurInscriptionsScolaires(casUsage({ inscription: {} }), casUsage({}), casUsage({ inscription: {} }), casUsage({ inscription: {} }), casUsage({ inscription: {} }), casUsage([]), casUsage([])),
    controleurAffectations: new ControleurAffectationsClasses(casUsage({ affectation: {} }), casUsage({ affectation: {} }), casUsage({ affectation: {} }), casUsage({ affectation: {} }), casUsage([]), casUsage(undefined)),
    controleurCycleVie: new ControleurCycleVieEleves(casUsage({ eleve: {} }), casUsage({ eleve: {} }), casUsage({ eleve: {} }), casUsage({ eleve: {} }), casUsage({ eleve: {} }), casUsage({ eleve: {} })),
    controleurParcours: new ControleurParcoursEleves(casUsage({ parcours: {} }), casUsage([]), casUsage([]), casUsage({ parcours: {} })),
    controleurOrganisation: new ControleurScolariteOrganisation(casUsage({ donnees: [], total: 0, page: 1, taillePage: 25 }), casUsage([]), casUsage({ idOrganisation: 'org' }), casUsage([])),
  }));

  const reponse = await app.inject({
    method: 'GET',
    url: '/api/familles/famille-1',
    headers: {
      'x-organisation-id': 'org-1',
      'x-tenant-id': 'ecole-1',
    },
  });

  assert.equal(reponse.statusCode, 200);
  assert.deepEqual(chargeUtile, {
    idFamille: 'famille-1',
    idOrganisation: 'org-1',
    idEcole: 'ecole-1',
    idUtilisateur: 'user-1',
    idempotencyKey: undefined,
  });
  await app.close();
});

test('API GET /api/affectations-classes/active/:idInscription transporte le contexte utilisateur au controleur', async () => {
  const app = Fastify();
  let chargeUtile: unknown;
  const casConsultation = {
    executer: async (entree: unknown) => {
      chargeUtile = entree;
      return { affectation: { idAffectationClasse: 'affectation-1' } };
    },
  };
  app.addHook('onRequest', async (requete) => {
    (requete as typeof requete & { context: unknown }).context = {
      requestId: 'req-1',
      utilisateurId: 'user-1',
      permissions: [],
      scopes: [],
      restrictions: [],
      titulariats: [],
      modeOffline: false,
    };
  });

  await app.register(creerRoutesScolariteEleves({
    controleurEleves: new ControleurEleves(casUsage({ eleve: { idEleve: 'eleve-1', matricule: 'EL-1' } }), casUsage({ eleve: {} }), casUsage({ eleve: {} }), casUsage({ donnees: [], total: 0, page: 1, taillePage: 25 }), casUsage({ donnees: [], total: 0, page: 1, taillePage: 25 }), casUsage({ eleve: {} }), casUsage({ eleve: {} }), casUsage({ eleve: {} })),
    controleurFamilles: new ControleurFamilles(casUsage({ famille: {} }), casUsage({ famille: {} }), casUsage({ famille: {} }), casUsage({ donnees: [], total: 0, page: 1, taillePage: 25 }), casUsage({ famille: {} }), casUsage({ famille: {} }), casUsage({ famille: {} }), casUsage({ famille: {} }), casUsage({})),
    controleurInscriptions: new ControleurInscriptionsScolaires(casUsage({ inscription: {} }), casUsage({}), casUsage({ inscription: {} }), casUsage({ inscription: {} }), casUsage({ inscription: {} }), casUsage([]), casUsage([])),
    controleurAffectations: new ControleurAffectationsClasses(casUsage({ affectation: {} }), casUsage({ affectation: {} }), casConsultation, casUsage({ affectation: {} }), casUsage([]), casUsage(undefined)),
    controleurCycleVie: new ControleurCycleVieEleves(casUsage({ eleve: {} }), casUsage({ eleve: {} }), casUsage({ eleve: {} }), casUsage({ eleve: {} }), casUsage({ eleve: {} }), casUsage({ eleve: {} })),
    controleurParcours: new ControleurParcoursEleves(casUsage({ parcours: {} }), casUsage([]), casUsage([]), casUsage({ parcours: {} })),
    controleurOrganisation: new ControleurScolariteOrganisation(casUsage({ donnees: [], total: 0, page: 1, taillePage: 25 }), casUsage([]), casUsage({ idOrganisation: 'org' }), casUsage([])),
  }));

  const reponse = await app.inject({
    method: 'GET',
    url: '/api/affectations-classes/active/inscription-1',
    headers: {
      'x-organisation-id': 'org-1',
      'x-tenant-id': 'ecole-1',
    },
  });

  assert.equal(reponse.statusCode, 200);
  assert.deepEqual(chargeUtile, {
    idInscriptionScolaire: 'inscription-1',
    idOrganisation: 'org-1',
    idEcole: 'ecole-1',
    idUtilisateur: 'user-1',
    idempotencyKey: undefined,
  });
  await app.close();
});

test('API GET /api/affectations-classes/:id transporte l identifiant d affectation au controleur dedie', async () => {
  const app = Fastify();
  let chargeUtile: unknown;
  const casConsultationParId = {
    executer: async (entree: unknown) => {
      chargeUtile = entree;
      return { affectation: { idAffectationClasse: 'affectation-1' } };
    },
  };
  app.addHook('onRequest', async (requete) => {
    (requete as typeof requete & { context: unknown }).context = {
      requestId: 'req-1',
      utilisateurId: 'user-1',
      permissions: [],
      scopes: [],
      restrictions: [],
      titulariats: [],
      modeOffline: false,
    };
  });

  await app.register(creerRoutesScolariteEleves({
    controleurEleves: new ControleurEleves(casUsage({ eleve: { idEleve: 'eleve-1', matricule: 'EL-1' } }), casUsage({ eleve: {} }), casUsage({ eleve: {} }), casUsage({ donnees: [], total: 0, page: 1, taillePage: 25 }), casUsage({ donnees: [], total: 0, page: 1, taillePage: 25 }), casUsage({ eleve: {} }), casUsage({ eleve: {} }), casUsage({ eleve: {} })),
    controleurFamilles: new ControleurFamilles(casUsage({ famille: {} }), casUsage({ famille: {} }), casUsage({ famille: {} }), casUsage({ donnees: [], total: 0, page: 1, taillePage: 25 }), casUsage({ famille: {} }), casUsage({ famille: {} }), casUsage({ famille: {} }), casUsage({ famille: {} }), casUsage({})),
    controleurInscriptions: new ControleurInscriptionsScolaires(casUsage({ inscription: {} }), casUsage({}), casUsage({ inscription: {} }), casUsage({ inscription: {} }), casUsage({ inscription: {} }), casUsage([]), casUsage([])),
    controleurAffectations: new ControleurAffectationsClasses(casUsage({ affectation: {} }), casUsage({ affectation: {} }), casUsage({ affectation: {} }), casConsultationParId, casUsage([]), casUsage(undefined)),
    controleurCycleVie: new ControleurCycleVieEleves(casUsage({ eleve: {} }), casUsage({ eleve: {} }), casUsage({ eleve: {} }), casUsage({ eleve: {} }), casUsage({ eleve: {} }), casUsage({ eleve: {} })),
    controleurParcours: new ControleurParcoursEleves(casUsage({ parcours: {} }), casUsage([]), casUsage([]), casUsage({ parcours: {} })),
    controleurOrganisation: new ControleurScolariteOrganisation(casUsage({ donnees: [], total: 0, page: 1, taillePage: 25 }), casUsage([]), casUsage({ idOrganisation: 'org' }), casUsage([])),
  }));

  const reponse = await app.inject({
    method: 'GET',
    url: '/api/affectations-classes/affectation-1',
    headers: {
      'x-organisation-id': 'org-1',
      'x-tenant-id': 'ecole-1',
    },
  });

  assert.equal(reponse.statusCode, 200);
  assert.deepEqual(chargeUtile, {
    idAffectationClasse: 'affectation-1',
    idOrganisation: 'org-1',
    idEcole: 'ecole-1',
    idUtilisateur: 'user-1',
    idempotencyKey: undefined,
  });
  await app.close();
});

test('API GET /api/classes-pedagogiques/:id/eleves transporte le contexte utilisateur au controleur', async () => {
  const app = Fastify();
  let chargeUtile: unknown;
  const casListeClasse = {
    executer: async (entree: unknown) => {
      chargeUtile = entree;
      return [{ idEleve: 'eleve-1', idInscriptionScolaire: 'inscription-1' }];
    },
  };
  app.addHook('onRequest', async (requete) => {
    (requete as typeof requete & { context: unknown }).context = {
      requestId: 'req-1',
      utilisateurId: 'user-1',
      permissions: [],
      scopes: [],
      restrictions: [],
      titulariats: [],
      modeOffline: false,
    };
  });

  await app.register(creerRoutesScolariteEleves({
    controleurEleves: new ControleurEleves(casUsage({ eleve: { idEleve: 'eleve-1', matricule: 'EL-1' } }), casUsage({ eleve: {} }), casUsage({ eleve: {} }), casUsage({ donnees: [], total: 0, page: 1, taillePage: 25 }), casUsage({ donnees: [], total: 0, page: 1, taillePage: 25 }), casUsage({ eleve: {} }), casUsage({ eleve: {} }), casUsage({ eleve: {} })),
    controleurFamilles: new ControleurFamilles(casUsage({ famille: {} }), casUsage({ famille: {} }), casUsage({ famille: {} }), casUsage({ donnees: [], total: 0, page: 1, taillePage: 25 }), casUsage({ famille: {} }), casUsage({ famille: {} }), casUsage({ famille: {} }), casUsage({ famille: {} }), casUsage({})),
    controleurInscriptions: new ControleurInscriptionsScolaires(casUsage({ inscription: {} }), casUsage({}), casUsage({ inscription: {} }), casUsage({ inscription: {} }), casUsage({ inscription: {} }), casUsage([]), casUsage([])),
    controleurAffectations: new ControleurAffectationsClasses(casUsage({ affectation: {} }), casUsage({ affectation: {} }), casUsage({ affectation: {} }), casUsage({ affectation: {} }), casListeClasse, casUsage(undefined)),
    controleurCycleVie: new ControleurCycleVieEleves(casUsage({ eleve: {} }), casUsage({ eleve: {} }), casUsage({ eleve: {} }), casUsage({ eleve: {} }), casUsage({ eleve: {} }), casUsage({ eleve: {} })),
    controleurParcours: new ControleurParcoursEleves(casUsage({ parcours: {} }), casUsage([]), casUsage([]), casUsage({ parcours: {} })),
    controleurOrganisation: new ControleurScolariteOrganisation(casUsage({ donnees: [], total: 0, page: 1, taillePage: 25 }), casUsage([]), casUsage({ idOrganisation: 'org' }), casUsage([])),
  }));

  const reponse = await app.inject({
    method: 'GET',
    url: '/api/classes-pedagogiques/classe-1/eleves',
    headers: {
      'x-organisation-id': 'org-1',
      'x-tenant-id': 'ecole-1',
    },
  });

  assert.equal(reponse.statusCode, 200);
  assert.deepEqual(chargeUtile, {
    idClassePedagogique: 'classe-1',
    idOrganisation: 'org-1',
    idEcole: 'ecole-1',
    idUtilisateur: 'user-1',
    idempotencyKey: undefined,
  });
  assert.deepEqual(reponse.json(), {
    donnees: [{ idEleve: 'eleve-1', idInscriptionScolaire: 'inscription-1' }],
  });
  await app.close();
});

test('API GET /api/eleves/:id/parcours transporte le contexte utilisateur au controleur', async () => {
  const app = Fastify();
  let chargeUtile: unknown;
  const casParcours = {
    executer: async (entree: unknown) => {
      chargeUtile = entree;
      return { parcours: { idEleve: 'eleve-1', historique: [] } };
    },
  };
  app.addHook('onRequest', async (requete) => {
    (requete as typeof requete & { context: unknown }).context = {
      requestId: 'req-1',
      utilisateurId: 'user-1',
      permissions: [],
      scopes: [],
      restrictions: [],
      titulariats: [],
      modeOffline: false,
    };
  });

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
    controleurAffectations: new ControleurAffectationsClasses(casUsage({ affectation: {} }), casUsage({ affectation: {} }), casUsage({ affectation: {} }), casUsage({ affectation: {} }), casUsage([]), casUsage(undefined)),
    controleurCycleVie: new ControleurCycleVieEleves(casUsage({ eleve: {} }), casUsage({ eleve: {} }), casUsage({ eleve: {} }), casUsage({ eleve: {} }), casUsage({ eleve: {} }), casUsage({ eleve: {} })),
    controleurParcours: new ControleurParcoursEleves(casParcours, casUsage([]), casUsage([]), casUsage({ parcours: {} })),
    controleurOrganisation: new ControleurScolariteOrganisation(casUsage({ donnees: [], total: 0, page: 1, taillePage: 25 }), casUsage([]), casUsage({ idOrganisation: 'org' }), casUsage([])),
  }));

  const reponse = await app.inject({
    method: 'GET',
    url: '/api/eleves/eleve-1/parcours',
    headers: {
      'x-organisation-id': 'org-1',
      'x-tenant-id': 'ecole-1',
    },
  });

  assert.equal(reponse.statusCode, 200);
  assert.deepEqual(chargeUtile, {
    idEleve: 'eleve-1',
    idOrganisation: 'org-1',
    idEcole: 'ecole-1',
    idUtilisateur: 'user-1',
    idempotencyKey: undefined,
  });
  await app.close();
});

test('API GET /api/parcours/evenements/par-annee/:idAnnee transporte le contexte utilisateur au controleur', async () => {
  const app = Fastify();
  let chargeUtile: unknown;
  const casParAnnee = {
    executer: async (entree: unknown) => {
      chargeUtile = entree;
      return [];
    },
  };
  app.addHook('onRequest', async (requete) => {
    (requete as typeof requete & { context: unknown }).context = {
      requestId: 'req-1',
      utilisateurId: 'user-1',
      permissions: [],
      scopes: [],
      restrictions: [],
      titulariats: [],
      modeOffline: false,
    };
  });

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
    controleurAffectations: new ControleurAffectationsClasses(casUsage({ affectation: {} }), casUsage({ affectation: {} }), casUsage({ affectation: {} }), casUsage({ affectation: {} }), casUsage([]), casUsage(undefined)),
    controleurCycleVie: new ControleurCycleVieEleves(casUsage({ eleve: {} }), casUsage({ eleve: {} }), casUsage({ eleve: {} }), casUsage({ eleve: {} }), casUsage({ eleve: {} }), casUsage({ eleve: {} })),
    controleurParcours: new ControleurParcoursEleves(casUsage({ parcours: {} }), casUsage([]), casParAnnee, casUsage({ parcours: {} })),
    controleurOrganisation: new ControleurScolariteOrganisation(casUsage({ donnees: [], total: 0, page: 1, taillePage: 25 }), casUsage([]), casUsage({ idOrganisation: 'org' }), casUsage([])),
  }));

  const reponse = await app.inject({
    method: 'GET',
    url: '/api/parcours/evenements/par-annee/annee-2026',
    headers: {
      'x-organisation-id': 'org-1',
      'x-tenant-id': 'ecole-1',
    },
  });

  assert.equal(reponse.statusCode, 200);
  assert.deepEqual(chargeUtile, {
    idAnneeScolaire: 'annee-2026',
    idOrganisation: 'org-1',
    idEcole: 'ecole-1',
    idUtilisateur: 'user-1',
    idempotencyKey: undefined,
  });
  await app.close();
});

test('API POST /api/eleves/:id/parcours/reconstruire n est plus exposee publiquement', async () => {
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
    controleurAffectations: new ControleurAffectationsClasses(casUsage({ affectation: {} }), casUsage({ affectation: {} }), casUsage({ affectation: {} }), casUsage({ affectation: {} }), casUsage([]), casUsage(undefined)),
    controleurCycleVie: new ControleurCycleVieEleves(casUsage({ eleve: {} }), casUsage({ eleve: {} }), casUsage({ eleve: {} }), casUsage({ eleve: {} }), casUsage({ eleve: {} }), casUsage({ eleve: {} })),
    controleurParcours: new ControleurParcoursEleves(casUsage({ parcours: {} }), casUsage([]), casUsage([]), casUsage({ parcours: {} })),
    controleurOrganisation: new ControleurScolariteOrganisation(casUsage({ donnees: [], total: 0, page: 1, taillePage: 25 }), casUsage([]), casUsage({ idOrganisation: 'org' }), casUsage([])),
  }));

  const reponse = await app.inject({
    method: 'POST',
    url: '/api/eleves/eleve-1/parcours/reconstruire',
  });

  assert.equal(reponse.statusCode, 404);
  await app.close();
});

test('API GET /api/organisations/:idOrganisation/scolarite/eleves transporte le contexte authentifie au controleur', async () => {
  const app = Fastify();
  let chargeUtile: unknown;
  const casOrganisation = {
    executer: async (entree: unknown) => {
      chargeUtile = entree;
      return { donnees: [], total: 0, page: 2, taillePage: 10 };
    },
  };
  app.addHook('onRequest', async (requete) => {
    (requete as typeof requete & { context: unknown }).context = {
      requestId: 'req-1',
      utilisateurId: 'user-1',
      permissions: [],
      scopes: [],
      restrictions: [],
      titulariats: [],
      modeOffline: false,
    };
  });

  await app.register(creerRoutesScolariteEleves({
    controleurEleves: new ControleurEleves(casUsage({ eleve: {} }), casUsage({ eleve: {} }), casUsage({ eleve: {} }), casUsage({ donnees: [], total: 0, page: 1, taillePage: 25 }), casUsage({ donnees: [], total: 0, page: 1, taillePage: 25 }), casUsage({ eleve: {} }), casUsage({ eleve: {} }), casUsage({ eleve: {} })),
    controleurFamilles: new ControleurFamilles(casUsage({ famille: {} }), casUsage({ famille: {} }), casUsage({ famille: {} }), casUsage({ donnees: [], total: 0, page: 1, taillePage: 25 }), casUsage({ famille: {} }), casUsage({ famille: {} }), casUsage({ famille: {} }), casUsage({ famille: {} }), casUsage({})),
    controleurInscriptions: new ControleurInscriptionsScolaires(casUsage({ inscription: {} }), casUsage({}), casUsage({ inscription: {} }), casUsage({ inscription: {} }), casUsage({ inscription: {} }), casUsage([]), casUsage([])),
    controleurAffectations: new ControleurAffectationsClasses(casUsage({ affectation: {} }), casUsage({ affectation: {} }), casUsage({ affectation: {} }), casUsage({ affectation: {} }), casUsage([]), casUsage(undefined)),
    controleurCycleVie: new ControleurCycleVieEleves(casUsage({ eleve: {} }), casUsage({ eleve: {} }), casUsage({ eleve: {} }), casUsage({ eleve: {} }), casUsage({ eleve: {} }), casUsage({ eleve: {} })),
    controleurParcours: new ControleurParcoursEleves(casUsage({ parcours: {} }), casUsage([]), casUsage([]), casUsage({ parcours: {} })),
    controleurOrganisation: new ControleurScolariteOrganisation(casOrganisation, casUsage([]), casUsage({ idOrganisation: 'org' }), casUsage([])),
  }));

  const reponse = await app.inject({
    method: 'GET',
    url: '/api/organisations/org-1/scolarite/eleves?page=2&taillePage=10',
    headers: {
      'x-organisation-id': 'org-1',
      'x-tenant-id': 'ecole-1',
    },
  });

  assert.equal(reponse.statusCode, 200);
  assert.deepEqual(chargeUtile, {
    idOrganisation: 'org-1',
    idEcole: 'ecole-1',
    idUtilisateur: 'user-1',
    idempotencyKey: undefined,
    page: 2,
    taillePage: 10,
    idAnneeScolaire: undefined,
  });
  await app.close();
});

test('API GET /api/organisations/:idOrganisation/scolarite/inscriptions transporte annee et utilisateur', async () => {
  const app = Fastify();
  let chargeUtile: unknown;
  const casOrganisation = {
    executer: async (entree: unknown) => {
      chargeUtile = entree;
      return [];
    },
  };
  app.addHook('onRequest', async (requete) => {
    (requete as typeof requete & { context: unknown }).context = {
      requestId: 'req-1',
      utilisateurId: 'user-1',
      permissions: [],
      scopes: [],
      restrictions: [],
      titulariats: [],
      modeOffline: false,
    };
  });

  await app.register(creerRoutesScolariteEleves({
    controleurEleves: new ControleurEleves(casUsage({ eleve: {} }), casUsage({ eleve: {} }), casUsage({ eleve: {} }), casUsage({ donnees: [], total: 0, page: 1, taillePage: 25 }), casUsage({ donnees: [], total: 0, page: 1, taillePage: 25 }), casUsage({ eleve: {} }), casUsage({ eleve: {} }), casUsage({ eleve: {} })),
    controleurFamilles: new ControleurFamilles(casUsage({ famille: {} }), casUsage({ famille: {} }), casUsage({ famille: {} }), casUsage({ donnees: [], total: 0, page: 1, taillePage: 25 }), casUsage({ famille: {} }), casUsage({ famille: {} }), casUsage({ famille: {} }), casUsage({ famille: {} }), casUsage({})),
    controleurInscriptions: new ControleurInscriptionsScolaires(casUsage({ inscription: {} }), casUsage({}), casUsage({ inscription: {} }), casUsage({ inscription: {} }), casUsage({ inscription: {} }), casUsage([]), casUsage([])),
    controleurAffectations: new ControleurAffectationsClasses(casUsage({ affectation: {} }), casUsage({ affectation: {} }), casUsage({ affectation: {} }), casUsage({ affectation: {} }), casUsage([]), casUsage(undefined)),
    controleurCycleVie: new ControleurCycleVieEleves(casUsage({ eleve: {} }), casUsage({ eleve: {} }), casUsage({ eleve: {} }), casUsage({ eleve: {} }), casUsage({ eleve: {} }), casUsage({ eleve: {} })),
    controleurParcours: new ControleurParcoursEleves(casUsage({ parcours: {} }), casUsage([]), casUsage([]), casUsage({ parcours: {} })),
    controleurOrganisation: new ControleurScolariteOrganisation(casUsage({ donnees: [], total: 0, page: 1, taillePage: 25 }), casOrganisation, casUsage({ idOrganisation: 'org' }), casUsage([])),
  }));

  const reponse = await app.inject({
    method: 'GET',
    url: '/api/organisations/org-1/scolarite/inscriptions?idAnneeScolaire=annee-2026',
    headers: {
      'x-organisation-id': 'org-1',
      'x-tenant-id': 'ecole-1',
    },
  });

  assert.equal(reponse.statusCode, 200);
  assert.deepEqual(chargeUtile, {
    idOrganisation: 'org-1',
    idEcole: 'ecole-1',
    idUtilisateur: 'user-1',
    idempotencyKey: undefined,
    page: undefined,
    taillePage: undefined,
    idAnneeScolaire: 'annee-2026',
  });
  await app.close();
});

test('API GET /api/organisations/:idOrganisation/scolarite/synthese transporte le contexte authentifie', async () => {
  const app = Fastify();
  let chargeUtile: unknown;
  const casOrganisation = {
    executer: async (entree: unknown) => {
      chargeUtile = entree;
      return {
        idOrganisation: 'org-1',
        totalEcoles: 1,
        totalEleves: 2,
        totalElevesActifs: 1,
        totalFamilles: 1,
        totalInscriptionsActives: 1,
      };
    },
  };
  app.addHook('onRequest', async (requete) => {
    (requete as typeof requete & { context: unknown }).context = {
      requestId: 'req-1',
      utilisateurId: 'user-1',
      permissions: [],
      scopes: [],
      restrictions: [],
      titulariats: [],
      modeOffline: false,
    };
  });

  await app.register(creerRoutesScolariteEleves({
    controleurEleves: new ControleurEleves(casUsage({ eleve: {} }), casUsage({ eleve: {} }), casUsage({ eleve: {} }), casUsage({ donnees: [], total: 0, page: 1, taillePage: 25 }), casUsage({ donnees: [], total: 0, page: 1, taillePage: 25 }), casUsage({ eleve: {} }), casUsage({ eleve: {} }), casUsage({ eleve: {} })),
    controleurFamilles: new ControleurFamilles(casUsage({ famille: {} }), casUsage({ famille: {} }), casUsage({ famille: {} }), casUsage({ donnees: [], total: 0, page: 1, taillePage: 25 }), casUsage({ famille: {} }), casUsage({ famille: {} }), casUsage({ famille: {} }), casUsage({ famille: {} }), casUsage({})),
    controleurInscriptions: new ControleurInscriptionsScolaires(casUsage({ inscription: {} }), casUsage({}), casUsage({ inscription: {} }), casUsage({ inscription: {} }), casUsage({ inscription: {} }), casUsage([]), casUsage([])),
    controleurAffectations: new ControleurAffectationsClasses(casUsage({ affectation: {} }), casUsage({ affectation: {} }), casUsage({ affectation: {} }), casUsage({ affectation: {} }), casUsage([]), casUsage(undefined)),
    controleurCycleVie: new ControleurCycleVieEleves(casUsage({ eleve: {} }), casUsage({ eleve: {} }), casUsage({ eleve: {} }), casUsage({ eleve: {} }), casUsage({ eleve: {} }), casUsage({ eleve: {} })),
    controleurParcours: new ControleurParcoursEleves(casUsage({ parcours: {} }), casUsage([]), casUsage([]), casUsage({ parcours: {} })),
    controleurOrganisation: new ControleurScolariteOrganisation(casUsage({ donnees: [], total: 0, page: 1, taillePage: 25 }), casUsage([]), casOrganisation, casUsage([])),
  }));

  const reponse = await app.inject({
    method: 'GET',
    url: '/api/organisations/org-1/scolarite/synthese?idAnneeScolaire=annee-2026',
    headers: {
      'x-organisation-id': 'org-1',
      'x-tenant-id': 'ecole-1',
    },
  });

  assert.equal(reponse.statusCode, 200);
  assert.deepEqual(chargeUtile, {
    idOrganisation: 'org-1',
    idEcole: 'ecole-1',
    idUtilisateur: 'user-1',
    idempotencyKey: undefined,
    page: undefined,
    taillePage: undefined,
    idAnneeScolaire: 'annee-2026',
  });
  await app.close();
});

test('API GET /api/organisations/:idOrganisation/scolarite/alertes transporte le contexte authentifie', async () => {
  const app = Fastify();
  let chargeUtile: unknown;
  const casOrganisation = {
    executer: async (entree: unknown) => {
      chargeUtile = entree;
      return [{ niveau: 'INFO', message: 'ok' }];
    },
  };
  app.addHook('onRequest', async (requete) => {
    (requete as typeof requete & { context: unknown }).context = {
      requestId: 'req-1',
      utilisateurId: 'user-1',
      permissions: [],
      scopes: [],
      restrictions: [],
      titulariats: [],
      modeOffline: false,
    };
  });

  await app.register(creerRoutesScolariteEleves({
    controleurEleves: new ControleurEleves(casUsage({ eleve: {} }), casUsage({ eleve: {} }), casUsage({ eleve: {} }), casUsage({ donnees: [], total: 0, page: 1, taillePage: 25 }), casUsage({ donnees: [], total: 0, page: 1, taillePage: 25 }), casUsage({ eleve: {} }), casUsage({ eleve: {} }), casUsage({ eleve: {} })),
    controleurFamilles: new ControleurFamilles(casUsage({ famille: {} }), casUsage({ famille: {} }), casUsage({ famille: {} }), casUsage({ donnees: [], total: 0, page: 1, taillePage: 25 }), casUsage({ famille: {} }), casUsage({ famille: {} }), casUsage({ famille: {} }), casUsage({ famille: {} }), casUsage({})),
    controleurInscriptions: new ControleurInscriptionsScolaires(casUsage({ inscription: {} }), casUsage({}), casUsage({ inscription: {} }), casUsage({ inscription: {} }), casUsage({ inscription: {} }), casUsage([]), casUsage([])),
    controleurAffectations: new ControleurAffectationsClasses(casUsage({ affectation: {} }), casUsage({ affectation: {} }), casUsage({ affectation: {} }), casUsage({ affectation: {} }), casUsage([]), casUsage(undefined)),
    controleurCycleVie: new ControleurCycleVieEleves(casUsage({ eleve: {} }), casUsage({ eleve: {} }), casUsage({ eleve: {} }), casUsage({ eleve: {} }), casUsage({ eleve: {} }), casUsage({ eleve: {} })),
    controleurParcours: new ControleurParcoursEleves(casUsage({ parcours: {} }), casUsage([]), casUsage([]), casUsage({ parcours: {} })),
    controleurOrganisation: new ControleurScolariteOrganisation(casUsage({ donnees: [], total: 0, page: 1, taillePage: 25 }), casUsage([]), casUsage({ idOrganisation: 'org-1' }), casOrganisation),
  }));

  const reponse = await app.inject({
    method: 'GET',
    url: '/api/organisations/org-1/scolarite/alertes?idAnneeScolaire=annee-2026',
    headers: {
      'x-organisation-id': 'org-1',
      'x-tenant-id': 'ecole-1',
    },
  });

  assert.equal(reponse.statusCode, 200);
  assert.deepEqual(chargeUtile, {
    idOrganisation: 'org-1',
    idEcole: 'ecole-1',
    idUtilisateur: 'user-1',
    idempotencyKey: undefined,
    page: undefined,
    taillePage: undefined,
    idAnneeScolaire: 'annee-2026',
  });
  await app.close();
});
