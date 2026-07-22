const fs = require('fs');
const path = require('path');
const vm = require('vm');
const test = require('node:test');
const assert = require('node:assert/strict');
const ts = require('typescript');

function loadTsModule(relativePath) {
  const filePath = path.resolve(__dirname, '..', relativePath);
  const source = fs.readFileSync(filePath, 'utf8');
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
    },
    fileName: filePath,
  });

  const module = { exports: {} };
  const context = vm.createContext({
    module,
    exports: module.exports,
    require,
    __dirname: path.dirname(filePath),
    __filename: filePath,
    console,
    process,
  });

  new vm.Script(transpiled.outputText, { filename: filePath }).runInContext(context);
  return module.exports;
}

const logic = loadTsModule('src/domains/administration-ecole/viewmodels/school-administration.logic.ts');

test("le formulaire de creation exige d'abord une organisation", () => {
  const result = logic.evaluateCreateSchoolForm({
    idOrganisation: '',
    code: '',
    nom: '',
    modeExploitation: 'SYNC',
  }, false);

  assert.equal(result.canSubmit, false);
  assert.equal(result.disableReason, "Selectionnez d'abord une organisation.");
});

test("le formulaire de creation devient soumettable quand les champs obligatoires sont remplis", () => {
  const result = logic.evaluateCreateSchoolForm({
    idOrganisation: 'org-1',
    code: 'ECOLE-001',
    nom: 'College Saint Raphael',
    modeExploitation: 'SYNC',
  }, false);

  assert.equal(result.canSubmit, true);
  assert.equal(result.disableReason, null);
});

test("le renommage refuse un nom identique", () => {
  const result = logic.evaluateRenameSchool('College Saint Raphael', 'College Saint Raphael', false);

  assert.equal(result.canSubmit, false);
  assert.equal(result.disableReason, "Le nouveau nom doit etre different du nom actuel.");
});

test("le changement de mode exige une vraie difference", () => {
  const result = logic.evaluateSchoolModeUpdate('SYNC', 'SYNC', false);

  assert.equal(result.canSubmit, false);
  assert.equal(result.disableReason, "Choisissez un mode d'exploitation different.");
});

test("les informations institutionnelles restent bloquees sans modification", () => {
  const school = {
    sigle: 'CSR',
    telephone: '+243',
    email: 'contact@ecole.cd',
    provinceEducationnelle: 'Haut-Katanga 1',
    ville: 'Lubumbashi',
    communeOuTerritoire: 'Kampemba',
    adresse: 'Adresse',
  };

  const result = logic.evaluateSchoolInstitutionalInfoUpdate(school, { ...school }, false);

  assert.equal(result.canSubmit, false);
  assert.equal(result.disableReason, "Modifiez au moins une information avant d'enregistrer.");
});

test("les vues administration ecole n'exposent plus le vocabulaire technique interdit", () => {
  const files = [
    path.resolve(__dirname, '..', 'src/domains/administration-ecole/views/ModuleHomeView.vue'),
    path.resolve(__dirname, '..', 'src/domains/administration-ecole/views/SchoolAdministrationRegistryView.vue'),
    path.resolve(__dirname, '..', 'src/domains/administration-ecole/views/SchoolAdministrationDetailView.vue'),
    path.resolve(__dirname, '..', 'src/domains/administration-ecole/components/SchoolCreationModal.vue'),
    path.resolve(__dirname, '..', 'src/domains/administration-ecole/components/SchoolActionModal.vue'),
    path.resolve(__dirname, '..', 'src/domains/administration-ecole/components/SchoolLifecycleModal.vue'),
  ];
  const forbidden = [
    'referentiel.read',
    'referentiel.write',
    'Lecture backend',
    'Mutation backend',
    'Acteur courant',
    'Perimetre',
    'Cadre officiel',
    'contexte courant',
    'shell',
    'precharge',
  ];

  for (const file of files) {
    const source = fs.readFileSync(file, 'utf8');
    for (const token of forbidden) {
      assert.equal(source.includes(token), false, `${path.basename(file)} contains forbidden token "${token}"`);
    }
  }
});

test("les écrans actifs Organisation n'exposent ni jargon technique ni action fantôme", () => {
  const files = [
    path.resolve(__dirname, '..', 'src/domains/organisation/views/ModuleHomeView.vue'),
    path.resolve(__dirname, '..', 'src/domains/organisation/views/OrganizationRegistryView.vue'),
    path.resolve(__dirname, '..', 'src/domains/organisation/views/OrganizationDetailView.vue'),
    path.resolve(__dirname, '..', 'src/domains/organisation/views/OrganizationEditView.vue'),
    path.resolve(__dirname, '..', 'src/domains/organisation/views/OrganizationAttachedSchoolsView.vue'),
    path.resolve(__dirname, '..', 'src/domains/organisation/components/OrganizationCreationModal.vue'),
  ];
  const forbidden = ['depuis le backend', 'Le backend', 'Action sensible non disponible', 'Failed to fetch'];

  for (const file of files) {
    const source = fs.readFileSync(file, 'utf8');
    for (const token of forbidden) {
      assert.equal(source.includes(token), false, `${path.basename(file)} contains forbidden token "${token}"`);
    }
  }
});

test('les formulaires de création protègent les saisies non enregistrées', () => {
  for (const relativePath of [
    'src/domains/organisation/components/OrganizationCreationModal.vue',
    'src/domains/administration-ecole/components/SchoolCreationModal.vue',
  ]) {
    const source = fs.readFileSync(path.resolve(__dirname, '..', relativePath), 'utf8');
    assert.match(source, /showDiscardWarning/);
    assert.match(source, /requestClose/);
    assert.match(source, /Abandonner la saisie/);
  }
});

test('les confirmations critiques restent verrouillées pendant leur traitement', () => {
  const organizationDialog = fs.readFileSync(
    path.resolve(__dirname, '..', 'src/domains/organisation/components/OrganizationConfirmDialog.vue'),
    'utf8',
  );
  const schoolDialog = fs.readFileSync(
    path.resolve(__dirname, '..', 'src/domains/administration-ecole/components/SchoolLifecycleModal.vue'),
    'utf8',
  );

  assert.match(organizationDialog, /if \(!props\.busy\) emit\('close'\)/);
  assert.match(schoolDialog, /if \(!props\.pending\) emit\('close'\)/);
});

test("le formulaire Organisation attend son hydratation avant d'être affiché", () => {
  const view = fs.readFileSync(
    path.resolve(__dirname, '..', 'src/domains/organisation/views/OrganizationEditView.vue'),
    'utf8',
  );
  const viewModel = fs.readFileSync(
    path.resolve(__dirname, '..', 'src/domains/organisation/viewmodels/useOrganizationEditViewModel.ts'),
    'utf8',
  );

  assert.match(view, /OrganizationEditSkeleton v-if="isLoading"/);
  assert.match(viewModel, /const formReady = ref\(false\)/);
  assert.match(viewModel, /!formReady\.value && store\.state\.status !== 'error'/);
});

test("la creation depuis une organisation conserve le parent et le chemin de retour", () => {
  const source = fs.readFileSync(
    path.resolve(__dirname, '..', 'src/domains/organisation/viewmodels/useOrganizationAttachedSchoolsViewModel.ts'),
    'utf8',
  );

  assert.match(source, /name:\s*'school-administration-registry'/);
  assert.match(source, /idOrganisation:\s*organisationId\.value/);
  assert.match(source, /creation:\s*'1'/);
  assert.match(source, /retour:\s*`\/app\/organisation\/organisations\/\$\{organisationId\.value\}\/ecoles`/);
});

test("la fiche organisation ne conserve plus de vue concurrente des ecoles rattachees", () => {
  const view = fs.readFileSync(
    path.resolve(__dirname, '..', 'src/domains/organisation/views/OrganizationDetailView.vue'),
    'utf8',
  );
  const viewModel = fs.readFileSync(
    path.resolve(__dirname, '..', 'src/domains/organisation/viewmodels/useOrganizationDetailViewModel.ts'),
    'utf8',
  );

  assert.equal(view.includes("activeTab === 'ecoles'"), false);
  assert.equal(view.includes('ecolesApercu'), false);
  assert.match(viewModel, /router\.push\(`\/app\/organisation\/organisations\/\$\{organisationId\.value\}\/ecoles`\)/);
});

test("le formulaire contextualise verrouille l organisation parente", () => {
  const registry = fs.readFileSync(
    path.resolve(__dirname, '..', 'src/domains/administration-ecole/views/SchoolAdministrationRegistryView.vue'),
    'utf8',
  );
  const modal = fs.readFileSync(
    path.resolve(__dirname, '..', 'src/domains/administration-ecole/components/SchoolCreationModal.vue'),
    'utf8',
  );

  assert.match(registry, /:organization-locked="creationOrganizationLocked"/);
  assert.match(modal, /:disabled="organizationLocked"/);
});

test("les lectures et mutations Plateforme n usurpent jamais le contexte de l ecole consultee", () => {
  const service = fs.readFileSync(
    path.resolve(__dirname, '..', 'src/domains/administration-ecole/services/school-administration.api.ts'),
    'utf8',
  );

  assert.match(service, /function buildTargetSchoolHeaders\(_idEcole: string\)/);
  assert.match(service, /return buildReadHeaders\(\)/);
  assert.equal(service.includes('{ ecoleId: idEcole }'), false);
  assert.match(service, /inclureOrganisationActive: false/);
  assert.match(service, /inclureEcoleActive: false/);
  assert.match(service, /entetes: buildTargetSchoolHeaders\(idEcole\)/);
  assert.equal(
    (service.match(/buildTargetSchoolMutationHeaders\(idEcole,/g) ?? []).length,
    5,
  );
});

test("la lecture des catalogues remplace les demonstrations sans changer le contexte actif", () => {
  const contextStore = fs.readFileSync(
    path.resolve(__dirname, '..', 'src/shared/session/active-context.store.ts'),
    'utf8',
  );

  assert.match(contextStore, /organizationsState\.splice\(0, organizationsState\.length, \.\.\.organisationsReelles\)/);
  assert.equal(contextStore.includes('?? organisationsReelles[0]'), false);
  assert.equal(contextStore.includes('appliquerOrganisationAuContexte(organisationActive, state.schoolId)'), false);
  assert.match(contextStore, /state\.organizationName = organisationActive\.name/);
});

test("tous les acces Voir convergent vers la fiche canonique administration ecole", () => {
  const viewModel = fs.readFileSync(
    path.resolve(__dirname, '..', 'src/domains/organisation/viewmodels/useOrganizationAttachedSchoolsViewModel.ts'),
    'utf8',
  );
  const routes = fs.readFileSync(
    path.resolve(__dirname, '..', 'src/domains/organisation/routes.ts'),
    'utf8',
  );

  assert.match(viewModel, /name: 'school-administration-detail'/);
  assert.match(viewModel, /query: \{ retour: `\/app\/organisation\/organisations\/\$\{organisationId\.value\}\/ecoles` \}/);
  assert.match(routes, /name: 'school-administration-detail'/);
  assert.equal(routes.includes("import('./views/OrganizationSchoolDetailView.vue')"), false);
  assert.equal(
    fs.existsSync(path.resolve(__dirname, '..', 'src/domains/organisation/views/OrganizationSchoolDetailView.vue')),
    false,
  );
  assert.equal(
    fs.existsSync(path.resolve(__dirname, '..', 'src/domains/organisation/components/OrganizationProjectionPanel.vue')),
    false,
  );
});

test('la fiche canonique utilise des actions guidees et une tracabilite humaine', () => {
  const view = fs.readFileSync(
    path.resolve(__dirname, '..', 'src/domains/administration-ecole/views/SchoolAdministrationDetailView.vue'),
    'utf8',
  );
  const model = fs.readFileSync(
    path.resolve(__dirname, '..', 'src/domains/administration-ecole/models/school-administration.model.ts'),
    'utf8',
  );

  assert.match(view, /SchoolActionModal/);
  assert.match(view, /school\.creeParNom/);
  assert.match(view, /school\.modifieParNom/);
  assert.equal(/\{\{\s*school\.creePar\s*\}\}/.test(view), false);
  assert.equal(/\{\{\s*school\.modifiePar\s*\}\}/.test(view), false);
  assert.match(model, /creeParNom\?: string/);
  assert.match(model, /modifieParNom\?: string/);
});

test("la fiche distingue les modules autorises, actives et disponibles", () => {
  const viewModel = fs.readFileSync(
    path.resolve(__dirname, '..', 'src/domains/administration-ecole/viewmodels/useSchoolAdministrationDetailViewModel.ts'),
    'utf8',
  );

  assert.match(viewModel, /modulesAutorisesOrganisation/);
  assert.match(viewModel, /modulesActivesEcole/);
  assert.match(viewModel, /modulesEffectifs/);
  assert.match(viewModel, /configuration\.modules\.school\.write/);
  assert.match(viewModel, /Votre sélection est conservée/);
});

test("l attribution des modules attend sa lecture et isole le contexte organisation cible", () => {
  const organizationViewModel = fs.readFileSync(
    path.resolve(__dirname, '..', 'src/domains/organisation/viewmodels/useOrganizationDetailViewModel.ts'),
    'utf8',
  );
  const configurationApi = fs.readFileSync(
    path.resolve(__dirname, '..', 'src/domains/configuration/services/configuration.api.ts'),
    'utf8',
  );
  const modulesSection = fs.readFileSync(
    path.resolve(__dirname, '..', 'src/domains/organisation/components/OrganizationModulesSection.vue'),
    'utf8',
  );

  assert.match(organizationViewModel, /modulesStatus = ref<[^>]+>\('loading'\)/);
  assert.match(organizationViewModel, /modulesStatus\.value = 'loading'/);
  assert.match(configurationApi, /scope\.niveau === 'ORGANIZATION'[\s\S]*organisationId: scope\.organisationId,[\s\S]*lectureOrganisationnelle: true,[\s\S]*inclureEcoleActive: false/);
  assert.match(configurationApi, /scope\.niveau === 'SCHOOL' && scope\.organisationId && scope\.ecoleId/);
  assert.match(configurationApi, /contexte\.ecoleId === null[\s\S]*inclureOrganisationActive: false,[\s\S]*inclureEcoleActive: false/);
  assert.equal(
    /scope\.niveau === 'SCHOOL'[\s\S]{0,500}organisationId: scope\.organisationId,[\s\S]{0,200}ecoleId: scope\.ecoleId/.test(configurationApi),
    false,
  );
  assert.match(modulesSection, /:data-module-code="card\.code"/);
});

test("la fiche ecole isole la cible metier du contexte et affiche un seul etat de modules", () => {
  const viewModel = fs.readFileSync(
    path.resolve(__dirname, '..', 'src/domains/administration-ecole/viewmodels/useSchoolAdministrationDetailViewModel.ts'),
    'utf8',
  );
  const view = fs.readFileSync(
    path.resolve(__dirname, '..', 'src/domains/administration-ecole/views/SchoolAdministrationDetailView.vue'),
    'utf8',
  );

  assert.match(viewModel, /lireContexteApiConfigurationPlateforme/);
  assert.match(viewModel, /modulesLoadErrorMessage/);
  assert.match(viewModel, /modulesSaveErrorMessage/);
  assert.equal(viewModel.includes('modulesErrorMessage'), false);
  assert.match(view, /v-else-if="modulesLoadErrorMessage"/);
  assert.match(view, /v-else-if="modulesAllowed\.length"/);
  assert.equal(view.includes('v-if="modulesErrorMessage"'), false);
});
