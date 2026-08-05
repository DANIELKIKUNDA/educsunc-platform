const fs = require('fs');
const path = require('path');
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadTsModule } = require('./load-typescript-module.cjs');

const validation = loadTsModule('src/shared/forms/form-validation.ts');
const snapshots = loadTsModule('src/shared/forms/form-snapshot.ts');
const organization = loadTsModule('src/domains/organisation/viewmodels/organization-form.validation.ts');
const school = loadTsModule('src/domains/administration-ecole/viewmodels/school-administration.logic.ts');

function read(relativePath) {
  return fs.readFileSync(path.resolve(__dirname, '..', relativePath), 'utf8');
}

test('le noyau commun retourne la premiere erreur et les erreurs par champ', () => {
  const result = validation.validateForm({ name: '', email: 'invalide' }, {
    name: [validation.requiredText('Nom requis')],
    email: [validation.validEmail('Email invalide')],
  });

  assert.equal(result.valid, false);
  assert.equal(result.firstError, 'Nom requis');
  assert.equal(result.errors.name, 'Nom requis');
  assert.equal(result.errors.email, 'Email invalide');
});

test('les champs facultatifs vides restent valides', () => {
  const result = validation.validateForm({ email: '' }, {
    email: [validation.validEmail('Email invalide', true)],
  });
  assert.equal(result.valid, true);
});

test('la confirmation doit correspondre au champ source', () => {
  const validator = validation.matchesField('password', 'Confirmation invalide');
  assert.equal(validator('Secret2', { password: 'Secret1', confirmation: 'Secret2' }), 'Confirmation invalide');
  assert.equal(validator('Secret1', { password: 'Secret1', confirmation: 'Secret1' }), null);
});

test('les instantanes ignorent les espaces sans masquer une vraie modification', () => {
  const initial = snapshots.createFormSnapshot({ name: ' EduSync ', options: ['A', 'B'] });
  assert.equal(snapshots.hasFormChanged(initial, { name: 'EduSync', options: ['A', 'B'] }), false);
  assert.equal(snapshots.hasFormChanged(initial, { name: 'EduSync RDC', options: ['A', 'B'] }), true);
});

test('une fiche responsable commencee devient completement validee', () => {
  const result = organization.evaluateOrganizationCreation(
    { code: 'ORG-1', nom: 'EduSync', typeOrganisation: 'PROMOTEUR', description: '' },
    { nomComplet: 'Daniel', telephone: '', email: '', identifiant: '', motDePasseInitial: '' },
  );
  assert.equal(result.valid, false);
  assert.equal(result.ownerErrors.email, "L'adresse e-mail du responsable est obligatoire.");
  assert.equal(result.ownerErrors.motDePasseInitial, 'Le mot de passe initial est obligatoire.');
});

test("la creation d'ecole valide aussi le format e-mail facultatif", () => {
  const result = school.evaluateCreateSchoolForm({
    idOrganisation: 'org-1',
    code: 'ECOLE-1',
    nom: 'College EduSync',
    modeExploitation: 'SYNC',
    email: 'invalide',
  }, false);
  assert.equal(result.canSubmit, false);
  assert.equal(result.fieldErrors.email, 'Saisissez une adresse e-mail valide.');
});

test('les formulaires critiques exposent les erreurs aux technologies d assistance', () => {
  for (const relativePath of [
    'src/features/auth/views/LoginView.vue',
    'src/features/auth/views/InitializationView.vue',
    'src/domains/organisation/components/OrganizationCreationModal.vue',
    'src/domains/organisation/views/OrganizationEditView.vue',
    'src/domains/administration-ecole/components/SchoolCreationModal.vue',
  ]) {
    const source = read(relativePath);
    assert.match(source, /aria-invalid/);
    assert.match(source, /aria-describedby/);
    assert.match(source, /role="alert"/);
  }
});

test('les formulaires de connexion conservent les conventions navigateur', () => {
  for (const relativePath of [
    'src/features/auth/views/LoginView.vue',
    'src/features/auth/views/InitializationView.vue',
  ]) {
    const source = read(relativePath);
    assert.match(source, /novalidate/);
    assert.match(source, /@submit\.prevent/);
    assert.match(source, /autocomplete=/);
  }
});

test('D1.5 reste compatible avec MVVM sans imposer une migration de bibliotheque', () => {
  const manifest = JSON.parse(read('package.json'));
  const dependencies = { ...manifest.dependencies, ...manifest.devDependencies };
  assert.equal(dependencies['vee-validate'], undefined);
  assert.equal(dependencies.zod, undefined);
  assert.ok(fs.existsSync(path.resolve(__dirname, '..', 'src/shared/forms/form-validation.ts')));
});
