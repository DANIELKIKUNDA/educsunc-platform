import test from 'node:test';
import assert from 'node:assert/strict';
import { DocumentAssetsEcoleAdapter } from 'contexts/bulletins-evaluations/infrastructure/adapters/DocumentAssetsEcoleAdapter';

test("l'adaptateur d'assets documentaires recharge le logo et le cachet de l'ecole depuis le stockage officiel", async () => {
  const adapter = new DocumentAssetsEcoleAdapter(
    {
      async consulterIdentiteEcole() {
        return {
          idEcole: 'ecole-1',
          logoUrl: 'recus-assets/ecoles/ecole-1/logo.png',
          cachetUrl: 'recus-assets/ecoles/ecole-1/cachet.jpg',
        };
      },
      async sauvegarderIdentiteEcole() {
        throw new Error('not implemented');
      },
      async consulterSignatureUtilisateur() {
        return null;
      },
      async sauvegarderSignatureUtilisateur() {
        throw new Error('not implemented');
      },
    },
    {
      async televerser() {
        throw new Error('not implemented');
      },
      async telecharger(chemin: string) {
        return Buffer.from(`contenu:${chemin}`);
      },
      async supprimer() {
        throw new Error('not implemented');
      },
    },
  );

  const logo = await adapter.telechargerLogo('ecole-1');
  const cachet = await adapter.telechargerCachet('ecole-1');

  assert.equal(logo?.nomFichier, 'logo.png');
  assert.equal(logo?.mimeType, 'image/png');
  assert.equal(Buffer.from(logo?.contenu ?? []).toString('utf8'), 'contenu:recus-assets/ecoles/ecole-1/logo.png');
  assert.equal(cachet?.nomFichier, 'cachet.jpg');
  assert.equal(cachet?.mimeType, 'image/jpeg');
  assert.equal(Buffer.from(cachet?.contenu ?? []).toString('utf8'), 'contenu:recus-assets/ecoles/ecole-1/cachet.jpg');
});
