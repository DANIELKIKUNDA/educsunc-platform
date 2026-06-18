import test from 'node:test';
import assert from 'node:assert/strict';
import { ConfigurerParametresPaiementEcoleUseCase } from '../../../application/use-cases/parametres/ConfigurerParametresPaiementEcoleUseCase';
import { ConsulterParametresPaiementEcoleUseCase } from '../../../application/use-cases/parametres/ConsulterParametresPaiementEcoleUseCase';
import { ParametresPaiementEcole } from '../../../domain/aggregates/ParametresPaiementEcole';
import { ModePaiement } from '../../../domain/value-objects/ModePaiement';
import { PolitiqueArrieres } from '../../../domain/value-objects/PolitiqueArrieres';

class DepotParametresMemoire {
  public parametreActif: ParametresPaiementEcole | null = null;
  public sauvegardes: ParametresPaiementEcole[] = [];

  public async sauvegarder(parametres: ParametresPaiementEcole): Promise<void> {
    this.sauvegardes.push(parametres);
    if (parametres.obtenirActif()) {
      this.parametreActif = parametres;
    } else if (this.parametreActif?.obtenirId() === parametres.obtenirId()) {
      this.parametreActif = null;
    }
  }

  public async trouverParId(idParametresPaiementEcole: string): Promise<ParametresPaiementEcole | null> {
    return this.sauvegardes.find((parametre) => parametre.obtenirId() === idParametresPaiementEcole)
      ?? null;
  }

  public async trouverActifParEcole(idEcole: string): Promise<ParametresPaiementEcole | null> {
    return this.parametreActif?.obtenirIdEcole() === idEcole ? this.parametreActif : null;
  }
}

test("ConfigurerParametresPaiementEcole reserve l'ecriture a ADMIN_SYSTEME_ECOLE", async () => {
  const depot = new DepotParametresMemoire();
  const casUsage = new ConfigurerParametresPaiementEcoleUseCase(depot as never);

  await assert.rejects(() => casUsage.executer({
    idOrganisation: 'ORG-001',
    idEcole: 'ECOLE-001',
    idUtilisateur: 'UTIL-001',
    roleActif: 'ADMINISTRATEUR_ECOLE',
    paiementPartielAutorise: false,
    politiqueArrieres: PolitiqueArrieres.AUTORISER_AVEC_SUIVI,
    autoriserInscriptionAvecDette: true,
    bloquerRetraitDocumentsSiDette: false,
    appliquerFamilleNombreuse: false,
    modesPaiementAutorises: [ModePaiement.CASH],
    exigerFraisInscription: false,
  }));

  const sortie = await casUsage.executer({
    idOrganisation: 'ORG-001',
    idEcole: 'ECOLE-001',
    idUtilisateur: 'UTIL-002',
    roleActif: 'ADMIN_SYSTEME_ECOLE',
    paiementPartielAutorise: false,
    politiqueArrieres: PolitiqueArrieres.AUTORISER_AVEC_SUIVI,
    autoriserInscriptionAvecDette: true,
    bloquerRetraitDocumentsSiDette: false,
    appliquerFamilleNombreuse: false,
    modesPaiementAutorises: [ModePaiement.CASH],
    exigerFraisInscription: false,
    consultationHistoriquePaiementsDeleguee: ['TITULAIRE'],
  });

  assert.equal(sortie.idEcole, 'ECOLE-001');
  assert.deepEqual(sortie.consultationHistoriquePaiementsDeleguee, ['TITULAIRE']);
});

test("ConsulterParametresPaiementEcole reserve la lecture a ADMIN_SYSTEME_ECOLE", async () => {
  const depot = new DepotParametresMemoire();
  depot.parametreActif = new ParametresPaiementEcole({
    idParametresPaiementEcole: 'PARAM-001',
    idEcole: 'ECOLE-001',
    paiementPartielAutorise: false,
    politiqueArrieres: PolitiqueArrieres.AUTORISER_AVEC_SUIVI,
    autoriserInscriptionAvecDette: true,
    bloquerRetraitDocumentsSiDette: false,
    appliquerFamilleNombreuse: false,
    modesPaiementAutorises: [ModePaiement.CASH],
    exigerFraisInscription: false,
    actif: true,
    version: 1,
  });

  const casUsage = new ConsulterParametresPaiementEcoleUseCase(depot as never);

  await assert.rejects(() => casUsage.executer({
    idOrganisation: 'ORG-001',
    idEcole: 'ECOLE-001',
    idUtilisateur: 'UTIL-001',
    roleActif: 'CAISSIER',
  }));

  const sortie = await casUsage.executer({
    idOrganisation: 'ORG-001',
    idEcole: 'ECOLE-001',
    idUtilisateur: 'UTIL-002',
    roleActif: 'ADMIN_SYSTEME_ECOLE',
  });

  assert.equal(sortie?.idParametresPaiementEcole, 'PARAM-001');
});
