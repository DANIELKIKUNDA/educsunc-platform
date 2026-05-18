import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const RACINE_SRC = join(process.cwd(), 'src');
const RACINE_SHARED = join(RACINE_SRC, 'shared');
const RACINE_CONTEXTS = join(RACINE_SRC, 'contexts');
const ROUTES_COMPOSITION = join(RACINE_SRC, 'app', 'routes');

// Ce fichier protege les regles d'architecture les plus sensibles du backend.

test('shared ne doit importer aucun fichier interne d un BC', () => {
  const fichiersShared = listerFichiersTypescript(RACINE_SHARED);
  const violations = fichiersShared
    .filter((fichier) => !fichier.endsWith('.test.ts'))
    .filter((fichier) => /from ['"](?:\.\.\/)*contexts\//.test(readFileSync(fichier, 'utf8')));

  assert.deepEqual(
    violations.map((fichier) => relative(RACINE_SRC, fichier)),
    [],
  );
});

test("un BC ne doit pas importer l'infrastructure d'un autre BC hors composition globale", () => {
  const fichiersContexts = listerFichiersTypescript(RACINE_CONTEXTS);
  const violations = fichiersContexts
    .filter((fichier) => !normaliserSeparateurs(fichier).includes('/tests/'))
    .filter((fichier) => {
      const contenu = readFileSync(fichier, 'utf8');
      return /from ['"][^'"]*contexts\/([^/'"]+)\/infrastructure\//.test(normaliserSeparateurs(contenu))
        && !fichier.startsWith(ROUTES_COMPOSITION);
    })
    .filter((fichier) => {
      const contenu = normaliserSeparateurs(readFileSync(fichier, 'utf8'));
      const bcCourant = extraireNomBcDepuisChemin(fichier);
      const correspondances = [...contenu.matchAll(/from ['"][^'"]*contexts\/([^/'"]+)\/infrastructure\//g)];
      return correspondances.some((correspondance) => correspondance[1] !== bcCourant);
    });

  assert.deepEqual(
    violations.map((fichier) => relative(RACINE_SRC, fichier)),
    [],
  );
});

// Cette fonction liste tous les fichiers TypeScript d'un dossier de maniere recursive.
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

// Cette fonction harmonise les separateurs pour faciliter les expressions regulieres.
function normaliserSeparateurs(valeur: string): string {
  return valeur.replaceAll('\\', '/');
}

// Cette fonction retrouve le nom du BC a partir de son chemin source.
function extraireNomBcDepuisChemin(cheminFichier: string): string | null {
  const cheminNormalise = normaliserSeparateurs(cheminFichier);
  const correspondance = cheminNormalise.match(/contexts\/([^/]+)\//);
  return correspondance?.[1] ?? null;
}
