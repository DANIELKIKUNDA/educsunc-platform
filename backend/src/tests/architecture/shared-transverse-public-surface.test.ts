import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const RACINE_SRC = join(process.cwd(), 'src');
const MODULES_TRANSVERSES = ['notifications', 'configuration', 'monitoring', 'realtime'] as const;

test('les modules transverses partages doivent se consommer via leur surface publique', () => {
  const violations: string[] = [];

  for (const moduleName of MODULES_TRANSVERSES) {
    const racineModule = join(RACINE_SRC, 'shared', moduleName);
    for (const fichier of listerFichiersTypescript(racineModule)) {
      if (normaliserSeparateurs(fichier).includes('/tests/')) {
        continue;
      }

      const contenu = readFileSync(fichier, 'utf8');
      const correspondances = [
        ...contenu.matchAll(/from ['"]shared\/(notifications|configuration|monitoring|realtime)\/([^'"]+)['"]/g),
      ];

      for (const correspondance of correspondances) {
        const moduleCible = correspondance[1];
        const sousChemin = correspondance[2];
        if (moduleCible !== moduleName && sousChemin.length > 0) {
          violations.push(`${relative(RACINE_SRC, fichier)} -> shared/${moduleCible}/${sousChemin}`);
        }
      }
    }
  }

  assert.deepEqual(violations, []);
});

function listerFichiersTypescript(racine: string): string[] {
  if (!existsSync(racine)) {
    return [];
  }

  const resultat: string[] = [];

  for (const entree of readdirSync(racine)) {
    const cheminComplet = join(racine, entree);
    const informations = statSync(cheminComplet);

    if (informations.isDirectory()) {
      resultat.push(...listerFichiersTypescript(cheminComplet));
      continue;
    }

    if (cheminComplet.endsWith('.ts')) {
      resultat.push(cheminComplet);
    }
  }

  return resultat;
}

function normaliserSeparateurs(valeur: string): string {
  return valeur.replaceAll('\\', '/');
}
