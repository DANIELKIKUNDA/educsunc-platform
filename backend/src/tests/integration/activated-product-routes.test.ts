import test from 'node:test';
import assert from 'node:assert/strict';
import Fastify from 'fastify';
import { creerRoutesPaiementsFacturation } from '../../contexts/paiements-facturation/interfaces/http/routes/paiements-facturation.routes';
import { creerHealthBulletinRoutes } from '../../contexts/bulletins-evaluations/interfaces/http/routes/health.routes';
import { PaiementTenantContext } from '../../contexts/paiements-facturation/infrastructure/tenancy/PaiementTenantContext';
import { ContexteTenant } from 'shared/tenancy/TenantContext';

test('la route produit paiements expose la consultation de dette eleve', async () => {
  const serveur = Fastify();
  const contexteTenant = new PaiementTenantContext();

  await serveur.register(creerRoutesPaiementsFacturation({
    controleurEnregistrerPaiement: { async enregistrer() { return { donnee: { idPaiement: 'pay-1' } }; } } as never,
    controleurConsulterArrieresEleve: { async consulter() { return { donnee: { idEleve: 'eleve-1', totalArrieres: { montant: 500, devise: 'CDF' } } }; } } as never,
    controleurConsulterDetteEleve: {
      async consulter() {
        return { donnee: { idEleve: 'eleve-1', soldeDu: 125 } };
      },
    } as never,
    controleurConsulterFraisExigibles: { async consulter() { return { donnee: [] }; } } as never,
    controleurAnnulerPaiement: { async annuler() { return { donnee: { annule: true } }; } } as never,
    controleurOuvrirCaisse: { async ouvrir() { return { donnee: { ouverte: true } }; } } as never,
    controleurCloturerCaisse: { async cloturer() { return { donnee: { cloturee: true } }; } } as never,
    controleurConsulterCaisseJour: { async consulter() { return { donnee: { ouverte: true } }; } } as never,
    controleurConsulterHistoriquePaiements: { async consulter() { return { donnee: [] }; } } as never,
    controleurConsulterRapportFinancier: {
      async consulterJournalier() {
        return { donnee: { periode: '2026-09-01' } };
      },
      async consulterPaiementsParCaissier() {
        return { donnee: { lignes: [] } };
      },
      async consulterPaiementsParTypeFrais() {
        return { donnee: { lignes: [] } };
      },
    } as never,
    controleurRestituerExcedent: { async restituer() { return { donnee: { restitution: true } }; } } as never,
    controleurAssetsRecus: {
      async consulterIdentiteEcole() { return { donnee: {} }; },
      async configurerIdentiteEcole() { return { donnee: {} }; },
      async consulterSignature() { return { donnee: {} }; },
      async configurerSignature() { return { donnee: {} }; },
      async telechargerLogo() { return { nomFichier: 'logo.png', mimeType: 'image/png', contenu: Buffer.from('x') }; },
      async telechargerCachet() { return { nomFichier: 'cachet.png', mimeType: 'image/png', contenu: Buffer.from('x') }; },
      async telechargerSignature() { return { nomFichier: 'signature.png', mimeType: 'image/png', contenu: Buffer.from('x') }; },
    } as never,
    controleurReimprimerRecu: { async consulter() { return { donnee: { idRecu: 'recu-1' } }; } } as never,
    contexteTenant,
  }));

  const reponse = await serveur.inject({
    method: 'GET',
    url: '/api/eleves/eleve-1/dette',
    headers: {
      'x-organisation-id': 'org-1',
      'x-tenant-id': 'ecole-1',
    },
  });

  assert.equal(reponse.statusCode, 200, reponse.body);
  assert.equal(reponse.json().donnee.idEleve, 'eleve-1');

  await serveur.close();
});

test('la route produit paiements expose la lecture paiements par caissier', async () => {
  const serveur = Fastify();
  const contexteTenant = new PaiementTenantContext();

  await serveur.register(creerRoutesPaiementsFacturation({
    controleurEnregistrerPaiement: { async enregistrer() { return { donnee: { idPaiement: 'pay-1' } }; } } as never,
    controleurConsulterArrieresEleve: { async consulter() { return { donnee: { idEleve: 'eleve-1', totalArrieres: { montant: 500, devise: 'CDF' } } }; } } as never,
    controleurConsulterDetteEleve: { async consulter() { return { donnee: { idEleve: 'eleve-1' } }; } } as never,
    controleurConsulterFraisExigibles: { async consulter() { return { donnee: [] }; } } as never,
    controleurAnnulerPaiement: { async annuler() { return { donnee: { annule: true } }; } } as never,
    controleurOuvrirCaisse: { async ouvrir() { return { donnee: { ouverte: true } }; } } as never,
    controleurCloturerCaisse: { async cloturer() { return { donnee: { cloturee: true } }; } } as never,
    controleurConsulterCaisseJour: { async consulter() { return { donnee: { ouverte: true } }; } } as never,
    controleurConsulterHistoriquePaiements: { async consulter() { return { donnee: [] }; } } as never,
    controleurConsulterRapportFinancier: {
      async consulterJournalier() { return { donnee: { periode: '2026-09-01' } }; },
      async consulterPaiementsParCaissier() {
        return { donnee: { idEcole: 'ecole-1', lignes: [{ idCaissier: 'UTIL-1' }] } };
      },
      async consulterPaiementsParTypeFrais() {
        return { donnee: { idEcole: 'ecole-1', lignes: [] } };
      },
    } as never,
    controleurRestituerExcedent: { async restituer() { return { donnee: { restitution: true } }; } } as never,
    controleurAssetsRecus: {
      async consulterIdentiteEcole() { return { donnee: {} }; },
      async configurerIdentiteEcole() { return { donnee: {} }; },
      async consulterSignature() { return { donnee: {} }; },
      async configurerSignature() { return { donnee: {} }; },
      async telechargerLogo() { return { nomFichier: 'logo.png', mimeType: 'image/png', contenu: Buffer.from('x') }; },
      async telechargerCachet() { return { nomFichier: 'cachet.png', mimeType: 'image/png', contenu: Buffer.from('x') }; },
      async telechargerSignature() { return { nomFichier: 'signature.png', mimeType: 'image/png', contenu: Buffer.from('x') }; },
    } as never,
    controleurReimprimerRecu: { async consulter() { return { donnee: { idRecu: 'recu-1' } }; } } as never,
    contexteTenant,
  }));

  const reponse = await serveur.inject({
    method: 'GET',
    url: '/api/rapports-financiers/paiements-par-caissier?dateDebut=2026-09-01&dateFin=2026-09-30',
    headers: {
      'x-organisation-id': 'org-1',
      'x-tenant-id': 'ecole-1',
    },
  });

  assert.equal(reponse.statusCode, 200, reponse.body);
  assert.equal(reponse.json().donnee.idEcole, 'ecole-1');

  await serveur.close();
});

test('la route produit paiements expose la lecture des arrieres eleve', async () => {
  const serveur = Fastify();
  const contexteTenant = new PaiementTenantContext();

  await serveur.register(creerRoutesPaiementsFacturation({
    controleurEnregistrerPaiement: { async enregistrer() { return { donnee: { idPaiement: 'pay-1' } }; } } as never,
    controleurConsulterArrieresEleve: {
      async consulter() {
        return { donnee: { idEleve: 'eleve-1', totalArrieres: { montant: 1500, devise: 'CDF' } } };
      },
    } as never,
    controleurConsulterDetteEleve: { async consulter() { return { donnee: { idEleve: 'eleve-1' } }; } } as never,
    controleurConsulterFraisExigibles: { async consulter() { return { donnee: [] }; } } as never,
    controleurAnnulerPaiement: { async annuler() { return { donnee: { annule: true } }; } } as never,
    controleurOuvrirCaisse: { async ouvrir() { return { donnee: { ouverte: true } }; } } as never,
    controleurCloturerCaisse: { async cloturer() { return { donnee: { cloturee: true } }; } } as never,
    controleurConsulterCaisseJour: { async consulter() { return { donnee: { ouverte: true } }; } } as never,
    controleurConsulterHistoriquePaiements: { async consulter() { return { donnee: [] }; } } as never,
    controleurConsulterRapportFinancier: {
      async consulterJournalier() { return { donnee: { periode: '2026-09-01' } }; },
      async consulterPaiementsParCaissier() { return { donnee: { idEcole: 'ecole-1', lignes: [] } }; },
      async consulterPaiementsParTypeFrais() { return { donnee: { idEcole: 'ecole-1', lignes: [] } }; },
      async consulterFondsAnticipes() { return { donnee: { idEcole: 'ecole-1', totalFondsAnticipes: { montant: 12000, devise: 'CDF' }, lignes: [] } }; },
    } as never,
    controleurRestituerExcedent: { async restituer() { return { donnee: { restitution: true } }; } } as never,
    controleurAssetsRecus: {
      async consulterIdentiteEcole() { return { donnee: {} }; },
      async configurerIdentiteEcole() { return { donnee: {} }; },
      async consulterSignature() { return { donnee: {} }; },
      async configurerSignature() { return { donnee: {} }; },
      async telechargerLogo() { return { nomFichier: 'logo.png', mimeType: 'image/png', contenu: Buffer.from('x') }; },
      async telechargerCachet() { return { nomFichier: 'cachet.png', mimeType: 'image/png', contenu: Buffer.from('x') }; },
      async telechargerSignature() { return { nomFichier: 'signature.png', mimeType: 'image/png', contenu: Buffer.from('x') }; },
    } as never,
    controleurReimprimerRecu: { async consulter() { return { donnee: { idRecu: 'recu-1' } }; } } as never,
    contexteTenant,
  }));

  const reponse = await serveur.inject({
    method: 'GET',
    url: '/api/eleves/eleve-1/arrieres',
    headers: {
      'x-organisation-id': 'org-1',
      'x-tenant-id': 'ecole-1',
    },
  });

  assert.equal(reponse.statusCode, 200, reponse.body);
  assert.equal(reponse.json().donnee.idEleve, 'eleve-1');

  await serveur.close();
});

test('la route produit paiements expose la consultation des recus', async () => {
  const serveur = Fastify();
  const contexteTenant = new PaiementTenantContext();

  await serveur.register(creerRoutesPaiementsFacturation({
    controleurEnregistrerPaiement: { async enregistrer() { return { donnee: { idPaiement: 'pay-1' } }; } } as never,
    controleurConsulterArrieresEleve: {
      async consulter() {
        return { donnee: { idEleve: 'eleve-1', totalArrieres: { montant: 1500, devise: 'CDF' } } };
      },
    } as never,
    controleurConsulterDetteEleve: { async consulter() { return { donnee: { idEleve: 'eleve-1' } }; } } as never,
    controleurConsulterFraisExigibles: { async consulter() { return { donnee: [] }; } } as never,
    controleurAnnulerPaiement: { async annuler() { return { donnee: { annule: true } }; } } as never,
    controleurOuvrirCaisse: { async ouvrir() { return { donnee: { ouverte: true } }; } } as never,
    controleurCloturerCaisse: { async cloturer() { return { donnee: { cloturee: true } }; } } as never,
    controleurConsulterCaisseJour: { async consulter() { return { donnee: { ouverte: true } }; } } as never,
    controleurConsulterHistoriquePaiements: { async consulter() { return { donnee: [] }; } } as never,
    controleurConsulterRecusPaiement: {
      async consulter() {
        return {
          donnee: {
            idEcole: 'ecole-1',
            filtres: { numeroRecu: '00025606' },
            recus: [{ idRecu: 'recu-1', numeroRecu: '00025606' }],
          },
        };
      },
    } as never,
    controleurConsulterRapportFinancier: {
      async consulterJournalier() { return { donnee: { periode: '2026-09-01' } }; },
      async consulterPaiementsParCaissier() { return { donnee: { idEcole: 'ecole-1', lignes: [] } }; },
      async consulterPaiementsParTypeFrais() { return { donnee: { idEcole: 'ecole-1', lignes: [] } }; },
      async consulterFondsAnticipes() { return { donnee: { idEcole: 'ecole-1', lignes: [] } }; },
    } as never,
    controleurRestituerExcedent: { async restituer() { return { donnee: { restitution: true } }; } } as never,
    controleurAssetsRecus: {
      async consulterIdentiteEcole() { return { donnee: {} }; },
      async configurerIdentiteEcole() { return { donnee: {} }; },
      async consulterSignature() { return { donnee: {} }; },
      async configurerSignature() { return { donnee: {} }; },
      async telechargerLogo() { return { nomFichier: 'logo.png', mimeType: 'image/png', contenu: Buffer.from('x') }; },
      async telechargerCachet() { return { nomFichier: 'cachet.png', mimeType: 'image/png', contenu: Buffer.from('x') }; },
      async telechargerSignature() { return { nomFichier: 'signature.png', mimeType: 'image/png', contenu: Buffer.from('x') }; },
    } as never,
    controleurReimprimerRecu: { async consulter() { return { donnee: { idRecu: 'recu-1' } }; } } as never,
    contexteTenant,
  }));

  const reponse = await serveur.inject({
    method: 'GET',
    url: '/api/recus?numeroRecu=00025606',
    headers: {
      'x-organisation-id': 'org-1',
      'x-tenant-id': 'ecole-1',
    },
  });

  assert.equal(reponse.statusCode, 200, reponse.body);
  assert.equal(reponse.json().donnee.idEcole, 'ecole-1');

  await serveur.close();
});

test('la route produit paiements expose la consultation des parametres de paiement ecole', async () => {
  const serveur = Fastify();
  const contexteTenant = new PaiementTenantContext();

  await serveur.register(creerRoutesPaiementsFacturation({
    controleurEnregistrerPaiement: { async enregistrer() { return { donnee: { idPaiement: 'pay-1' } }; } } as never,
    controleurParametresPaiement: {
      async consulter() {
        return {
          donnee: {
            idParametresPaiementEcole: 'PARAM-001',
            idEcole: 'ecole-1',
            modesPaiementAutorises: ['CASH'],
          },
        };
      },
    } as never,
    controleurConsulterArrieresEleve: {
      async consulter() {
        return { donnee: { idEleve: 'eleve-1', totalArrieres: { montant: 1500, devise: 'CDF' } } };
      },
    } as never,
    controleurConsulterDetteEleve: { async consulter() { return { donnee: { idEleve: 'eleve-1' } }; } } as never,
    controleurConsulterFraisExigibles: { async consulter() { return { donnee: [] }; } } as never,
    controleurAnnulerPaiement: { async annuler() { return { donnee: { annule: true } }; } } as never,
    controleurOuvrirCaisse: { async ouvrir() { return { donnee: { ouverte: true } }; } } as never,
    controleurCloturerCaisse: { async cloturer() { return { donnee: { cloturee: true } }; } } as never,
    controleurConsulterCaisseJour: { async consulter() { return { donnee: { ouverte: true } }; } } as never,
    controleurConsulterHistoriquePaiements: { async consulter() { return { donnee: [] }; } } as never,
    controleurConsulterRapportFinancier: {
      async consulterJournalier() { return { donnee: { periode: '2026-09-01' } }; },
      async consulterPaiementsParCaissier() { return { donnee: { idEcole: 'ecole-1', lignes: [] } }; },
      async consulterPaiementsParTypeFrais() { return { donnee: { idEcole: 'ecole-1', lignes: [] } }; },
      async consulterFondsAnticipes() { return { donnee: { idEcole: 'ecole-1', lignes: [] } }; },
    } as never,
    controleurRestituerExcedent: { async restituer() { return { donnee: { restitution: true } }; } } as never,
    controleurAssetsRecus: {
      async consulterIdentiteEcole() { return { donnee: {} }; },
      async configurerIdentiteEcole() { return { donnee: {} }; },
      async consulterSignature() { return { donnee: {} }; },
      async configurerSignature() { return { donnee: {} }; },
      async telechargerLogo() { return { nomFichier: 'logo.png', mimeType: 'image/png', contenu: Buffer.from('x') }; },
      async telechargerCachet() { return { nomFichier: 'cachet.png', mimeType: 'image/png', contenu: Buffer.from('x') }; },
      async telechargerSignature() { return { nomFichier: 'signature.png', mimeType: 'image/png', contenu: Buffer.from('x') }; },
    } as never,
    controleurReimprimerRecu: { async consulter() { return { donnee: { idRecu: 'recu-1' } }; } } as never,
    contexteTenant,
  }));

  const reponse = await serveur.inject({
    method: 'GET',
    url: '/api/paiements/parametres',
    headers: {
      'x-organisation-id': 'org-1',
      'x-tenant-id': 'ecole-1',
      'x-role-actif': 'ADMIN_SYSTEME_ECOLE',
    },
  });

  assert.equal(reponse.statusCode, 200, reponse.body);
  assert.equal(reponse.json().donnee.idParametresPaiementEcole, 'PARAM-001');

  await serveur.close();
});

test('la route produit paiements expose la consultation des grilles de tarification', async () => {
  const serveur = Fastify();
  const contexteTenant = new PaiementTenantContext();

  await serveur.register(creerRoutesPaiementsFacturation({
    controleurEnregistrerPaiement: { async enregistrer() { return { donnee: { idPaiement: 'pay-1' } }; } } as never,
    controleurParametresPaiement: {
      async consulter() {
        return {
          donnee: {
            idParametresPaiementEcole: 'PARAM-001',
            idEcole: 'ecole-1',
          },
        };
      },
    } as never,
    controleurTarification: {
      async lister() {
        return {
          donnee: [{
            idGrilleTarification: 'GRILLE-001',
            idEcole: 'ecole-1',
            idAnneeScolaire: 'AN-001',
            typeFrais: 'FRAIS_SCOLAIRES',
            libelle: 'Frais scolaires',
          }],
        };
      },
      async creer() { return { donnee: {} }; },
      async modifier() { return { donnee: {} }; },
      async desactiver() { return { donnee: {} }; },
    } as never,
    controleurConsulterArrieresEleve: {
      async consulter() {
        return { donnee: { idEleve: 'eleve-1', totalArrieres: { montant: 1500, devise: 'CDF' } } };
      },
    } as never,
    controleurConsulterDetteEleve: { async consulter() { return { donnee: { idEleve: 'eleve-1' } }; } } as never,
    controleurConsulterFraisExigibles: { async consulter() { return { donnee: [] }; } } as never,
    controleurAnnulerPaiement: { async annuler() { return { donnee: { annule: true } }; } } as never,
    controleurOuvrirCaisse: { async ouvrir() { return { donnee: { ouverte: true } }; } } as never,
    controleurCloturerCaisse: { async cloturer() { return { donnee: { cloturee: true } }; } } as never,
    controleurConsulterCaisseJour: { async consulter() { return { donnee: { ouverte: true } }; } } as never,
    controleurConsulterHistoriquePaiements: { async consulter() { return { donnee: [] }; } } as never,
    controleurConsulterRapportFinancier: {
      async consulterJournalier() { return { donnee: { periode: '2026-09-01' } }; },
      async consulterPaiementsParCaissier() { return { donnee: { idEcole: 'ecole-1', lignes: [] } }; },
      async consulterPaiementsParTypeFrais() { return { donnee: { idEcole: 'ecole-1', lignes: [] } }; },
      async consulterFondsAnticipes() { return { donnee: { idEcole: 'ecole-1', lignes: [] } }; },
    } as never,
    controleurRestituerExcedent: { async restituer() { return { donnee: { restitution: true } }; } } as never,
    controleurAssetsRecus: {
      async consulterIdentiteEcole() { return { donnee: {} }; },
      async configurerIdentiteEcole() { return { donnee: {} }; },
      async consulterSignature() { return { donnee: {} }; },
      async configurerSignature() { return { donnee: {} }; },
      async telechargerLogo() { return { nomFichier: 'logo.png', mimeType: 'image/png', contenu: Buffer.from('x') }; },
      async telechargerCachet() { return { nomFichier: 'cachet.png', mimeType: 'image/png', contenu: Buffer.from('x') }; },
      async telechargerSignature() { return { nomFichier: 'signature.png', mimeType: 'image/png', contenu: Buffer.from('x') }; },
    } as never,
    controleurReimprimerRecu: { async consulter() { return { donnee: { idRecu: 'recu-1' } }; } } as never,
    contexteTenant,
  }));

  const reponse = await serveur.inject({
    method: 'GET',
    url: '/api/tarification/grilles?idAnneeScolaire=AN-001',
    headers: {
      'x-organisation-id': 'org-1',
      'x-tenant-id': 'ecole-1',
      'x-role-actif': 'ADMIN_SYSTEME_ECOLE',
    },
  });

  assert.equal(reponse.statusCode, 200, reponse.body);
  assert.equal(reponse.json().donnee[0].idGrilleTarification, 'GRILLE-001');

  await serveur.close();
});

test('la route produit paiements expose la gestion des exonerations', async () => {
  const serveur = Fastify();
  const contexteTenant = new PaiementTenantContext();

  await serveur.register(creerRoutesPaiementsFacturation({
    controleurEnregistrerPaiement: { async enregistrer() { return { donnee: { idPaiement: 'pay-1' } }; } } as never,
    controleurExoneration: {
      async accorder() {
        return {
          donnee: {
            idExoneration: 'EXO-001',
            idObligation: 'OBL-001',
            statut: 'ACCORDEE',
          },
        };
      },
      async annuler() {
        return {
          donnee: {
            idExoneration: 'EXO-001',
            idObligation: 'OBL-001',
            statut: 'ANNULEE',
          },
        };
      },
    } as never,
    controleurParametresPaiement: {
      async consulter() {
        return {
          donnee: {
            idParametresPaiementEcole: 'PARAM-001',
            idEcole: 'ecole-1',
          },
        };
      },
    } as never,
    controleurConsulterArrieresEleve: {
      async consulter() {
        return { donnee: { idEleve: 'eleve-1', totalArrieres: { montant: 1500, devise: 'CDF' } } };
      },
    } as never,
    controleurConsulterDetteEleve: { async consulter() { return { donnee: { idEleve: 'eleve-1' } }; } } as never,
    controleurConsulterFraisExigibles: { async consulter() { return { donnee: [] }; } } as never,
    controleurAnnulerPaiement: { async annuler() { return { donnee: { annule: true } }; } } as never,
    controleurOuvrirCaisse: { async ouvrir() { return { donnee: { ouverte: true } }; } } as never,
    controleurCloturerCaisse: { async cloturer() { return { donnee: { cloturee: true } }; } } as never,
    controleurConsulterCaisseJour: { async consulter() { return { donnee: { ouverte: true } }; } } as never,
    controleurConsulterHistoriquePaiements: { async consulter() { return { donnee: [] }; } } as never,
    controleurConsulterRapportFinancier: {
      async consulterJournalier() { return { donnee: { periode: '2026-09-01' } }; },
      async consulterPaiementsParCaissier() { return { donnee: { idEcole: 'ecole-1', lignes: [] } }; },
      async consulterPaiementsParTypeFrais() { return { donnee: { idEcole: 'ecole-1', lignes: [] } }; },
      async consulterFondsAnticipes() { return { donnee: { idEcole: 'ecole-1', lignes: [] } }; },
    } as never,
    controleurRestituerExcedent: { async restituer() { return { donnee: { restitution: true } }; } } as never,
    controleurAssetsRecus: {
      async consulterIdentiteEcole() { return { donnee: {} }; },
      async configurerIdentiteEcole() { return { donnee: {} }; },
      async consulterSignature() { return { donnee: {} }; },
      async configurerSignature() { return { donnee: {} }; },
      async telechargerLogo() { return { nomFichier: 'logo.png', mimeType: 'image/png', contenu: Buffer.from('x') }; },
      async telechargerCachet() { return { nomFichier: 'cachet.png', mimeType: 'image/png', contenu: Buffer.from('x') }; },
      async telechargerSignature() { return { nomFichier: 'signature.png', mimeType: 'image/png', contenu: Buffer.from('x') }; },
    } as never,
    controleurReimprimerRecu: { async consulter() { return { donnee: { idRecu: 'recu-1' } }; } } as never,
    contexteTenant,
  }));

  const reponseAccord = await serveur.inject({
    method: 'POST',
    url: '/api/exonerations',
    headers: {
      'x-organisation-id': 'org-1',
      'x-tenant-id': 'ecole-1',
    },
    payload: {
      idEleve: 'eleve-1',
      idObligation: 'OBL-001',
      typeExoneration: 'AUTRE',
      montantExonere: { montant: 2000, devise: 'CDF' },
      raison: 'Appui social',
    },
  });

  assert.equal(reponseAccord.statusCode, 201, reponseAccord.body);
  assert.equal(reponseAccord.json().donnee.idExoneration, 'EXO-001');

  const reponseAnnulation = await serveur.inject({
    method: 'POST',
    url: '/api/exonerations/EXO-001/annulation',
    headers: {
      'x-organisation-id': 'org-1',
      'x-tenant-id': 'ecole-1',
    },
    payload: {},
  });

  assert.equal(reponseAnnulation.statusCode, 200, reponseAnnulation.body);
  assert.equal(reponseAnnulation.json().donnee.statut, 'ANNULEE');

  await serveur.close();
});

test('la route produit paiements expose la lecture paiements par type de frais', async () => {
  const serveur = Fastify();
  const contexteTenant = new PaiementTenantContext();

  await serveur.register(creerRoutesPaiementsFacturation({
    controleurEnregistrerPaiement: { async enregistrer() { return { donnee: { idPaiement: 'pay-1' } }; } } as never,
    controleurConsulterArrieresEleve: { async consulter() { return { donnee: { idEleve: 'eleve-1', totalArrieres: { montant: 500, devise: 'CDF' } } }; } } as never,
    controleurConsulterDetteEleve: { async consulter() { return { donnee: { idEleve: 'eleve-1' } }; } } as never,
    controleurConsulterFraisExigibles: { async consulter() { return { donnee: [] }; } } as never,
    controleurAnnulerPaiement: { async annuler() { return { donnee: { annule: true } }; } } as never,
    controleurOuvrirCaisse: { async ouvrir() { return { donnee: { ouverte: true } }; } } as never,
    controleurCloturerCaisse: { async cloturer() { return { donnee: { cloturee: true } }; } } as never,
    controleurConsulterCaisseJour: { async consulter() { return { donnee: { ouverte: true } }; } } as never,
    controleurConsulterHistoriquePaiements: { async consulter() { return { donnee: [] }; } } as never,
    controleurConsulterRapportFinancier: {
      async consulterJournalier() { return { donnee: { periode: '2026-09-01' } }; },
      async consulterPaiementsParCaissier() { return { donnee: { idEcole: 'ecole-1', lignes: [] } }; },
      async consulterPaiementsParTypeFrais() {
        return { donnee: { idEcole: 'ecole-1', lignes: [{ typeFrais: 'FRAIS_SCOLAIRES' }] } };
      },
    } as never,
    controleurRestituerExcedent: { async restituer() { return { donnee: { restitution: true } }; } } as never,
    controleurAssetsRecus: {
      async consulterIdentiteEcole() { return { donnee: {} }; },
      async configurerIdentiteEcole() { return { donnee: {} }; },
      async consulterSignature() { return { donnee: {} }; },
      async configurerSignature() { return { donnee: {} }; },
      async telechargerLogo() { return { nomFichier: 'logo.png', mimeType: 'image/png', contenu: Buffer.from('x') }; },
      async telechargerCachet() { return { nomFichier: 'cachet.png', mimeType: 'image/png', contenu: Buffer.from('x') }; },
      async telechargerSignature() { return { nomFichier: 'signature.png', mimeType: 'image/png', contenu: Buffer.from('x') }; },
    } as never,
    controleurReimprimerRecu: { async consulter() { return { donnee: { idRecu: 'recu-1' } }; } } as never,
    contexteTenant,
  }));

  const reponse = await serveur.inject({
    method: 'GET',
    url: '/api/rapports-financiers/paiements-par-type-frais',
    headers: {
      'x-organisation-id': 'org-1',
      'x-tenant-id': 'ecole-1',
    },
  });

  assert.equal(reponse.statusCode, 200, reponse.body);
  assert.equal(reponse.json().donnee.idEcole, 'ecole-1');

  await serveur.close();
});

test('la route produit paiements expose la lecture des fonds anticipes', async () => {
  const serveur = Fastify();
  const contexteTenant = new PaiementTenantContext();

  await serveur.register(creerRoutesPaiementsFacturation({
    controleurEnregistrerPaiement: { async enregistrer() { return { donnee: { idPaiement: 'pay-1' } }; } } as never,
    controleurConsulterArrieresEleve: { async consulter() { return { donnee: { idEleve: 'eleve-1', totalArrieres: { montant: 500, devise: 'CDF' } } }; } } as never,
    controleurConsulterDetteEleve: { async consulter() { return { donnee: { idEleve: 'eleve-1' } }; } } as never,
    controleurConsulterFraisExigibles: { async consulter() { return { donnee: [] }; } } as never,
    controleurAnnulerPaiement: { async annuler() { return { donnee: { annule: true } }; } } as never,
    controleurOuvrirCaisse: { async ouvrir() { return { donnee: { ouverte: true } }; } } as never,
    controleurCloturerCaisse: { async cloturer() { return { donnee: { cloturee: true } }; } } as never,
    controleurConsulterCaisseJour: { async consulter() { return { donnee: { ouverte: true } }; } } as never,
    controleurConsulterHistoriquePaiements: { async consulter() { return { donnee: [] }; } } as never,
    controleurConsulterRapportFinancier: {
      async consulterJournalier() { return { donnee: { periode: '2026-09-01' } }; },
      async consulterPaiementsParCaissier() { return { donnee: { idEcole: 'ecole-1', lignes: [] } }; },
      async consulterPaiementsParTypeFrais() { return { donnee: { idEcole: 'ecole-1', lignes: [] } }; },
      async consulterFondsAnticipes() {
        return { donnee: { idEcole: 'ecole-1', totalFondsAnticipes: { montant: 12000, devise: 'CDF' }, lignes: [] } };
      },
    } as never,
    controleurRestituerExcedent: { async restituer() { return { donnee: { restitution: true } }; } } as never,
    controleurAssetsRecus: {
      async consulterIdentiteEcole() { return { donnee: {} }; },
      async configurerIdentiteEcole() { return { donnee: {} }; },
      async consulterSignature() { return { donnee: {} }; },
      async configurerSignature() { return { donnee: {} }; },
      async telechargerLogo() { return { nomFichier: 'logo.png', mimeType: 'image/png', contenu: Buffer.from('x') }; },
      async telechargerCachet() { return { nomFichier: 'cachet.png', mimeType: 'image/png', contenu: Buffer.from('x') }; },
      async telechargerSignature() { return { nomFichier: 'signature.png', mimeType: 'image/png', contenu: Buffer.from('x') }; },
    } as never,
    controleurReimprimerRecu: { async consulter() { return { donnee: { idRecu: 'recu-1' } }; } } as never,
    contexteTenant,
  }));

  const reponse = await serveur.inject({
    method: 'GET',
    url: '/api/rapports-financiers/fonds-anticipes?dateDebut=2026-09-01&dateFin=2026-09-30',
    headers: {
      'x-organisation-id': 'org-1',
      'x-tenant-id': 'ecole-1',
    },
  });

  assert.equal(reponse.statusCode, 200, reponse.body);
  assert.equal(reponse.json().donnee.idEcole, 'ecole-1');

  await serveur.close();
});

test('la route produit paiements expose le rapport financier journalier', async () => {
  const serveur = Fastify();
  const contexteTenant = new PaiementTenantContext();

  await serveur.register(creerRoutesPaiementsFacturation({
    controleurEnregistrerPaiement: { async enregistrer() { return { donnee: { idPaiement: 'pay-1' } }; } } as never,
    controleurConsulterArrieresEleve: { async consulter() { return { donnee: { idEleve: 'eleve-1', totalArrieres: { montant: 500, devise: 'CDF' } } }; } } as never,
    controleurConsulterDetteEleve: { async consulter() { return { donnee: { idEleve: 'eleve-1' } }; } } as never,
    controleurConsulterFraisExigibles: { async consulter() { return { donnee: [] }; } } as never,
    controleurAnnulerPaiement: { async annuler() { return { donnee: { annule: true } }; } } as never,
    controleurOuvrirCaisse: { async ouvrir() { return { donnee: { ouverte: true } }; } } as never,
    controleurCloturerCaisse: { async cloturer() { return { donnee: { cloturee: true } }; } } as never,
    controleurConsulterCaisseJour: { async consulter() { return { donnee: { ouverte: true } }; } } as never,
    controleurConsulterHistoriquePaiements: { async consulter() { return { donnee: [] }; } } as never,
    controleurConsulterRapportFinancier: {
      async consulterJournalier() {
        return { donnee: { periode: '2026-09-01', totalEncaisse: { montant: 1000, devise: 'CDF' } } };
      },
    } as never,
    controleurRestituerExcedent: { async restituer() { return { donnee: { restitution: true } }; } } as never,
    controleurAssetsRecus: {
      async consulterIdentiteEcole() { return { donnee: {} }; },
      async configurerIdentiteEcole() { return { donnee: {} }; },
      async consulterSignature() { return { donnee: {} }; },
      async configurerSignature() { return { donnee: {} }; },
      async telechargerLogo() { return { nomFichier: 'logo.png', mimeType: 'image/png', contenu: Buffer.from('x') }; },
      async telechargerCachet() { return { nomFichier: 'cachet.png', mimeType: 'image/png', contenu: Buffer.from('x') }; },
      async telechargerSignature() { return { nomFichier: 'signature.png', mimeType: 'image/png', contenu: Buffer.from('x') }; },
    } as never,
    controleurReimprimerRecu: { async consulter() { return { donnee: { idRecu: 'recu-1' } }; } } as never,
    contexteTenant,
  }));

  const reponse = await serveur.inject({
    method: 'GET',
    url: '/api/rapports-financiers/journalier?date=2026-09-01',
    headers: {
      'x-organisation-id': 'org-1',
      'x-tenant-id': 'ecole-1',
    },
  });

  assert.equal(reponse.statusCode, 200, reponse.body);
  assert.equal(reponse.json().donnee.periode, '2026-09-01');

  await serveur.close();
});

test('la route produit bulletins expose la sante de synchronisation', async () => {
  const serveur = Fastify();

  await serveur.register(creerHealthBulletinRoutes({
    healthBulletinController: {
      async consulterSante() {
        return { donnee: { ok: true } };
      },
      async consulterSanteProjections() {
        return { donnee: { projections: true } };
      },
      async consulterSanteSynchronisation() {
        return { donnee: { synchronisation: 'ok' } };
      },
    } as never,
    contexteTenant: new ContexteTenant(),
  } as never));

  const reponse = await serveur.inject({
    method: 'GET',
    url: '/health/sync',
    headers: {
      'x-tenant-id': 'ecole-1',
    },
  });

  assert.equal(reponse.statusCode, 200, reponse.body);
  assert.equal(reponse.json().donnee.synchronisation, 'ok');

  await serveur.close();
});
