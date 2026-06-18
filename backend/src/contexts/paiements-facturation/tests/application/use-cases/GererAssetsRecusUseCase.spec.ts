import test from 'node:test';
import assert from 'node:assert/strict';
import { GererAssetsRecusUseCase } from '../../../application/use-cases/recus/GererAssetsRecusUseCase';
import { ErreurDroitsInsuffisants } from '../../../application/exceptions/ErreurDroitsInsuffisants';

class DepotAssetsRecusMemoire {
  public identiteEcole:
    | { idEcole: string; logoUrl?: string; cachetUrl?: string; misAJourPar?: string }
    | null = null;
  public signatureUtilisateur:
    | { idUtilisateur: string; signatureUrl?: string; misAJourPar?: string }
    | null = null;

  public async sauvegarderIdentiteEcole(identite: {
    idEcole: string;
    logoUrl?: string;
    cachetUrl?: string;
    misAJourPar?: string;
  }): Promise<void> {
    this.identiteEcole = identite;
  }

  public async consulterIdentiteEcole(idEcole: string) {
    return this.identiteEcole?.idEcole === idEcole ? this.identiteEcole : null;
  }

  public async sauvegarderSignatureUtilisateur(signature: {
    idUtilisateur: string;
    signatureUrl?: string;
    misAJourPar?: string;
  }): Promise<void> {
    this.signatureUtilisateur = signature;
  }

  public async consulterSignatureUtilisateur(idUtilisateur: string) {
    return this.signatureUtilisateur?.idUtilisateur === idUtilisateur
      ? this.signatureUtilisateur
      : null;
  }
}

class StockageFichierMemoire {
  public uploads: Array<{ chemin: string; contenu: Buffer }> = [];

  public async televerser(chemin: string, contenu: Buffer): Promise<void> {
    this.uploads.push({ chemin, contenu });
  }

  public async telecharger(): Promise<Buffer> {
    return Buffer.from('x');
  }
}

test("GererAssetsRecus reserve l'identite documentaire ecole a ADMIN_SYSTEME_ECOLE", async () => {
  const depot = new DepotAssetsRecusMemoire();
  const stockage = new StockageFichierMemoire();
  const casUsage = new GererAssetsRecusUseCase(depot as never, stockage as never);

  await assert.rejects(
    () => casUsage.configurerIdentiteEcole({
      idOrganisation: 'ORG-001',
      idEcole: 'ECOLE-001',
      idUtilisateur: 'UTIL-001',
      roleActif: 'ADMINISTRATEUR_ECOLE',
      logo: {
        extension: 'png',
        contenuBase64: Buffer.from('logo').toString('base64'),
      },
    }),
    ErreurDroitsInsuffisants,
  );

  const sortie = await casUsage.configurerIdentiteEcole({
    idOrganisation: 'ORG-001',
    idEcole: 'ECOLE-001',
    idUtilisateur: 'UTIL-002',
    roleActif: 'ADMIN_SYSTEME_ECOLE',
    logo: {
      extension: 'png',
      contenuBase64: Buffer.from('logo').toString('base64'),
    },
    cachet: {
      extension: 'jpg',
      contenuBase64: Buffer.from('cachet').toString('base64'),
    },
  });

  assert.equal(sortie.idEcole, 'ECOLE-001');
  assert.equal(sortie.logoUrl, 'recus-assets/ecoles/ECOLE-001/logo.png');
  assert.equal(sortie.cachetUrl, 'recus-assets/ecoles/ECOLE-001/cachet.jpg');
  assert.equal(stockage.uploads.length, 2);
});

test('GererAssetsRecus reserve la signature documentaire aux percepteurs reels', async () => {
  const depot = new DepotAssetsRecusMemoire();
  const stockage = new StockageFichierMemoire();
  const casUsage = new GererAssetsRecusUseCase(depot as never, stockage as never);

  await assert.rejects(
    () => casUsage.configurerSignatureUtilisateur({
      idOrganisation: 'ORG-001',
      idEcole: 'ECOLE-001',
      idUtilisateur: 'UTIL-003',
      roleActif: 'ADMIN_SYSTEME_ECOLE',
      signature: {
        extension: 'svg',
        contenuBase64: Buffer.from('<svg/>').toString('base64'),
      },
    }),
    ErreurDroitsInsuffisants,
  );

  for (const roleActif of ['CAISSIER', 'PREFET_ETUDES', 'DIRECTEUR_PRIMAIRE', 'DIRECTEUR_MATERNELLE']) {
    const sortie = await casUsage.configurerSignatureUtilisateur({
      idOrganisation: 'ORG-001',
      idEcole: 'ECOLE-001',
      idUtilisateur: `UTIL-${roleActif}`,
      roleActif,
      signature: {
        extension: 'png',
        contenuBase64: Buffer.from(roleActif).toString('base64'),
      },
    });

    assert.equal(sortie.signatureUrl, `recus-assets/utilisateurs/UTIL-${roleActif}/signature.png`);
  }
});
