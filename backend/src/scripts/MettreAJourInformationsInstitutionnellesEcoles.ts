import {
  construirePayloadInformationsInstitutionnellesEcole,
  type EnregistrementInformationsInstitutionnellesEcole,
  validerEnregistrementInformationsInstitutionnellesEcole,
} from './MettreAJourInformationsInstitutionnellesEcoles.shared';

type ConfigurationScript = {
  cheminFichier: string;
  baseUrl: string;
  bearerToken?: string;
  appliquer: boolean;
};

function afficherAide(): void {
  console.log(`
Usage:
  tsx src/scripts/MettreAJourInformationsInstitutionnellesEcoles.ts --file <chemin-json> [--base-url <url>] [--apply] [--bearer-token <token>]

Mode de securite:
  - sans --apply : dry-run uniquement
  - avec --apply : envoie les PATCH reels

Variables d'environnement supportees:
  - EDUSYNC_API_BASE_URL
  - EDUSYNC_BEARER_TOKEN
`.trim());
}

function lireArgument(nom: string): string | undefined {
  const index = process.argv.indexOf(nom);
  if (index === -1) {
    return undefined;
  }

  return process.argv[index + 1];
}

function lireConfiguration(): ConfigurationScript {
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    afficherAide();
    process.exit(0);
  }

  const cheminFichier = lireArgument('--file');

  if (!cheminFichier) {
    throw new Error('Le parametre --file est obligatoire.');
  }

  return {
    cheminFichier,
    baseUrl:
      lireArgument('--base-url')
      ?? process.env.EDUSYNC_API_BASE_URL
      ?? 'http://localhost:3000',
    bearerToken: lireArgument('--bearer-token') ?? process.env.EDUSYNC_BEARER_TOKEN,
    appliquer: process.argv.includes('--apply'),
  };
}

async function chargerFichierJson(
  cheminFichier: string,
): Promise<EnregistrementInformationsInstitutionnellesEcole[]> {
  const moduleFs = await import('node:fs/promises');
  const contenu = await moduleFs.readFile(cheminFichier, 'utf8');
  const brut: unknown = JSON.parse(contenu);

  if (!Array.isArray(brut)) {
    throw new Error('Le fichier JSON doit contenir un tableau d ecoles.');
  }

  return brut.map((element, index) =>
    validerEnregistrementInformationsInstitutionnellesEcole(element, index),
  );
}

async function executer(): Promise<void> {
  const configuration = lireConfiguration();
  const enregistrements = await chargerFichierJson(configuration.cheminFichier);
  const apercu = enregistrements.map((ecole) => ({
    idEcole: ecole.idEcole,
    payload: construirePayloadInformationsInstitutionnellesEcole(ecole),
  }));

  if (!configuration.appliquer) {
    console.log(
      JSON.stringify(
        {
          script: 'MettreAJourInformationsInstitutionnellesEcoles',
          mode: 'dry-run',
          baseUrl: configuration.baseUrl,
          total: apercu.length,
          apercu,
        },
        null,
        2,
      ),
    );
    return;
  }

  const resultats: Array<Record<string, unknown>> = [];

  for (const ecole of enregistrements) {
    const payload = construirePayloadInformationsInstitutionnellesEcole(ecole);
    const headers: Record<string, string> = {
      'content-type': 'application/json',
      'x-tenant-id': ecole.idEcole,
      'x-idempotency-key': `ecole-institutionnelle-${ecole.idEcole}-${Date.now()}`,
    };

    if (configuration.bearerToken) {
      headers.authorization = `Bearer ${configuration.bearerToken}`;
    }

    const reponse = await fetch(
      `${configuration.baseUrl}/api/ecoles/${encodeURIComponent(ecole.idEcole)}/informations-institutionnelles`,
      {
        method: 'PATCH',
        headers,
        body: JSON.stringify(payload),
      },
    );

    const texte = await reponse.text();
    let corps: unknown = texte;

    try {
      corps = JSON.parse(texte);
    } catch {
      corps = texte;
    }

    resultats.push({
      idEcole: ecole.idEcole,
      succes: reponse.ok,
      status: reponse.status,
      corps,
    });
  }

  const succes = resultats.filter((element) => element.succes === true).length;
  const echecs = resultats.length - succes;

  console.log(
    JSON.stringify(
      {
        script: 'MettreAJourInformationsInstitutionnellesEcoles',
        mode: 'apply',
        baseUrl: configuration.baseUrl,
        total: resultats.length,
        succes,
        echecs,
        resultats,
      },
      null,
      2,
    ),
  );

  if (echecs > 0) {
    process.exitCode = 1;
  }
}

void executer();
