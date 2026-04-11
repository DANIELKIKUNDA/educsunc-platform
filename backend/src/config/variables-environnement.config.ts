import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const expressionVariableEnvironnement = /^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/u;

// Cette fonction retire les guillemets simples ou doubles autour d'une valeur .env.
const retirerGuillemetsExternes = (valeur: string): string => {
  const valeurNettoyee = valeur.trim();
  const commenceParGuillemetDouble = valeurNettoyee.startsWith('"');
  const finitParGuillemetDouble = valeurNettoyee.endsWith('"');
  const commenceParGuillemetSimple = valeurNettoyee.startsWith("'");
  const finitParGuillemetSimple = valeurNettoyee.endsWith("'");

  if (
    (commenceParGuillemetDouble && finitParGuillemetDouble)
    || (commenceParGuillemetSimple && finitParGuillemetSimple)
  ) {
    return valeurNettoyee.slice(1, -1);
  }

  return valeurNettoyee;
};

// Cette fonction charge un fichier .env local sans ecraser les variables deja fournies par le systeme.
export const chargerVariablesEnvironnementLocales = (
  cheminFichierEnvironnement = resolve(process.cwd(), '.env'),
): void => {
  if (!existsSync(cheminFichierEnvironnement)) {
    return;
  }

  const contenu = readFileSync(cheminFichierEnvironnement, 'utf8');

  for (const ligne of contenu.split(/\r?\n/u)) {
    const ligneNettoyee = ligne.trim();

    if (ligneNettoyee.length === 0 || ligneNettoyee.startsWith('#')) {
      continue;
    }

    const correspondance = expressionVariableEnvironnement.exec(ligneNettoyee);

    if (correspondance === null) {
      continue;
    }

    const [, nomVariable, valeurBrute] = correspondance;

    if (process.env[nomVariable] !== undefined) {
      continue;
    }

    process.env[nomVariable] = retirerGuillemetsExternes(valeurBrute);
  }
};

chargerVariablesEnvironnementLocales();
