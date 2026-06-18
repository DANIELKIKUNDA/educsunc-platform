import test from 'node:test';
import assert from 'node:assert/strict';
import Fastify from 'fastify';
import { creerRoutesPaiementsFacturation } from '../../../interfaces/http/routes/paiements-facturation.routes';
import { PaiementTenantContext } from '../../../infrastructure/tenancy/PaiementTenantContext';

function creerControleurAssetsRecusFactice() {
  return {
    async consulterIdentiteEcole() { return { donnee: {} }; },
    async configurerIdentiteEcole() { return { donnee: {} }; },
    async consulterSignature() { return { donnee: {} }; },
    async configurerSignature() { return { donnee: {} }; },
    async telechargerLogo() { return { nomFichier: 'logo.png', mimeType: 'image/png', contenu: Buffer.from('x') }; },
    async telechargerCachet() { return { nomFichier: 'cachet.png', mimeType: 'image/png', contenu: Buffer.from('x') }; },
    async telechargerSignature() { return { nomFichier: 'signature.png', mimeType: 'image/png', contenu: Buffer.from('x') }; },
  };
}

function creerControleurParametresPaiementFactice() {
  return {
    async consulter() { return { donnee: {} }; },
    async configurer() { return { donnee: {} }; },
  };
}

function creerControleurTarificationFactice() {
  return {
    async lister() { return { donnee: [] }; },
    async creer() { return { donnee: {} }; },
    async modifier() { return { donnee: {} }; },
    async desactiver() { return { donnee: {} }; },
  };
}

function creerControleurRapportFinancierFactice() {
  return {
    async consulterJournalier() { return { donnee: {} }; },
    async consulterPaiementsParCaissier() { return { donnee: {} }; },
    async consulterPaiementsParTypeFrais() { return { donnee: {} }; },
    async consulterFondsAnticipes() { return { donnee: {} }; },
  };
}

test("les routes paiements privilegient l'utilisateur authentifie sur le x-user-id fourni", async () => {
  const serveur = Fastify();
  const contexteTenant = new PaiementTenantContext();
  let idCaissierObserve: string | undefined;
  let idOrganisationObservee: string | undefined;

  serveur.addHook('preHandler', async (requete) => {
    requete.context = {
      correlationId: 'corr-1',
      requestId: 'req-1',
      utilisateurId: 'user-authentifie',
      organisationActiveId: 'org-auth',
      ecoleActiveId: 'ecole-auth',
      permissions: [],
      restrictions: [],
      scopes: [],
      titulariats: [],
      modeOffline: false,
    };
  });

  await serveur.register(creerRoutesPaiementsFacturation({
    controleurEnregistrerPaiement: {
      async enregistrer(_corps: unknown, headers: unknown) {
        const donnees = headers as Record<string, unknown>;
        idCaissierObserve = String(donnees['x-user-id']);
        idOrganisationObservee = String(donnees['x-organisation-id']);
        return { donnee: { ok: true } };
      },
    } as never,
    controleurConsulterArrieresEleve: { async consulter() { return { donnee: {} }; } } as never,
    controleurConsulterDetteEleve: { async consulter() { return { donnee: {} }; } } as never,
    controleurConsulterFraisExigibles: { async consulter() { return { donnee: {} }; } } as never,
    controleurAnnulerPaiement: { async annuler() { return { donnee: {} }; } } as never,
    controleurOuvrirCaisse: { async ouvrir() { return { donnee: {} }; } } as never,
    controleurCloturerCaisse: { async cloturer() { return { donnee: {} }; } } as never,
    controleurConsulterCaisseJour: { async consulter() { return { donnee: {} }; } } as never,
    controleurConsulterHistoriquePaiements: { async consulter() { return { donnee: {} }; } } as never,
    controleurConsulterRapportFinancier: creerControleurRapportFinancierFactice() as never,
    controleurRestituerExcedent: { async restituer() { return { donnee: {} }; } } as never,
    controleurAssetsRecus: creerControleurAssetsRecusFactice() as never,
    controleurParametresPaiement: creerControleurParametresPaiementFactice() as never,
    controleurReimprimerRecu: { async consulter() { return { donnee: {} }; } } as never,
    contexteTenant,
  }));

  const reponse = await serveur.inject({
    method: 'POST',
    url: '/api/paiements',
    headers: {
      'x-user-id': 'spoofed-user',
      'x-organisation-id': 'spoofed-org',
      'x-tenant-id': 'spoofed-ecole',
      'idempotency-key': 'cle-1',
    },
    payload: {
      idEleve: 'ELEVE-001',
      typeFraisDeclare: 'FRAIS_SCOLAIRES',
      montant: { montant: 5000, devise: 'CDF' },
      modePaiement: 'CASH',
    },
  });

  assert.equal(reponse.statusCode, 201);
  assert.equal(idCaissierObserve, 'user-authentifie');
  assert.equal(idOrganisationObservee, 'org-auth');

  await serveur.close();
});

test("les routes caisse ouverture privilegient l'utilisateur authentifie sur le x-user-id fourni", async () => {
  const serveur = Fastify();
  const contexteTenant = new PaiementTenantContext();
  let idUtilisateurObserve: string | undefined;
  let idOrganisationObservee: string | undefined;

  serveur.addHook('preHandler', async (requete) => {
    requete.context = {
      correlationId: 'corr-2',
      requestId: 'req-2',
      utilisateurId: 'caissier-authentifie',
      organisationActiveId: 'org-auth-2',
      ecoleActiveId: 'ecole-auth-2',
      permissions: [],
      restrictions: [],
      scopes: [],
      titulariats: [],
      modeOffline: false,
    };
  });

  await serveur.register(creerRoutesPaiementsFacturation({
    controleurEnregistrerPaiement: { async enregistrer() { return { donnee: {} }; } } as never,
    controleurConsulterArrieresEleve: { async consulter() { return { donnee: {} }; } } as never,
    controleurConsulterDetteEleve: { async consulter() { return { donnee: {} }; } } as never,
    controleurConsulterFraisExigibles: { async consulter() { return { donnee: {} }; } } as never,
    controleurAnnulerPaiement: { async annuler() { return { donnee: {} }; } } as never,
    controleurOuvrirCaisse: {
      async ouvrir(_corps: unknown, headers: unknown) {
        const donnees = headers as Record<string, unknown>;
        idUtilisateurObserve = String(donnees['x-user-id']);
        idOrganisationObservee = String(donnees['x-organisation-id']);
        return { donnee: { ok: true } };
      },
    } as never,
    controleurCloturerCaisse: { async cloturer() { return { donnee: {} }; } } as never,
    controleurConsulterCaisseJour: { async consulter() { return { donnee: {} }; } } as never,
    controleurConsulterHistoriquePaiements: { async consulter() { return { donnee: {} }; } } as never,
    controleurRestituerExcedent: { async restituer() { return { donnee: {} }; } } as never,
    controleurAssetsRecus: creerControleurAssetsRecusFactice() as never,
    controleurReimprimerRecu: { async consulter() { return { donnee: {} }; } } as never,
    contexteTenant,
  }));

  const reponse = await serveur.inject({
    method: 'POST',
    url: '/api/caisse/ouverture',
    headers: {
      'x-user-id': 'spoofed-user',
      'x-organisation-id': 'spoofed-org',
      'x-tenant-id': 'spoofed-ecole',
    },
    payload: {
      date: '2026-09-01',
    },
  });

  assert.equal(reponse.statusCode, 201);
  assert.equal(idUtilisateurObserve, 'caissier-authentifie');
  assert.equal(idOrganisationObservee, 'org-auth-2');

  await serveur.close();
});

test("les routes caisse cloture privilegient l'utilisateur authentifie sur le x-user-id fourni", async () => {
  const serveur = Fastify();
  const contexteTenant = new PaiementTenantContext();
  let idUtilisateurObserve: string | undefined;
  let idOrganisationObservee: string | undefined;

  serveur.addHook('preHandler', async (requete) => {
    requete.context = {
      correlationId: 'corr-3',
      requestId: 'req-3',
      utilisateurId: 'caissier-cloture-auth',
      organisationActiveId: 'org-auth-3',
      ecoleActiveId: 'ecole-auth-3',
      permissions: [],
      restrictions: [],
      scopes: [],
      titulariats: [],
      modeOffline: false,
    };
  });

  await serveur.register(creerRoutesPaiementsFacturation({
    controleurEnregistrerPaiement: { async enregistrer() { return { donnee: {} }; } } as never,
    controleurConsulterArrieresEleve: { async consulter() { return { donnee: {} }; } } as never,
    controleurConsulterDetteEleve: { async consulter() { return { donnee: {} }; } } as never,
    controleurConsulterFraisExigibles: { async consulter() { return { donnee: {} }; } } as never,
    controleurAnnulerPaiement: { async annuler() { return { donnee: {} }; } } as never,
    controleurOuvrirCaisse: { async ouvrir() { return { donnee: {} }; } } as never,
    controleurCloturerCaisse: {
      async cloturer(_corps: unknown, headers: unknown) {
        const donnees = headers as Record<string, unknown>;
        idUtilisateurObserve = String(donnees['x-user-id']);
        idOrganisationObservee = String(donnees['x-organisation-id']);
        return { donnee: { ok: true } };
      },
    } as never,
    controleurConsulterCaisseJour: { async consulter() { return { donnee: {} }; } } as never,
    controleurConsulterHistoriquePaiements: { async consulter() { return { donnee: {} }; } } as never,
    controleurRestituerExcedent: { async restituer() { return { donnee: {} }; } } as never,
    controleurAssetsRecus: creerControleurAssetsRecusFactice() as never,
    controleurReimprimerRecu: { async consulter() { return { donnee: {} }; } } as never,
    contexteTenant,
  }));

  const reponse = await serveur.inject({
    method: 'POST',
    url: '/api/caisse/cloture',
    headers: {
      'x-user-id': 'spoofed-user',
      'x-organisation-id': 'spoofed-org',
      'x-tenant-id': 'spoofed-ecole',
    },
    payload: {
      idCaisseJour: 'CAISSE-001',
    },
  });

  assert.equal(reponse.statusCode, 200);
  assert.equal(idUtilisateurObserve, 'caissier-cloture-auth');
  assert.equal(idOrganisationObservee, 'org-auth-3');

  await serveur.close();
});

test("les routes caisse consultation privilegient l'utilisateur authentifie sur le x-user-id fourni", async () => {
  const serveur = Fastify();
  const contexteTenant = new PaiementTenantContext();
  let idUtilisateurObserve: string | undefined;
  let idOrganisationObservee: string | undefined;

  serveur.addHook('preHandler', async (requete) => {
    requete.context = {
      correlationId: 'corr-4',
      requestId: 'req-4',
      utilisateurId: 'caissier-lecture-auth',
      organisationActiveId: 'org-auth-4',
      ecoleActiveId: 'ecole-auth-4',
      permissions: [],
      restrictions: [],
      scopes: [],
      titulariats: [],
      modeOffline: false,
    };
  });

  await serveur.register(creerRoutesPaiementsFacturation({
    controleurEnregistrerPaiement: { async enregistrer() { return { donnee: {} }; } } as never,
    controleurConsulterArrieresEleve: { async consulter() { return { donnee: {} }; } } as never,
    controleurConsulterDetteEleve: { async consulter() { return { donnee: {} }; } } as never,
    controleurConsulterFraisExigibles: { async consulter() { return { donnee: {} }; } } as never,
    controleurAnnulerPaiement: { async annuler() { return { donnee: {} }; } } as never,
    controleurOuvrirCaisse: { async ouvrir() { return { donnee: {} }; } } as never,
    controleurCloturerCaisse: { async cloturer() { return { donnee: {} }; } } as never,
    controleurConsulterCaisseJour: {
      async consulter(_query: unknown, headers: unknown) {
        const donnees = headers as Record<string, unknown>;
        idUtilisateurObserve = String(donnees['x-user-id']);
        idOrganisationObservee = String(donnees['x-organisation-id']);
        return { donnee: { ok: true } };
      },
    } as never,
    controleurConsulterHistoriquePaiements: { async consulter() { return { donnee: {} }; } } as never,
    controleurRestituerExcedent: { async restituer() { return { donnee: {} }; } } as never,
    controleurAssetsRecus: creerControleurAssetsRecusFactice() as never,
    controleurReimprimerRecu: { async consulter() { return { donnee: {} }; } } as never,
    contexteTenant,
  }));

  const reponse = await serveur.inject({
    method: 'GET',
    url: '/api/caisse/jour?date=2026-09-01',
    headers: {
      'x-user-id': 'spoofed-user',
      'x-organisation-id': 'spoofed-org',
      'x-tenant-id': 'spoofed-ecole',
    },
  });

  assert.equal(reponse.statusCode, 200);
  assert.equal(idUtilisateurObserve, 'caissier-lecture-auth');
  assert.equal(idOrganisationObservee, 'org-auth-4');

  await serveur.close();
});

test("les routes historique paiements privilegient l'utilisateur authentifie sur le x-user-id fourni", async () => {
  const serveur = Fastify();
  const contexteTenant = new PaiementTenantContext();
  let idUtilisateurObserve: string | undefined;
  let idOrganisationObservee: string | undefined;

  serveur.addHook('preHandler', async (requete) => {
    requete.context = {
      correlationId: 'corr-5',
      requestId: 'req-5',
      utilisateurId: 'lecteur-historique-auth',
      organisationActiveId: 'org-auth-5',
      ecoleActiveId: 'ecole-auth-5',
      permissions: [],
      restrictions: [],
      scopes: [],
      titulariats: [],
      modeOffline: false,
    };
  });

  await serveur.register(creerRoutesPaiementsFacturation({
    controleurEnregistrerPaiement: { async enregistrer() { return { donnee: {} }; } } as never,
    controleurConsulterArrieresEleve: { async consulter() { return { donnee: {} }; } } as never,
    controleurConsulterDetteEleve: { async consulter() { return { donnee: {} }; } } as never,
    controleurConsulterFraisExigibles: { async consulter() { return { donnee: {} }; } } as never,
    controleurAnnulerPaiement: { async annuler() { return { donnee: {} }; } } as never,
    controleurOuvrirCaisse: { async ouvrir() { return { donnee: {} }; } } as never,
    controleurCloturerCaisse: { async cloturer() { return { donnee: {} }; } } as never,
    controleurConsulterCaisseJour: { async consulter() { return { donnee: {} }; } } as never,
    controleurConsulterHistoriquePaiements: {
      async consulter(_params: unknown, headers: unknown) {
        const donnees = headers as Record<string, unknown>;
        idUtilisateurObserve = String(donnees['x-user-id']);
        idOrganisationObservee = String(donnees['x-organisation-id']);
        return { donnee: { ok: true } };
      },
    } as never,
    controleurRestituerExcedent: { async restituer() { return { donnee: {} }; } } as never,
    controleurAssetsRecus: creerControleurAssetsRecusFactice() as never,
    controleurReimprimerRecu: { async consulter() { return { donnee: {} }; } } as never,
    contexteTenant,
  }));

  const reponse = await serveur.inject({
    method: 'GET',
    url: '/api/eleves/ELEVE-001/paiements',
    headers: {
      'x-user-id': 'spoofed-user',
      'x-organisation-id': 'spoofed-org',
      'x-tenant-id': 'spoofed-ecole',
    },
  });

  assert.equal(reponse.statusCode, 200);
  assert.equal(idUtilisateurObserve, 'lecteur-historique-auth');
  assert.equal(idOrganisationObservee, 'org-auth-5');

  await serveur.close();
});

test("les routes rapport financier privilegient l'utilisateur authentifie sur le x-user-id fourni", async () => {
  const serveur = Fastify();
  const contexteTenant = new PaiementTenantContext();
  let idUtilisateurObserve: string | undefined;
  let idOrganisationObservee: string | undefined;

  serveur.addHook('preHandler', async (requete) => {
    requete.context = {
      correlationId: 'corr-5-rapport',
      requestId: 'req-5-rapport',
      utilisateurId: 'lecteur-rapport-auth',
      organisationActiveId: 'org-auth-5-rapport',
      ecoleActiveId: 'ecole-auth-5-rapport',
      permissions: [],
      restrictions: [],
      scopes: [],
      titulariats: [],
      modeOffline: false,
    };
  });

  await serveur.register(creerRoutesPaiementsFacturation({
    controleurEnregistrerPaiement: { async enregistrer() { return { donnee: {} }; } } as never,
    controleurConsulterArrieresEleve: { async consulter() { return { donnee: {} }; } } as never,
    controleurConsulterDetteEleve: { async consulter() { return { donnee: {} }; } } as never,
    controleurConsulterFraisExigibles: { async consulter() { return { donnee: {} }; } } as never,
    controleurAnnulerPaiement: { async annuler() { return { donnee: {} }; } } as never,
    controleurOuvrirCaisse: { async ouvrir() { return { donnee: {} }; } } as never,
    controleurCloturerCaisse: { async cloturer() { return { donnee: {} }; } } as never,
    controleurConsulterCaisseJour: { async consulter() { return { donnee: {} }; } } as never,
    controleurConsulterHistoriquePaiements: { async consulter() { return { donnee: {} }; } } as never,
    controleurConsulterRapportFinancier: {
      async consulterJournalier(_query: unknown, headers: unknown) {
        const donnees = headers as Record<string, unknown>;
        idUtilisateurObserve = String(donnees['x-user-id']);
        idOrganisationObservee = String(donnees['x-organisation-id']);
        return { donnee: { ok: true } };
      },
    } as never,
    controleurRestituerExcedent: { async restituer() { return { donnee: {} }; } } as never,
    controleurAssetsRecus: creerControleurAssetsRecusFactice() as never,
    controleurReimprimerRecu: { async consulter() { return { donnee: {} }; } } as never,
    contexteTenant,
  }));

  const reponse = await serveur.inject({
    method: 'GET',
    url: '/api/rapports-financiers/journalier?date=2026-09-01',
    headers: {
      'x-user-id': 'spoofed-user',
      'x-organisation-id': 'spoofed-org',
      'x-tenant-id': 'spoofed-ecole',
    },
  });

  assert.equal(reponse.statusCode, 200);
  assert.equal(idUtilisateurObserve, 'lecteur-rapport-auth');
  assert.equal(idOrganisationObservee, 'org-auth-5-rapport');

  await serveur.close();
});

test("les routes paiements par caissier privilegient l'utilisateur authentifie sur le x-user-id fourni", async () => {
  const serveur = Fastify();
  const contexteTenant = new PaiementTenantContext();
  let idUtilisateurObserve: string | undefined;
  let idOrganisationObservee: string | undefined;

  serveur.addHook('preHandler', async (requete) => {
    requete.context = {
      correlationId: 'corr-5-caissier',
      requestId: 'req-5-caissier',
      utilisateurId: 'lecteur-caissier-auth',
      organisationActiveId: 'org-auth-5-caissier',
      ecoleActiveId: 'ecole-auth-5-caissier',
      permissions: [],
      restrictions: [],
      scopes: [],
      titulariats: [],
      modeOffline: false,
    };
  });

  await serveur.register(creerRoutesPaiementsFacturation({
    controleurEnregistrerPaiement: { async enregistrer() { return { donnee: {} }; } } as never,
    controleurConsulterArrieresEleve: { async consulter() { return { donnee: {} }; } } as never,
    controleurConsulterDetteEleve: { async consulter() { return { donnee: {} }; } } as never,
    controleurConsulterFraisExigibles: { async consulter() { return { donnee: {} }; } } as never,
    controleurAnnulerPaiement: { async annuler() { return { donnee: {} }; } } as never,
    controleurOuvrirCaisse: { async ouvrir() { return { donnee: {} }; } } as never,
    controleurCloturerCaisse: { async cloturer() { return { donnee: {} }; } } as never,
    controleurConsulterCaisseJour: { async consulter() { return { donnee: {} }; } } as never,
    controleurConsulterHistoriquePaiements: { async consulter() { return { donnee: {} }; } } as never,
    controleurConsulterRapportFinancier: {
      async consulterJournalier() { return { donnee: {} }; },
      async consulterPaiementsParCaissier(_query: unknown, headers: unknown) {
        const donnees = headers as Record<string, unknown>;
        idUtilisateurObserve = String(donnees['x-user-id']);
        idOrganisationObservee = String(donnees['x-organisation-id']);
        return { donnee: { ok: true } };
      },
    } as never,
    controleurRestituerExcedent: { async restituer() { return { donnee: {} }; } } as never,
    controleurAssetsRecus: creerControleurAssetsRecusFactice() as never,
    controleurReimprimerRecu: { async consulter() { return { donnee: {} }; } } as never,
    contexteTenant,
  }));

  const reponse = await serveur.inject({
    method: 'GET',
    url: '/api/rapports-financiers/paiements-par-caissier?dateDebut=2026-09-01&dateFin=2026-09-30',
    headers: {
      'x-user-id': 'spoofed-user',
      'x-organisation-id': 'spoofed-org',
      'x-tenant-id': 'spoofed-ecole',
    },
  });

  assert.equal(reponse.statusCode, 200);
  assert.equal(idUtilisateurObserve, 'lecteur-caissier-auth');
  assert.equal(idOrganisationObservee, 'org-auth-5-caissier');

  await serveur.close();
});

test("les routes paiements par type de frais privilegient l'utilisateur authentifie sur le x-user-id fourni", async () => {
  const serveur = Fastify();
  const contexteTenant = new PaiementTenantContext();
  let idUtilisateurObserve: string | undefined;

  serveur.addHook('preHandler', async (requete) => {
    requete.context = {
      correlationId: 'corr-5-type',
      requestId: 'req-5-type',
      utilisateurId: 'lecteur-type-auth',
      organisationActiveId: 'org-auth-5-type',
      ecoleActiveId: 'ecole-auth-5-type',
      permissions: [],
      restrictions: [],
      scopes: [],
      titulariats: [],
      modeOffline: false,
    };
  });

  await serveur.register(creerRoutesPaiementsFacturation({
    controleurEnregistrerPaiement: { async enregistrer() { return { donnee: {} }; } } as never,
    controleurConsulterArrieresEleve: { async consulter() { return { donnee: {} }; } } as never,
    controleurConsulterDetteEleve: { async consulter() { return { donnee: {} }; } } as never,
    controleurConsulterFraisExigibles: { async consulter() { return { donnee: {} }; } } as never,
    controleurAnnulerPaiement: { async annuler() { return { donnee: {} }; } } as never,
    controleurOuvrirCaisse: { async ouvrir() { return { donnee: {} }; } } as never,
    controleurCloturerCaisse: { async cloturer() { return { donnee: {} }; } } as never,
    controleurConsulterCaisseJour: { async consulter() { return { donnee: {} }; } } as never,
    controleurConsulterHistoriquePaiements: { async consulter() { return { donnee: {} }; } } as never,
    controleurConsulterRapportFinancier: {
      async consulterJournalier() { return { donnee: {} }; },
      async consulterPaiementsParCaissier() { return { donnee: {} }; },
      async consulterPaiementsParTypeFrais(_query: unknown, headers: unknown) {
        idUtilisateurObserve = String((headers as Record<string, unknown>)['x-user-id']);
        return { donnee: { ok: true } };
      },
    } as never,
    controleurRestituerExcedent: { async restituer() { return { donnee: {} }; } } as never,
    controleurAssetsRecus: creerControleurAssetsRecusFactice() as never,
    controleurReimprimerRecu: { async consulter() { return { donnee: {} }; } } as never,
    contexteTenant,
  }));

  const reponse = await serveur.inject({
    method: 'GET',
    url: '/api/rapports-financiers/paiements-par-type-frais',
    headers: {
      'x-user-id': 'spoofed-user',
      'x-organisation-id': 'spoofed-org',
      'x-tenant-id': 'spoofed-ecole',
    },
  });

  assert.equal(reponse.statusCode, 200);
  assert.equal(idUtilisateurObserve, 'lecteur-type-auth');

  await serveur.close();
});

test("les routes fonds anticipes privilegient l'utilisateur authentifie sur le x-user-id fourni", async () => {
  const serveur = Fastify();
  const contexteTenant = new PaiementTenantContext();
  let idUtilisateurObserve: string | undefined;

  serveur.addHook('preHandler', async (requete) => {
    requete.context = {
      correlationId: 'corr-5-fonds',
      requestId: 'req-5-fonds',
      utilisateurId: 'lecteur-fonds-auth',
      organisationActiveId: 'org-auth-5-fonds',
      ecoleActiveId: 'ecole-auth-5-fonds',
      permissions: [],
      restrictions: [],
      scopes: [],
      titulariats: [],
      modeOffline: false,
    };
  });

  await serveur.register(creerRoutesPaiementsFacturation({
    controleurEnregistrerPaiement: { async enregistrer() { return { donnee: {} }; } } as never,
    controleurConsulterArrieresEleve: { async consulter() { return { donnee: {} }; } } as never,
    controleurConsulterDetteEleve: { async consulter() { return { donnee: {} }; } } as never,
    controleurConsulterFraisExigibles: { async consulter() { return { donnee: {} }; } } as never,
    controleurAnnulerPaiement: { async annuler() { return { donnee: {} }; } } as never,
    controleurOuvrirCaisse: { async ouvrir() { return { donnee: {} }; } } as never,
    controleurCloturerCaisse: { async cloturer() { return { donnee: {} }; } } as never,
    controleurConsulterCaisseJour: { async consulter() { return { donnee: {} }; } } as never,
    controleurConsulterHistoriquePaiements: { async consulter() { return { donnee: {} }; } } as never,
    controleurConsulterRapportFinancier: {
      async consulterJournalier() { return { donnee: {} }; },
      async consulterPaiementsParCaissier() { return { donnee: {} }; },
      async consulterPaiementsParTypeFrais() { return { donnee: {} }; },
      async consulterFondsAnticipes(_query: unknown, headers: unknown) {
        idUtilisateurObserve = String((headers as Record<string, unknown>)['x-user-id']);
        return { donnee: { ok: true } };
      },
    } as never,
    controleurRestituerExcedent: { async restituer() { return { donnee: {} }; } } as never,
    controleurAssetsRecus: creerControleurAssetsRecusFactice() as never,
    controleurReimprimerRecu: { async consulter() { return { donnee: {} }; } } as never,
    contexteTenant,
  }));

  const reponse = await serveur.inject({
    method: 'GET',
    url: '/api/rapports-financiers/fonds-anticipes?dateDebut=2026-09-01&dateFin=2026-09-30',
    headers: {
      'x-user-id': 'spoofed-user',
      'x-organisation-id': 'spoofed-org',
      'x-tenant-id': 'spoofed-ecole',
    },
  });

  assert.equal(reponse.statusCode, 200);
  assert.equal(idUtilisateurObserve, 'lecteur-fonds-auth');

  await serveur.close();
});

test("les routes annulation paiement privilegient l'utilisateur authentifie sur le x-user-id fourni", async () => {
  const serveur = Fastify();
  const contexteTenant = new PaiementTenantContext();
  let idUtilisateurObserve: string | undefined;
  let idOrganisationObservee: string | undefined;

  serveur.addHook('preHandler', async (requete) => {
    requete.context = {
      correlationId: 'corr-5b',
      requestId: 'req-5b',
      utilisateurId: 'annulateur-auth',
      organisationActiveId: 'org-auth-5b',
      ecoleActiveId: 'ecole-auth-5b',
      permissions: [],
      restrictions: [],
      scopes: [],
      titulariats: [],
      modeOffline: false,
    };
  });

  await serveur.register(creerRoutesPaiementsFacturation({
    controleurEnregistrerPaiement: { async enregistrer() { return { donnee: {} }; } } as never,
    controleurConsulterArrieresEleve: { async consulter() { return { donnee: {} }; } } as never,
    controleurConsulterDetteEleve: { async consulter() { return { donnee: {} }; } } as never,
    controleurConsulterFraisExigibles: { async consulter() { return { donnee: {} }; } } as never,
    controleurAnnulerPaiement: {
      async annuler(_params: unknown, _corps: unknown, headers: unknown) {
        const donnees = headers as Record<string, unknown>;
        idUtilisateurObserve = String(donnees['x-user-id']);
        idOrganisationObservee = String(donnees['x-organisation-id']);
        return { donnee: { ok: true } };
      },
    } as never,
    controleurOuvrirCaisse: { async ouvrir() { return { donnee: {} }; } } as never,
    controleurCloturerCaisse: { async cloturer() { return { donnee: {} }; } } as never,
    controleurConsulterCaisseJour: { async consulter() { return { donnee: {} }; } } as never,
    controleurConsulterHistoriquePaiements: { async consulter() { return { donnee: {} }; } } as never,
    controleurRestituerExcedent: { async restituer() { return { donnee: {} }; } } as never,
    controleurAssetsRecus: creerControleurAssetsRecusFactice() as never,
    controleurReimprimerRecu: { async consulter() { return { donnee: {} }; } } as never,
    contexteTenant,
  }));

  const reponse = await serveur.inject({
    method: 'POST',
    url: '/api/paiements/PAY-001/annulation',
    headers: {
      'x-user-id': 'spoofed-user',
      'x-organisation-id': 'spoofed-org',
      'x-tenant-id': 'spoofed-ecole',
    },
    payload: {
      raison: 'Erreur de saisie',
    },
  });

  assert.equal(reponse.statusCode, 200);
  assert.equal(idUtilisateurObserve, 'annulateur-auth');
  assert.equal(idOrganisationObservee, 'org-auth-5b');

  await serveur.close();
});

test("les routes restitution paiement privilegient l'utilisateur authentifie sur le x-user-id fourni", async () => {
  const serveur = Fastify();
  const contexteTenant = new PaiementTenantContext();
  let idUtilisateurObserve: string | undefined;
  let idOrganisationObservee: string | undefined;

  serveur.addHook('preHandler', async (requete) => {
    requete.context = {
      correlationId: 'corr-5c',
      requestId: 'req-5c',
      utilisateurId: 'restitueur-auth',
      organisationActiveId: 'org-auth-5c',
      ecoleActiveId: 'ecole-auth-5c',
      permissions: [],
      restrictions: [],
      scopes: [],
      titulariats: [],
      modeOffline: false,
    };
  });

  await serveur.register(creerRoutesPaiementsFacturation({
    controleurEnregistrerPaiement: { async enregistrer() { return { donnee: {} }; } } as never,
    controleurConsulterArrieresEleve: { async consulter() { return { donnee: {} }; } } as never,
    controleurConsulterDetteEleve: { async consulter() { return { donnee: {} }; } } as never,
    controleurConsulterFraisExigibles: { async consulter() { return { donnee: {} }; } } as never,
    controleurAnnulerPaiement: { async annuler() { return { donnee: {} }; } } as never,
    controleurOuvrirCaisse: { async ouvrir() { return { donnee: {} }; } } as never,
    controleurCloturerCaisse: { async cloturer() { return { donnee: {} }; } } as never,
    controleurConsulterCaisseJour: { async consulter() { return { donnee: {} }; } } as never,
    controleurConsulterHistoriquePaiements: { async consulter() { return { donnee: {} }; } } as never,
    controleurRestituerExcedent: {
      async restituer(_corps: unknown, headers: unknown) {
        const donnees = headers as Record<string, unknown>;
        idUtilisateurObserve = String(donnees['x-user-id']);
        idOrganisationObservee = String(donnees['x-organisation-id']);
        return { donnee: { ok: true } };
      },
    } as never,
    controleurAssetsRecus: creerControleurAssetsRecusFactice() as never,
    controleurReimprimerRecu: { async consulter() { return { donnee: {} }; } } as never,
    contexteTenant,
  }));

  const reponse = await serveur.inject({
    method: 'POST',
    url: '/api/paiements/restitution',
    headers: {
      'x-user-id': 'spoofed-user',
      'x-organisation-id': 'spoofed-org',
      'x-tenant-id': 'spoofed-ecole',
    },
    payload: {
      idPaiement: 'PAY-001',
      idEleve: 'ELEVE-001',
    },
  });

  assert.equal(reponse.statusCode, 201);
  assert.equal(idUtilisateurObserve, 'restitueur-auth');
  assert.equal(idOrganisationObservee, 'org-auth-5c');

  await serveur.close();
});

test("les routes dette eleve privilegient l'utilisateur authentifie sur le x-user-id fourni", async () => {
  const serveur = Fastify();
  const contexteTenant = new PaiementTenantContext();
  let idUtilisateurObserve: string | undefined;
  let idOrganisationObservee: string | undefined;

  serveur.addHook('preHandler', async (requete) => {
    requete.context = {
      correlationId: 'corr-6',
      requestId: 'req-6',
      utilisateurId: 'lecteur-dette-auth',
      organisationActiveId: 'org-auth-6',
      ecoleActiveId: 'ecole-auth-6',
      permissions: [],
      restrictions: [],
      scopes: [],
      titulariats: [],
      modeOffline: false,
    };
  });

  await serveur.register(creerRoutesPaiementsFacturation({
    controleurEnregistrerPaiement: { async enregistrer() { return { donnee: {} }; } } as never,
    controleurConsulterArrieresEleve: { async consulter() { return { donnee: {} }; } } as never,
    controleurConsulterDetteEleve: {
      async consulter(_params: unknown, headers: unknown) {
        const donnees = headers as Record<string, unknown>;
        idUtilisateurObserve = String(donnees['x-user-id']);
        idOrganisationObservee = String(donnees['x-organisation-id']);
        return { donnee: { ok: true } };
      },
    } as never,
    controleurConsulterFraisExigibles: { async consulter() { return { donnee: {} }; } } as never,
    controleurAnnulerPaiement: { async annuler() { return { donnee: {} }; } } as never,
    controleurOuvrirCaisse: { async ouvrir() { return { donnee: {} }; } } as never,
    controleurCloturerCaisse: { async cloturer() { return { donnee: {} }; } } as never,
    controleurConsulterCaisseJour: { async consulter() { return { donnee: {} }; } } as never,
    controleurConsulterHistoriquePaiements: { async consulter() { return { donnee: {} }; } } as never,
    controleurRestituerExcedent: { async restituer() { return { donnee: {} }; } } as never,
    controleurAssetsRecus: creerControleurAssetsRecusFactice() as never,
    controleurReimprimerRecu: { async consulter() { return { donnee: {} }; } } as never,
    contexteTenant,
  }));

  const reponse = await serveur.inject({
    method: 'GET',
    url: '/api/eleves/ELEVE-001/dette',
    headers: {
      'x-user-id': 'spoofed-user',
      'x-organisation-id': 'spoofed-org',
      'x-tenant-id': 'spoofed-ecole',
    },
  });

  assert.equal(reponse.statusCode, 200);
  assert.equal(idUtilisateurObserve, 'lecteur-dette-auth');
  assert.equal(idOrganisationObservee, 'org-auth-6');

  await serveur.close();
});

test("les routes arrieres eleve privilegient l'utilisateur authentifie sur le x-user-id fourni", async () => {
  const serveur = Fastify();
  const contexteTenant = new PaiementTenantContext();
  let idUtilisateurObserve: string | undefined;
  let idOrganisationObservee: string | undefined;

  serveur.addHook('preHandler', async (requete) => {
    requete.context = {
      correlationId: 'corr-6b',
      requestId: 'req-6b',
      utilisateurId: 'lecteur-arrieres-auth',
      organisationActiveId: 'org-auth-6b',
      ecoleActiveId: 'ecole-auth-6b',
      permissions: [],
      restrictions: [],
      scopes: [],
      titulariats: [],
      modeOffline: false,
    };
  });

  await serveur.register(creerRoutesPaiementsFacturation({
    controleurEnregistrerPaiement: { async enregistrer() { return { donnee: {} }; } } as never,
    controleurConsulterArrieresEleve: {
      async consulter(_params: unknown, headers: unknown) {
        const donnees = headers as Record<string, unknown>;
        idUtilisateurObserve = String(donnees['x-user-id']);
        idOrganisationObservee = String(donnees['x-organisation-id']);
        return { donnee: { ok: true } };
      },
    } as never,
    controleurConsulterDetteEleve: { async consulter() { return { donnee: {} }; } } as never,
    controleurConsulterFraisExigibles: { async consulter() { return { donnee: {} }; } } as never,
    controleurAnnulerPaiement: { async annuler() { return { donnee: {} }; } } as never,
    controleurOuvrirCaisse: { async ouvrir() { return { donnee: {} }; } } as never,
    controleurCloturerCaisse: { async cloturer() { return { donnee: {} }; } } as never,
    controleurConsulterCaisseJour: { async consulter() { return { donnee: {} }; } } as never,
    controleurConsulterHistoriquePaiements: { async consulter() { return { donnee: {} }; } } as never,
    controleurRestituerExcedent: { async restituer() { return { donnee: {} }; } } as never,
    controleurAssetsRecus: creerControleurAssetsRecusFactice() as never,
    controleurReimprimerRecu: { async consulter() { return { donnee: {} }; } } as never,
    contexteTenant,
  }));

  const reponse = await serveur.inject({
    method: 'GET',
    url: '/api/eleves/ELEVE-001/arrieres',
    headers: {
      'x-user-id': 'spoofed-user',
      'x-organisation-id': 'spoofed-org',
      'x-tenant-id': 'spoofed-ecole',
    },
  });

  assert.equal(reponse.statusCode, 200);
  assert.equal(idUtilisateurObserve, 'lecteur-arrieres-auth');
  assert.equal(idOrganisationObservee, 'org-auth-6b');

  await serveur.close();
});

test("les routes frais exigibles privilegient l'utilisateur authentifie sur le x-user-id fourni", async () => {
  const serveur = Fastify();
  const contexteTenant = new PaiementTenantContext();
  let idUtilisateurObserve: string | undefined;
  let idOrganisationObservee: string | undefined;

  serveur.addHook('preHandler', async (requete) => {
    requete.context = {
      correlationId: 'corr-7',
      requestId: 'req-7',
      utilisateurId: 'lecteur-frais-auth',
      organisationActiveId: 'org-auth-7',
      ecoleActiveId: 'ecole-auth-7',
      permissions: [],
      restrictions: [],
      scopes: [],
      titulariats: [],
      modeOffline: false,
    };
  });

  await serveur.register(creerRoutesPaiementsFacturation({
    controleurEnregistrerPaiement: { async enregistrer() { return { donnee: {} }; } } as never,
    controleurConsulterArrieresEleve: { async consulter() { return { donnee: {} }; } } as never,
    controleurConsulterDetteEleve: { async consulter() { return { donnee: {} }; } } as never,
    controleurConsulterFraisExigibles: {
      async consulter(_params: unknown, headers: unknown) {
        const donnees = headers as Record<string, unknown>;
        idUtilisateurObserve = String(donnees['x-user-id']);
        idOrganisationObservee = String(donnees['x-organisation-id']);
        return { donnee: { ok: true } };
      },
    } as never,
    controleurAnnulerPaiement: { async annuler() { return { donnee: {} }; } } as never,
    controleurOuvrirCaisse: { async ouvrir() { return { donnee: {} }; } } as never,
    controleurCloturerCaisse: { async cloturer() { return { donnee: {} }; } } as never,
    controleurConsulterCaisseJour: { async consulter() { return { donnee: {} }; } } as never,
    controleurConsulterHistoriquePaiements: { async consulter() { return { donnee: {} }; } } as never,
    controleurRestituerExcedent: { async restituer() { return { donnee: {} }; } } as never,
    controleurAssetsRecus: creerControleurAssetsRecusFactice() as never,
    controleurReimprimerRecu: { async consulter() { return { donnee: {} }; } } as never,
    contexteTenant,
  }));

  const reponse = await serveur.inject({
    method: 'GET',
    url: '/api/eleves/ELEVE-001/frais-exigibles',
    headers: {
      'x-user-id': 'spoofed-user',
      'x-organisation-id': 'spoofed-org',
      'x-tenant-id': 'spoofed-ecole',
    },
  });

  assert.equal(reponse.statusCode, 200);
  assert.equal(idUtilisateurObserve, 'lecteur-frais-auth');
  assert.equal(idOrganisationObservee, 'org-auth-7');

  await serveur.close();
});

test("les routes recu privilegient l'utilisateur authentifie sur le x-user-id fourni", async () => {
  const serveur = Fastify();
  const contexteTenant = new PaiementTenantContext();
  let idUtilisateurObserve: string | undefined;
  let idOrganisationObservee: string | undefined;

  serveur.addHook('preHandler', async (requete) => {
    requete.context = {
      correlationId: 'corr-8',
      requestId: 'req-8',
      utilisateurId: 'caissier-recu-auth',
      organisationActiveId: 'org-auth-8',
      ecoleActiveId: 'ecole-auth-8',
      permissions: [],
      restrictions: [],
      scopes: [],
      titulariats: [],
      modeOffline: false,
    };
  });

  await serveur.register(creerRoutesPaiementsFacturation({
    controleurEnregistrerPaiement: { async enregistrer() { return { donnee: {} }; } } as never,
    controleurConsulterArrieresEleve: { async consulter() { return { donnee: {} }; } } as never,
    controleurConsulterDetteEleve: { async consulter() { return { donnee: {} }; } } as never,
    controleurConsulterFraisExigibles: { async consulter() { return { donnee: {} }; } } as never,
    controleurAnnulerPaiement: { async annuler() { return { donnee: {} }; } } as never,
    controleurOuvrirCaisse: { async ouvrir() { return { donnee: {} }; } } as never,
    controleurCloturerCaisse: { async cloturer() { return { donnee: {} }; } } as never,
    controleurConsulterCaisseJour: { async consulter() { return { donnee: {} }; } } as never,
    controleurConsulterHistoriquePaiements: { async consulter() { return { donnee: {} }; } } as never,
    controleurRestituerExcedent: { async restituer() { return { donnee: {} }; } } as never,
    controleurAssetsRecus: creerControleurAssetsRecusFactice() as never,
    controleurReimprimerRecu: {
      async consulter(_params: unknown, headers: unknown) {
        const donnees = headers as Record<string, unknown>;
        idUtilisateurObserve = String(donnees['x-user-id']);
        idOrganisationObservee = String(donnees['x-organisation-id']);
        return { donnee: { ok: true } };
      },
    } as never,
    contexteTenant,
  }));

  const reponse = await serveur.inject({
    method: 'GET',
    url: '/api/recus/RECU-001',
    headers: {
      'x-user-id': 'spoofed-user',
      'x-organisation-id': 'spoofed-org',
      'x-tenant-id': 'spoofed-ecole',
    },
  });

  assert.equal(reponse.statusCode, 200);
  assert.equal(idUtilisateurObserve, 'caissier-recu-auth');
  assert.equal(idOrganisationObservee, 'org-auth-8');

  await serveur.close();
});

test("la route PDF du recu privilegie l'utilisateur authentifie et retourne un PDF", async () => {
  const serveur = Fastify();
  const contexteTenant = new PaiementTenantContext();
  let idUtilisateurObserve: string | undefined;
  let idOrganisationObservee: string | undefined;

  serveur.addHook('preHandler', async (requete) => {
    requete.context = {
      correlationId: 'corr-9',
      requestId: 'req-9',
      utilisateurId: 'caissier-recu-pdf-auth',
      organisationActiveId: 'org-auth-9',
      ecoleActiveId: 'ecole-auth-9',
      permissions: [],
      restrictions: [],
      scopes: [],
      titulariats: [],
      modeOffline: false,
    };
  });

  await serveur.register(creerRoutesPaiementsFacturation({
    controleurEnregistrerPaiement: { async enregistrer() { return { donnee: {} }; } } as never,
    controleurConsulterArrieresEleve: { async consulter() { return { donnee: {} }; } } as never,
    controleurConsulterDetteEleve: { async consulter() { return { donnee: {} }; } } as never,
    controleurConsulterFraisExigibles: { async consulter() { return { donnee: {} }; } } as never,
    controleurAnnulerPaiement: { async annuler() { return { donnee: {} }; } } as never,
    controleurOuvrirCaisse: { async ouvrir() { return { donnee: {} }; } } as never,
    controleurCloturerCaisse: { async cloturer() { return { donnee: {} }; } } as never,
    controleurConsulterCaisseJour: { async consulter() { return { donnee: {} }; } } as never,
    controleurConsulterHistoriquePaiements: { async consulter() { return { donnee: {} }; } } as never,
    controleurRestituerExcedent: { async restituer() { return { donnee: {} }; } } as never,
    controleurAssetsRecus: creerControleurAssetsRecusFactice() as never,
    controleurReimprimerRecu: {
      async consulter() { return { donnee: {} }; },
      async telechargerPdf(_params: unknown, headers: unknown) {
        const donnees = headers as Record<string, unknown>;
        idUtilisateurObserve = String(donnees['x-user-id']);
        idOrganisationObservee = String(donnees['x-organisation-id']);
        return {
          nomFichier: 'recu-1.pdf',
          mimeType: 'application/pdf',
          contenu: Buffer.from('%PDF-1.4'),
        };
      },
    } as never,
    contexteTenant,
  }));

  const reponse = await serveur.inject({
    method: 'GET',
    url: '/api/recus/RECU-001/pdf',
    headers: {
      'x-user-id': 'spoofed-user',
      'x-organisation-id': 'spoofed-org',
      'x-tenant-id': 'spoofed-ecole',
    },
  });

  assert.equal(reponse.statusCode, 200);
  assert.equal(reponse.headers['content-type'], 'application/pdf');
  assert.equal(idUtilisateurObserve, 'caissier-recu-pdf-auth');
  assert.equal(idOrganisationObservee, 'org-auth-9');

  await serveur.close();
});

test("la route liste des recus privilegie l'utilisateur authentifie sur le x-user-id fourni", async () => {
  const serveur = Fastify();
  const contexteTenant = new PaiementTenantContext();
  let idUtilisateurObserve: string | undefined;
  let idOrganisationObservee: string | undefined;

  serveur.addHook('preHandler', async (requete) => {
    requete.context = {
      correlationId: 'corr-8b',
      requestId: 'req-8b',
      utilisateurId: 'caissier-recettes-auth',
      organisationActiveId: 'org-auth-8b',
      ecoleActiveId: 'ecole-auth-8b',
      permissions: [],
      restrictions: [],
      scopes: [],
      titulariats: [],
      modeOffline: false,
    };
  });

  await serveur.register(creerRoutesPaiementsFacturation({
    controleurEnregistrerPaiement: { async enregistrer() { return { donnee: {} }; } } as never,
    controleurConsulterArrieresEleve: { async consulter() { return { donnee: {} }; } } as never,
    controleurConsulterDetteEleve: { async consulter() { return { donnee: {} }; } } as never,
    controleurConsulterFraisExigibles: { async consulter() { return { donnee: {} }; } } as never,
    controleurAnnulerPaiement: { async annuler() { return { donnee: {} }; } } as never,
    controleurOuvrirCaisse: { async ouvrir() { return { donnee: {} }; } } as never,
    controleurCloturerCaisse: { async cloturer() { return { donnee: {} }; } } as never,
    controleurConsulterCaisseJour: { async consulter() { return { donnee: {} }; } } as never,
    controleurConsulterHistoriquePaiements: { async consulter() { return { donnee: {} }; } } as never,
    controleurConsulterRecusPaiement: {
      async consulter(_query: unknown, headers: unknown) {
        const donnees = headers as Record<string, unknown>;
        idUtilisateurObserve = String(donnees['x-user-id']);
        idOrganisationObservee = String(donnees['x-organisation-id']);
        return { donnee: { recus: [] } };
      },
    } as never,
    controleurRestituerExcedent: { async restituer() { return { donnee: {} }; } } as never,
    controleurAssetsRecus: creerControleurAssetsRecusFactice() as never,
    controleurReimprimerRecu: { async consulter() { return { donnee: {} }; } } as never,
    contexteTenant,
  }));

  const reponse = await serveur.inject({
    method: 'GET',
    url: '/api/recus?numeroRecu=00025606',
    headers: {
      'x-user-id': 'spoofed-user',
      'x-organisation-id': 'spoofed-org',
      'x-tenant-id': 'spoofed-ecole',
    },
  });

  assert.equal(reponse.statusCode, 200);
  assert.equal(idUtilisateurObserve, 'caissier-recettes-auth');
  assert.equal(idOrganisationObservee, 'org-auth-8b');

  await serveur.close();
});

test("la route administration des assets ecole propage le role actif systeme authentifie", async () => {
  const serveur = Fastify();
  const contexteTenant = new PaiementTenantContext();
  let roleObserve: string | undefined;

  serveur.addHook('preHandler', async (requete) => {
    requete.context = {
      correlationId: 'corr-10',
      requestId: 'req-10',
      utilisateurId: 'admin-systeme-ecole-auth',
      organisationActiveId: 'org-auth-10',
      ecoleActiveId: 'ecole-auth-10',
      roleActif: 'ADMIN_SYSTEME_ECOLE',
      permissions: [],
      restrictions: [],
      scopes: [],
      titulariats: [],
      modeOffline: false,
    };
  });

  await serveur.register(creerRoutesPaiementsFacturation({
    controleurEnregistrerPaiement: { async enregistrer() { return { donnee: {} }; } } as never,
    controleurConsulterArrieresEleve: { async consulter() { return { donnee: {} }; } } as never,
    controleurConsulterDetteEleve: { async consulter() { return { donnee: {} }; } } as never,
    controleurConsulterFraisExigibles: { async consulter() { return { donnee: {} }; } } as never,
    controleurAnnulerPaiement: { async annuler() { return { donnee: {} }; } } as never,
    controleurOuvrirCaisse: { async ouvrir() { return { donnee: {} }; } } as never,
    controleurCloturerCaisse: { async cloturer() { return { donnee: {} }; } } as never,
    controleurConsulterCaisseJour: { async consulter() { return { donnee: {} }; } } as never,
    controleurConsulterHistoriquePaiements: { async consulter() { return { donnee: {} }; } } as never,
    controleurRestituerExcedent: { async restituer() { return { donnee: {} }; } } as never,
    controleurAssetsRecus: {
      async consulterIdentiteEcole() { return { donnee: {} }; },
      async configurerIdentiteEcole(_corps: unknown, headers: unknown) {
        roleObserve = String((headers as Record<string, unknown>)['x-role-actif']);
        return { donnee: { ok: true } };
      },
      async consulterSignature() { return { donnee: {} }; },
      async configurerSignature() { return { donnee: {} }; },
      async telechargerLogo() { return { nomFichier: 'logo.png', mimeType: 'image/png', contenu: Buffer.from('x') }; },
      async telechargerCachet() { return { nomFichier: 'cachet.png', mimeType: 'image/png', contenu: Buffer.from('x') }; },
      async telechargerSignature() { return { nomFichier: 'signature.png', mimeType: 'image/png', contenu: Buffer.from('x') }; },
    } as never,
    controleurReimprimerRecu: { async consulter() { return { donnee: {} }; } } as never,
    contexteTenant,
  }));

  const reponse = await serveur.inject({
    method: 'PUT',
    url: '/api/recus/assets/ecole',
    headers: {
      'x-user-id': 'spoofed-user',
      'x-organisation-id': 'spoofed-org',
      'x-tenant-id': 'spoofed-ecole',
    },
    payload: {},
  });

  assert.equal(reponse.statusCode, 200);
  assert.equal(roleObserve, 'ADMIN_SYSTEME_ECOLE');

  await serveur.close();
});

test("la route parametres paiements propage le role actif systeme authentifie", async () => {
  const serveur = Fastify();
  const contexteTenant = new PaiementTenantContext();
  let roleObserve: string | undefined;

  serveur.addHook('preHandler', async (requete) => {
    requete.context = {
      correlationId: 'corr-10b',
      requestId: 'req-10b',
      utilisateurId: 'admin-systeme-ecole-param-auth',
      organisationActiveId: 'org-auth-10b',
      ecoleActiveId: 'ecole-auth-10b',
      roleActif: 'ADMIN_SYSTEME_ECOLE',
      permissions: [],
      restrictions: [],
      scopes: [],
      titulariats: [],
      modeOffline: false,
    };
  });

  await serveur.register(creerRoutesPaiementsFacturation({
    controleurEnregistrerPaiement: { async enregistrer() { return { donnee: {} }; } } as never,
    controleurConsulterArrieresEleve: { async consulter() { return { donnee: {} }; } } as never,
    controleurConsulterDetteEleve: { async consulter() { return { donnee: {} }; } } as never,
    controleurConsulterFraisExigibles: { async consulter() { return { donnee: {} }; } } as never,
    controleurAnnulerPaiement: { async annuler() { return { donnee: {} }; } } as never,
    controleurOuvrirCaisse: { async ouvrir() { return { donnee: {} }; } } as never,
    controleurCloturerCaisse: { async cloturer() { return { donnee: {} }; } } as never,
    controleurConsulterCaisseJour: { async consulter() { return { donnee: {} }; } } as never,
    controleurConsulterHistoriquePaiements: { async consulter() { return { donnee: {} }; } } as never,
    controleurConsulterRapportFinancier: creerControleurRapportFinancierFactice() as never,
    controleurRestituerExcedent: { async restituer() { return { donnee: {} }; } } as never,
    controleurAssetsRecus: creerControleurAssetsRecusFactice() as never,
    controleurParametresPaiement: {
      async consulter(headers: unknown) {
        roleObserve = String((headers as Record<string, unknown>)['x-role-actif']);
        return { donnee: { ok: true } };
      },
      async configurer() { return { donnee: { ok: true } }; },
    } as never,
    controleurReimprimerRecu: { async consulter() { return { donnee: {} }; } } as never,
    contexteTenant,
  }));

  const reponse = await serveur.inject({
    method: 'GET',
    url: '/api/paiements/parametres',
    headers: {
      'x-user-id': 'spoofed-user',
      'x-organisation-id': 'spoofed-org',
      'x-tenant-id': 'spoofed-ecole',
    },
  });

  assert.equal(reponse.statusCode, 200);
  assert.equal(roleObserve, 'ADMIN_SYSTEME_ECOLE');

  await serveur.close();
});

test("la route tarification propage le role actif systeme authentifie", async () => {
  const serveur = Fastify();
  const contexteTenant = new PaiementTenantContext();
  let roleObserve: string | undefined;

  serveur.addHook('preHandler', async (requete) => {
    requete.context = {
      correlationId: 'corr-10c',
      requestId: 'req-10c',
      utilisateurId: 'admin-systeme-ecole-tarif-auth',
      organisationActiveId: 'org-auth-10c',
      ecoleActiveId: 'ecole-auth-10c',
      roleActif: 'ADMIN_SYSTEME_ECOLE',
      permissions: [],
      restrictions: [],
      scopes: [],
      titulariats: [],
      modeOffline: false,
    };
  });

  await serveur.register(creerRoutesPaiementsFacturation({
    controleurEnregistrerPaiement: { async enregistrer() { return { donnee: {} }; } } as never,
    controleurConsulterArrieresEleve: { async consulter() { return { donnee: {} }; } } as never,
    controleurConsulterDetteEleve: { async consulter() { return { donnee: {} }; } } as never,
    controleurConsulterFraisExigibles: { async consulter() { return { donnee: {} }; } } as never,
    controleurAnnulerPaiement: { async annuler() { return { donnee: {} }; } } as never,
    controleurOuvrirCaisse: { async ouvrir() { return { donnee: {} }; } } as never,
    controleurCloturerCaisse: { async cloturer() { return { donnee: {} }; } } as never,
    controleurConsulterCaisseJour: { async consulter() { return { donnee: {} }; } } as never,
    controleurConsulterHistoriquePaiements: { async consulter() { return { donnee: {} }; } } as never,
    controleurConsulterRapportFinancier: creerControleurRapportFinancierFactice() as never,
    controleurRestituerExcedent: { async restituer() { return { donnee: {} }; } } as never,
    controleurAssetsRecus: creerControleurAssetsRecusFactice() as never,
    controleurTarification: {
      async lister(_query: unknown, headers: unknown) {
        roleObserve = String((headers as Record<string, unknown>)['x-role-actif']);
        return { donnee: [] };
      },
      async creer() { return { donnee: {} }; },
      async modifier() { return { donnee: {} }; },
      async desactiver() { return { donnee: {} }; },
    } as never,
    controleurReimprimerRecu: { async consulter() { return { donnee: {} }; } } as never,
    contexteTenant,
  }));

  const reponse = await serveur.inject({
    method: 'GET',
    url: '/api/tarification/grilles?idAnneeScolaire=AN-001',
    headers: {
      'x-user-id': 'spoofed-user',
      'x-organisation-id': 'spoofed-org',
      'x-tenant-id': 'spoofed-ecole',
    },
  });

  assert.equal(reponse.statusCode, 200);
  assert.equal(roleObserve, 'ADMIN_SYSTEME_ECOLE');

  await serveur.close();
});

test("la route fichier signature retourne bien un contenu binaire", async () => {
  const serveur = Fastify();
  const contexteTenant = new PaiementTenantContext();

  serveur.addHook('preHandler', async (requete) => {
    requete.context = {
      correlationId: 'corr-11',
      requestId: 'req-11',
      utilisateurId: 'caissier-signature-auth',
      organisationActiveId: 'org-auth-11',
      ecoleActiveId: 'ecole-auth-11',
      permissions: [],
      restrictions: [],
      scopes: [],
      titulariats: [],
      modeOffline: false,
    };
  });

  await serveur.register(creerRoutesPaiementsFacturation({
    controleurEnregistrerPaiement: { async enregistrer() { return { donnee: {} }; } } as never,
    controleurConsulterArrieresEleve: { async consulter() { return { donnee: {} }; } } as never,
    controleurConsulterDetteEleve: { async consulter() { return { donnee: {} }; } } as never,
    controleurConsulterFraisExigibles: { async consulter() { return { donnee: {} }; } } as never,
    controleurAnnulerPaiement: { async annuler() { return { donnee: {} }; } } as never,
    controleurOuvrirCaisse: { async ouvrir() { return { donnee: {} }; } } as never,
    controleurCloturerCaisse: { async cloturer() { return { donnee: {} }; } } as never,
    controleurConsulterCaisseJour: { async consulter() { return { donnee: {} }; } } as never,
    controleurConsulterHistoriquePaiements: { async consulter() { return { donnee: {} }; } } as never,
    controleurRestituerExcedent: { async restituer() { return { donnee: {} }; } } as never,
    controleurAssetsRecus: {
      async consulterIdentiteEcole() { return { donnee: {} }; },
      async configurerIdentiteEcole() { return { donnee: {} }; },
      async consulterSignature() { return { donnee: {} }; },
      async configurerSignature() { return { donnee: {} }; },
      async telechargerLogo() { return { nomFichier: 'logo.png', mimeType: 'image/png', contenu: Buffer.from('x') }; },
      async telechargerCachet() { return { nomFichier: 'cachet.png', mimeType: 'image/png', contenu: Buffer.from('x') }; },
      async telechargerSignature() { return { nomFichier: 'signature.png', mimeType: 'image/png', contenu: Buffer.from('sig') }; },
    } as never,
    controleurReimprimerRecu: { async consulter() { return { donnee: {} }; } } as never,
    contexteTenant,
  }));

  const reponse = await serveur.inject({
    method: 'GET',
    url: '/api/recus/assets/signature/fichier',
    headers: {
      'x-user-id': 'spoofed-user',
      'x-organisation-id': 'spoofed-org',
      'x-tenant-id': 'spoofed-ecole',
    },
  });

  assert.equal(reponse.statusCode, 200);
  assert.equal(reponse.headers['content-type'], 'image/png');
  assert.equal(reponse.body, 'sig');

  await serveur.close();
});

test("les routes exoneration privilegient l'utilisateur authentifie sur le x-user-id fourni", async () => {
  const serveur = Fastify();
  const contexteTenant = new PaiementTenantContext();
  let idUtilisateurObserve: string | undefined;
  let idOrganisationObservee: string | undefined;

  serveur.addHook('preHandler', async (requete) => {
    requete.context = {
      correlationId: 'corr-12',
      requestId: 'req-12',
      utilisateurId: 'gestion-exoneration-auth',
      organisationActiveId: 'org-auth-12',
      ecoleActiveId: 'ecole-auth-12',
      roleActif: 'ADMINISTRATEUR_ECOLE',
      permissions: [],
      restrictions: [],
      scopes: [],
      titulariats: [],
      modeOffline: false,
    };
  });

  await serveur.register(creerRoutesPaiementsFacturation({
    controleurEnregistrerPaiement: { async enregistrer() { return { donnee: {} }; } } as never,
    controleurExoneration: {
      async accorder(_corps: unknown, headers: unknown) {
        const donnees = headers as Record<string, unknown>;
        idUtilisateurObserve = String(donnees['x-user-id']);
        idOrganisationObservee = String(donnees['x-organisation-id']);
        return { donnee: { idExoneration: 'EXO-001' } };
      },
      async annuler() { return { donnee: {} }; },
    } as never,
    controleurConsulterArrieresEleve: { async consulter() { return { donnee: {} }; } } as never,
    controleurConsulterDetteEleve: { async consulter() { return { donnee: {} }; } } as never,
    controleurConsulterFraisExigibles: { async consulter() { return { donnee: {} }; } } as never,
    controleurAnnulerPaiement: { async annuler() { return { donnee: {} }; } } as never,
    controleurOuvrirCaisse: { async ouvrir() { return { donnee: {} }; } } as never,
    controleurCloturerCaisse: { async cloturer() { return { donnee: {} }; } } as never,
    controleurConsulterCaisseJour: { async consulter() { return { donnee: {} }; } } as never,
    controleurConsulterHistoriquePaiements: { async consulter() { return { donnee: {} }; } } as never,
    controleurRestituerExcedent: { async restituer() { return { donnee: {} }; } } as never,
    controleurAssetsRecus: creerControleurAssetsRecusFactice() as never,
    controleurReimprimerRecu: { async consulter() { return { donnee: {} }; } } as never,
    contexteTenant,
  }));

  const reponse = await serveur.inject({
    method: 'POST',
    url: '/api/exonerations',
    headers: {
      'x-user-id': 'spoofed-user',
      'x-organisation-id': 'spoofed-org',
      'x-tenant-id': 'spoofed-ecole',
    },
    payload: {
      idEleve: 'ELEVE-001',
      idObligation: 'OBL-001',
      typeExoneration: 'AUTRE',
      montantExonere: { montant: 2000, devise: 'CDF' },
      raison: 'Appui social',
    },
  });

  assert.equal(reponse.statusCode, 201);
  assert.equal(idUtilisateurObserve, 'gestion-exoneration-auth');
  assert.equal(idOrganisationObservee, 'org-auth-12');

  await serveur.close();
});

test("la route exoneration annulation propage le role actif authentifie", async () => {
  const serveur = Fastify();
  const contexteTenant = new PaiementTenantContext();
  let roleObserve: string | undefined;

  serveur.addHook('preHandler', async (requete) => {
    requete.context = {
      correlationId: 'corr-13',
      requestId: 'req-13',
      utilisateurId: 'gestion-exoneration-annulation-auth',
      organisationActiveId: 'org-auth-13',
      ecoleActiveId: 'ecole-auth-13',
      roleActif: 'ADMINISTRATEUR_ECOLE',
      permissions: [],
      restrictions: [],
      scopes: [],
      titulariats: [],
      modeOffline: false,
    };
  });

  await serveur.register(creerRoutesPaiementsFacturation({
    controleurEnregistrerPaiement: { async enregistrer() { return { donnee: {} }; } } as never,
    controleurExoneration: {
      async accorder() { return { donnee: {} }; },
      async annuler(_params: unknown, _corps: unknown, headers: unknown) {
        roleObserve = String((headers as Record<string, unknown>)['x-role-actif']);
        return { donnee: { idExoneration: 'EXO-001', statut: 'ANNULEE' } };
      },
    } as never,
    controleurConsulterArrieresEleve: { async consulter() { return { donnee: {} }; } } as never,
    controleurConsulterDetteEleve: { async consulter() { return { donnee: {} }; } } as never,
    controleurConsulterFraisExigibles: { async consulter() { return { donnee: {} }; } } as never,
    controleurAnnulerPaiement: { async annuler() { return { donnee: {} }; } } as never,
    controleurOuvrirCaisse: { async ouvrir() { return { donnee: {} }; } } as never,
    controleurCloturerCaisse: { async cloturer() { return { donnee: {} }; } } as never,
    controleurConsulterCaisseJour: { async consulter() { return { donnee: {} }; } } as never,
    controleurConsulterHistoriquePaiements: { async consulter() { return { donnee: {} }; } } as never,
    controleurRestituerExcedent: { async restituer() { return { donnee: {} }; } } as never,
    controleurAssetsRecus: creerControleurAssetsRecusFactice() as never,
    controleurReimprimerRecu: { async consulter() { return { donnee: {} }; } } as never,
    contexteTenant,
  }));

  const reponse = await serveur.inject({
    method: 'POST',
    url: '/api/exonerations/EXO-001/annulation',
    headers: {
      'x-user-id': 'spoofed-user',
      'x-organisation-id': 'spoofed-org',
      'x-tenant-id': 'spoofed-ecole',
    },
    payload: {},
  });

  assert.equal(reponse.statusCode, 200);
  assert.equal(roleObserve, 'ADMINISTRATEUR_ECOLE');

  await serveur.close();
});
