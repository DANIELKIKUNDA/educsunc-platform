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
