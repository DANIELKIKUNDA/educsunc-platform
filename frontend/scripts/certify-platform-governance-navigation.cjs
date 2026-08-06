const { chromium } = require('@playwright/test');

const BASE_URL = process.env.EDUCSYN_FRONTEND_URL || 'http://127.0.0.1:4174';
const CONTEXT_ERROR = /Le contexte transmis ne correspond pas a la session active|ACTIVE_CONTEXT_MISMATCH/i;

async function ouvrirRouteSpa(page, chemin) {
  const lien = page.locator(`a[href="${chemin}"]`).first();
  if (await lien.count()) {
    await lien.click({ force: true });
  } else {
    await page.goto(`${BASE_URL}${chemin}`, { waitUntil: 'domcontentloaded', timeout: 120000 });
  }
  await page.waitForURL((url) => url.pathname === chemin, { timeout: 30000 });
  await page.waitForLoadState('networkidle');
}

async function verifierPage(page, libelle) {
  const contenu = await page.locator('body').innerText();
  if (CONTEXT_ERROR.test(contenu) || /Centre indisponible/i.test(contenu)) {
    throw new Error(`${libelle} affiche encore une erreur de contexte.`);
  }
}

async function attendreEnregistrementModulesActif(page, etape) {
  const bouton = page.getByRole('button', { name: 'Enregistrer les changements' });
  await bouton.waitFor({ state: 'visible', timeout: 30000 });
  const deadline = Date.now() + 10000;
  while (Date.now() < deadline) {
    if (await bouton.isEnabled()) return bouton;
    await page.waitForTimeout(100);
  }
  const resume = (await page.locator('.org-modules').innerText()).replace(/\s+/g, ' ').slice(-1200);
  throw new Error(`${etape}: le bouton d enregistrement reste desactive. ${resume}`);
}

async function ouvrirPremiereOrganisation(page, etape) {
  const bouton = page.locator('button[title="Voir"]').first();
  if (!(await bouton.isVisible().catch(() => false))) {
    const contenu = (await page.locator('body').innerText()).replace(/\s+/g, ' ').slice(-2000);
    throw new Error(`${etape}: aucune organisation ouvrable sur ${page.url()}. ${contenu}`);
  }
  await bouton.click();
}

async function executer() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const erreursContexte = [];
  await page.addInitScript(() => {
    window.localStorage.setItem(
      'educsync.frontend.dev-session',
      JSON.stringify({ actorCode: 'MANAGER_SYSTEME' }),
    );
    // This stale school context reproduces the regression fixed by this certification.
    window.localStorage.setItem(
      'educsync.frontend.active-context',
      JSON.stringify({
        governanceLevel: 'PLATEFORME',
        organizationId: 'org-archedu',
        schoolId: 'ecole-saint-raphael',
        schoolYearId: 'annee-saint-raphael-2025-2026',
      }),
    );
  });

  page.on('response', async (response) => {
    if (response.status() !== 403) return;
    const body = await response.text().catch(() => '');
    if (CONTEXT_ERROR.test(body)) erreursContexte.push({ url: response.url(), body });
  });

  try {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 120000 });
    await page.getByText('Manager systeme', { exact: true }).first().waitFor({ timeout: 60000 });

    await ouvrirRouteSpa(page, '/app/organisation/ecoles');
    await verifierPage(page, 'Registre des organisations');

    await ouvrirPremiereOrganisation(page, 'Premiere ouverture');
    await page.waitForURL(/\/app\/organisation\/organisations\/[^/]+$/, { timeout: 30000 });
    await page.waitForLoadState('networkidle');
    await verifierPage(page, 'Fiche organisation');
    const ficheOrganisation = page.url();

    const boutonConfigurerModules = page.getByRole('button', { name: 'Configurer les modules' });
    await boutonConfigurerModules.waitFor({ state: 'visible', timeout: 30000 }).catch(() => undefined);
    if (!(await boutonConfigurerModules.isVisible().catch(() => false))) {
      const contenu = (await page.locator('body').innerText()).replace(/\s+/g, ' ').slice(-3000);
      throw new Error(`La fiche organisation n expose pas la configuration des modules. ${contenu}`);
    }
    await boutonConfigurerModules.click();
    const moduleCheckboxes = page.locator('.org-modules__card input[type="checkbox"]:not(:disabled)');
    await moduleCheckboxes.first().waitFor({ state: 'visible', timeout: 30000 });
    const moduleCheckbox = moduleCheckboxes.first();
    const moduleCode = await moduleCheckbox.getAttribute('value')
      ?? await moduleCheckbox.locator('xpath=ancestor::label').innerText();
    const etatInitialModule = await moduleCheckbox.isChecked();
    await moduleCheckbox.click();
    const boutonEnregistrerModules = await attendreEnregistrementModulesActif(page, 'Modification');

    await boutonEnregistrerModules.click();
    const dialogueModules = page.getByRole('dialog').filter({ hasText: 'Enregistrer les modules autorises' });
    await dialogueModules.waitFor({ state: 'visible', timeout: 10000 });
    const [reponseEcriture] = await Promise.all([
      page.waitForResponse(
        (response) => response.request().method() === 'PUT'
          && response.url().includes('/api/v1/configuration/modules/organisations/'),
        { timeout: 90000 },
      ),
      dialogueModules.getByRole('button', { name: 'Enregistrer', exact: true }).click(),
    ]);
    if (!reponseEcriture.ok()) {
      throw new Error(`L attribution des modules a echoue avec HTTP ${reponseEcriture.status()}: ${await reponseEcriture.text()}`);
    }

    const relectureEffective = page.waitForResponse(
      (response) => response.request().method() === 'GET'
        && response.url().includes('/api/v1/configuration/effective')
        && response.url().includes('niveau=ORGANIZATION')
        && response.url().includes('keyPrefix=modules'),
      { timeout: 90000 },
    );
    await page.reload({ waitUntil: 'domcontentloaded', timeout: 120000 });
    const reponseRelectureEffective = await relectureEffective;
    const corpsRelectureEffective = await reponseRelectureEffective.json().catch(() => null);
    await page.locator('.org-modules__card input[type="checkbox"]:not(:disabled)').first().waitFor({ timeout: 30000 });
    const moduleRelu = page.locator(`input[data-module-code="${moduleCode}"]`);
    await moduleRelu.waitFor({ state: 'visible', timeout: 30000 });
    const etatReluModule = await moduleRelu.isChecked();
    if (etatReluModule === etatInitialModule) {
      throw new Error(`La nouvelle attribution des modules n a pas persiste apres actualisation. Reponse effective: ${JSON.stringify(corpsRelectureEffective)}`);
    }

    const moduleCheckboxRestauration = page.locator(`input[data-module-code="${moduleCode}"]`);
    if (await moduleCheckboxRestauration.isChecked() !== etatInitialModule) {
      await moduleCheckboxRestauration.click();
    }
    await attendreEnregistrementModulesActif(page, 'Restauration');
    await page.getByRole('button', { name: 'Enregistrer les changements' }).click();
    const dialogueRestauration = page.getByRole('dialog').filter({ hasText: 'Enregistrer les modules autorises' });
    await dialogueRestauration.waitFor({ state: 'visible', timeout: 10000 });
    const [reponseRestauration] = await Promise.all([
      page.waitForResponse(
        (response) => response.request().method() === 'PUT'
          && response.url().includes('/api/v1/configuration/modules/organisations/'),
        { timeout: 90000 },
      ),
      dialogueRestauration.getByRole('button', { name: 'Enregistrer', exact: true }).click(),
    ]);
    if (!reponseRestauration.ok()) {
      throw new Error(`La restauration des modules a echoue avec HTTP ${reponseRestauration.status()}.`);
    }
    const modulesRestaures = true;

    await ouvrirRouteSpa(page, '/app/administration-ecole/ecoles');
    await verifierPage(page, 'Registre Administration ecole');

    await ouvrirRouteSpa(page, '/app/organisation/ecoles');
    await verifierPage(page, 'Retour au registre des organisations');
    await ouvrirPremiereOrganisation(page, 'Reouverture');
    await page.waitForURL(/\/app\/organisation\/organisations\/[^/]+$/, { timeout: 30000 });
    await page.waitForLoadState('networkidle');
    await verifierPage(page, 'Reouverture de la fiche organisation');

    if (erreursContexte.length > 0) {
      throw new Error(`${erreursContexte.length} reponse(s) ACTIVE_CONTEXT_MISMATCH detectee(s).`);
    }

    console.log(JSON.stringify({
      registreOrganisations: true,
      ficheOrganisation,
      centreAdministrationEcole: true,
      registreAdministrationEcole: true,
      alternanceSansRechargement: true,
      attributionModules: true,
      moduleTeste: moduleCode.replace(/\s+/g, ' ').trim().slice(0, 120),
      persistanceApresActualisation: true,
      modulesRestaures,
      erreursContexte: 0,
    }));
  } finally {
    await browser.close();
  }
}

executer().catch((erreur) => {
  console.error(erreur instanceof Error ? erreur.message : String(erreur));
  process.exitCode = 1;
});
