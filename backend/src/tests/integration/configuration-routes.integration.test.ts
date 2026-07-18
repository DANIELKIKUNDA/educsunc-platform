import assert from 'node:assert/strict';
import test from 'node:test';
import Fastify from 'fastify';
import { requestContextPlugin } from '../../app/plugins/request-context.plugin';
import { tenancyPlugin } from '../../app/plugins/tenancy.plugin';
import {
  moduleActivationConfigurationService,
  routeConfiguration,
} from '../../app/routes/configuration.routes';
import { routeMonitoring } from '../../app/routes/monitoring.routes';
import { TYPES_MODULE_CONFIGURATION } from '../../shared/configuration';
import { ROLE_FIXTURES, TENANT_FIXTURES } from '../../shared/tests/fixtures/GlobalFixtures';
import { injecterCommeActeur } from '../../shared/tests/helpers/GlobalTestHelpers';
import { GlobalTestBootstrap } from '../../shared/tests/setup/GlobalTestBootstrap';

test('les routes configuration exposent la gouvernance modulaire organisation et ecole', async () => {
  const bootstrap = new GlobalTestBootstrap();
  const promoteur = await bootstrap.creerActeur({
    ...ROLE_FIXTURES.PROMOTEUR_ORGANISATION,
    organisationId: TENANT_FIXTURES.organisationA,
    ecoleId: TENANT_FIXTURES.ecoleA1,
  });
  const adminSystemeEcole = await bootstrap.creerActeur({
    ...ROLE_FIXTURES.ADMIN_SYSTEME_ECOLE,
    organisationId: TENANT_FIXTURES.organisationA,
    ecoleId: TENANT_FIXTURES.ecoleA1,
  });

  const serveur = Fastify();
  await serveur.register(async (instance) => {
    await requestContextPlugin(instance, {});
    await bootstrap.creerAuthenticationPlugin()(instance, {});
    await bootstrap.creerSecurityPlugin()(instance, {});
    await tenancyPlugin(instance, {});
    await instance.register(routeConfiguration);
  });

  const ecritureOrganisation = await injecterCommeActeur(serveur, promoteur, {
    method: 'PUT',
    url: `/api/v1/configuration/modules/organisations/${TENANT_FIXTURES.organisationA}`,
    payload: {
      modules: ['PAIEMENTS_FACTURATION', 'MONITORING'],
    },
  });
  assert.equal(ecritureOrganisation.statusCode, 200, ecritureOrganisation.body);

  const ecritureEcole = await injecterCommeActeur(serveur, adminSystemeEcole, {
    method: 'PUT',
    url: `/api/v1/configuration/modules/ecoles/${TENANT_FIXTURES.ecoleA1}`,
    payload: {
      organisationId: TENANT_FIXTURES.organisationA,
      modules: ['MONITORING'],
    },
  });
  assert.equal(ecritureEcole.statusCode, 200, ecritureEcole.body);

  const lectureEffective = await injecterCommeActeur(serveur, adminSystemeEcole, {
    method: 'GET',
    url: `/api/v1/configuration/modules/effective?organisationId=${TENANT_FIXTURES.organisationA}&ecoleId=${TENANT_FIXTURES.ecoleA1}`,
  });
  assert.equal(lectureEffective.statusCode, 200, lectureEffective.body);
  assert.deepEqual(lectureEffective.json().donnees.modulesAutorisesOrganisation, [
    'PAIEMENTS_FACTURATION',
    'MONITORING',
  ]);
  assert.deepEqual(lectureEffective.json().donnees.modulesActivesEcole, ['MONITORING']);
  assert.deepEqual(lectureEffective.json().donnees.modulesEffectifs, ['MONITORING']);

  await serveur.close();
});

test('le Manager systeme relit les modules autorises apres leur enregistrement', async () => {
  const bootstrap = new GlobalTestBootstrap();
  const organisationId = 'organisation-manager-lecture-modules';
  const manager = await bootstrap.creerActeur({
    ...ROLE_FIXTURES.MANAGER_SYSTEME,
    organisationId: TENANT_FIXTURES.organisationA,
    ecoleId: TENANT_FIXTURES.ecoleA1,
  });

  const serveur = Fastify();
  await serveur.register(async (instance) => {
    await requestContextPlugin(instance, {});
    await bootstrap.creerAuthenticationPlugin()(instance, {});
    await bootstrap.creerSecurityPlugin()(instance, {});
    await tenancyPlugin(instance, {});
    await instance.register(routeConfiguration);
  });

  const modules = ['REFERENTIEL_ACADEMIQUE', 'PAIEMENTS_FACTURATION'];
  const ecriture = await injecterCommeActeur(serveur, manager, {
    method: 'PUT',
    url: `/api/v1/configuration/modules/organisations/${organisationId}`,
    payload: { modules },
  });
  assert.equal(ecriture.statusCode, 200, ecriture.body);

  const lecture = await injecterCommeActeur(serveur, manager, {
    method: 'GET',
    url: `/api/v1/configuration/effective?niveau=ORGANIZATION&organisationId=${organisationId}&keyPrefix=modules`,
  });
  assert.equal(lecture.statusCode, 200, lecture.body);
  const modulesRelus = lecture.json().donnees.valeurs.find(
    (valeur: { key: string }) => valeur.key === 'modules.allowed',
  )?.value;
  assert.deepEqual(modulesRelus, modules);

  await serveur.close();
});

test('le backend expose un catalogue officiel des modules lisible par les acteurs autorises', async () => {
  const bootstrap = new GlobalTestBootstrap();
  const adminSystemeEcole = await bootstrap.creerActeur({
    ...ROLE_FIXTURES.ADMIN_SYSTEME_ECOLE,
    organisationId: TENANT_FIXTURES.organisationA,
    ecoleId: TENANT_FIXTURES.ecoleA1,
  });

  const serveur = Fastify();
  await serveur.register(async (instance) => {
    await requestContextPlugin(instance, {});
    await bootstrap.creerAuthenticationPlugin()(instance, {});
    await bootstrap.creerSecurityPlugin()(instance, {});
    await tenancyPlugin(instance, {});
    await instance.register(routeConfiguration);
  });

  const lectureCatalogue = await injecterCommeActeur(serveur, adminSystemeEcole, {
    method: 'GET',
    url: '/api/v1/configuration/modules/catalogue',
  });

  assert.equal(lectureCatalogue.statusCode, 200, lectureCatalogue.body);
  assert.deepEqual(
    lectureCatalogue.json().donnees.modules.map((module: { code: string }) => module.code),
    TYPES_MODULE_CONFIGURATION,
  );
  assert.equal(
    lectureCatalogue.json().donnees.modules.find((module: { code: string }) => module.code === 'PAIEMENTS_FACTURATION')?.libelle,
    'Paiements facturation',
  );

  await serveur.close();
});

test("la lecture modulaire n'active jamais implicitement tous les modules d'une ecole", async () => {
  const bootstrap = new GlobalTestBootstrap();
  const adminSystemeEcole = await bootstrap.creerActeur({
    ...ROLE_FIXTURES.ADMIN_SYSTEME_ECOLE,
    organisationId: TENANT_FIXTURES.organisationB,
    ecoleId: TENANT_FIXTURES.ecoleB1,
  });

  const serveur = Fastify();
  await serveur.register(async (instance) => {
    await requestContextPlugin(instance, {});
    await bootstrap.creerAuthenticationPlugin()(instance, {});
    await bootstrap.creerSecurityPlugin()(instance, {});
    await tenancyPlugin(instance, {});
    await instance.register(routeConfiguration);
  });

  const lectureEffective = await injecterCommeActeur(serveur, adminSystemeEcole, {
    method: 'GET',
    url: `/api/v1/configuration/modules/effective?organisationId=${TENANT_FIXTURES.organisationB}&ecoleId=${TENANT_FIXTURES.ecoleB1}`,
  });

  assert.equal(lectureEffective.statusCode, 200, lectureEffective.body);
  assert.deepEqual(lectureEffective.json().donnees.modulesAutorisesOrganisation, TYPES_MODULE_CONFIGURATION);
  assert.deepEqual(lectureEffective.json().donnees.modulesActivesEcole, []);
  assert.deepEqual(lectureEffective.json().donnees.modulesEffectifs, []);

  await serveur.close();
});

test('la garde modulaire bloque un workflow transverse desactive pour l ecole', async () => {
  const bootstrap = new GlobalTestBootstrap();
  const manager = await bootstrap.creerActeur({
    ...ROLE_FIXTURES.MANAGER_SYSTEME,
    organisationId: TENANT_FIXTURES.organisationB,
    ecoleId: TENANT_FIXTURES.ecoleB1,
  });
  const adminSystemeEcole = await bootstrap.creerActeur({
    ...ROLE_FIXTURES.ADMIN_SYSTEME_ECOLE,
    organisationId: TENANT_FIXTURES.organisationB,
    ecoleId: TENANT_FIXTURES.ecoleB1,
  });

  const serveur = Fastify();
  await serveur.register(async (instance) => {
    await requestContextPlugin(instance, {});
    await bootstrap.creerAuthenticationPlugin()(instance, {});
    await bootstrap.creerSecurityPlugin()(instance, {});
    await tenancyPlugin(instance, {});
    await instance.register(routeConfiguration);
    instance.addHook('preHandler', async (requete, reponse) => {
      if (!requete.url.startsWith('/api/v1/monitoring')) {
        return;
      }

      const actif = await moduleActivationConfigurationService.moduleActif({
        organisationId: requete.context?.organisationActiveId,
        ecoleId: requete.context?.ecoleActiveId,
        module: 'MONITORING',
      });

      if (!actif) {
        reponse.code(403).send({
          code: 'MODULE_INACTIF',
          message: "Le module MONITORING n'est pas actif pour l'ecole courante.",
        });
      }
    });
    await instance.register(routeMonitoring);
  });

  const configurationOrganisation = await injecterCommeActeur(serveur, manager, {
    method: 'PUT',
    url: `/api/v1/configuration/modules/organisations/${TENANT_FIXTURES.organisationB}`,
    payload: {
      modules: ['MONITORING', 'PAIEMENTS_FACTURATION'],
    },
  });
  assert.equal(configurationOrganisation.statusCode, 200, configurationOrganisation.body);

  const activationInitiale = await injecterCommeActeur(serveur, adminSystemeEcole, {
    method: 'PUT',
    url: `/api/v1/configuration/modules/ecoles/${TENANT_FIXTURES.ecoleB1}`,
    payload: {
      organisationId: TENANT_FIXTURES.organisationB,
      modules: ['MONITORING'],
    },
  });
  assert.equal(activationInitiale.statusCode, 200, activationInitiale.body);

  const avant = await injecterCommeActeur(serveur, manager, {
    method: 'GET',
    url: '/api/v1/monitoring/state',
  });
  assert.equal(avant.statusCode, 200, avant.body);

  const configurationEcole = await injecterCommeActeur(serveur, adminSystemeEcole, {
    method: 'PUT',
    url: `/api/v1/configuration/modules/ecoles/${TENANT_FIXTURES.ecoleB1}`,
    payload: {
      organisationId: TENANT_FIXTURES.organisationB,
      modules: ['PAIEMENTS_FACTURATION'],
    },
  });
  assert.equal(configurationEcole.statusCode, 200, configurationEcole.body);

  const apres = await injecterCommeActeur(serveur, manager, {
    method: 'GET',
    url: '/api/v1/monitoring/state',
  });
  assert.equal(apres.statusCode, 403, apres.body);
  assert.equal(apres.json().code, 'MODULE_INACTIF');

  await serveur.close();
});

test('les routes generiques configuration respectent la hierarchie organisation ecole', async () => {
  const bootstrap = new GlobalTestBootstrap();
  const promoteur = await bootstrap.creerActeur({
    ...ROLE_FIXTURES.PROMOTEUR_ORGANISATION,
    organisationId: TENANT_FIXTURES.organisationA,
    ecoleId: TENANT_FIXTURES.ecoleA1,
  });
  const adminSystemeEcole = await bootstrap.creerActeur({
    ...ROLE_FIXTURES.ADMIN_SYSTEME_ECOLE,
    organisationId: TENANT_FIXTURES.organisationA,
    ecoleId: TENANT_FIXTURES.ecoleA1,
  });
  const enseignant = await bootstrap.creerActeur({
    ...ROLE_FIXTURES.ENSEIGNANT,
    organisationId: TENANT_FIXTURES.organisationA,
    ecoleId: TENANT_FIXTURES.ecoleA1,
  });

  const serveur = Fastify();
  await serveur.register(async (instance) => {
    await requestContextPlugin(instance, {});
    await bootstrap.creerAuthenticationPlugin()(instance, {});
    await bootstrap.creerSecurityPlugin()(instance, {});
    await tenancyPlugin(instance, {});
    await instance.register(routeConfiguration);
  });

  const creationOrganisation = await injecterCommeActeur(serveur, promoteur, {
    method: 'POST',
    url: '/api/v1/configuration',
    payload: {
      configurationId: 'cfg-org-branding',
      key: 'policies.branding.sigle',
      value: 'CAT',
      scope: {
        niveau: 'ORGANIZATION',
        organisationId: TENANT_FIXTURES.organisationA,
      },
      actorId: promoteur.utilisateurId,
    },
  });
  assert.equal(creationOrganisation.statusCode, 201, creationOrganisation.body);

  const lectureOrganisationDepuisEcole = await injecterCommeActeur(serveur, adminSystemeEcole, {
    method: 'GET',
    url: '/api/v1/configuration/cfg-org-branding',
  });
  assert.equal(lectureOrganisationDepuisEcole.statusCode, 403, lectureOrganisationDepuisEcole.body);
  assert.equal(lectureOrganisationDepuisEcole.json().code, 'CONFIGURATION_SCOPE_DENIED');

  const lectureOrganisationDepuisOrganisation = await injecterCommeActeur(serveur, promoteur, {
    method: 'GET',
    url: '/api/v1/configuration/cfg-org-branding',
  });
  assert.equal(lectureOrganisationDepuisOrganisation.statusCode, 200, lectureOrganisationDepuisOrganisation.body);

  const creationEcole = await injecterCommeActeur(serveur, adminSystemeEcole, {
    method: 'POST',
    url: '/api/v1/configuration',
    payload: {
      configurationId: 'cfg-school-branding',
      key: 'branding.footer',
      value: 'Ecole A1',
      scope: {
        niveau: 'SCHOOL',
        organisationId: TENANT_FIXTURES.organisationA,
        ecoleId: TENANT_FIXTURES.ecoleA1,
      },
      actorId: adminSystemeEcole.utilisateurId,
    },
  });
  assert.equal(creationEcole.statusCode, 201, creationEcole.body);

  const lectureEcoleDepuisOrganisation = await injecterCommeActeur(serveur, promoteur, {
    method: 'GET',
    url: '/api/v1/configuration/cfg-school-branding',
  });
  assert.equal(lectureEcoleDepuisOrganisation.statusCode, 403, lectureEcoleDepuisOrganisation.body);
  assert.equal(lectureEcoleDepuisOrganisation.json().code, 'CONFIGURATION_FAMILY_DENIED');

  const creationRefuseeEnseignant = await injecterCommeActeur(serveur, enseignant, {
    method: 'POST',
    url: '/api/v1/configuration',
    payload: {
      configurationId: 'cfg-school-illicite',
      key: 'branding.palette',
      value: 'bleu',
      scope: {
        niveau: 'SCHOOL',
        organisationId: TENANT_FIXTURES.organisationA,
        ecoleId: TENANT_FIXTURES.ecoleA1,
      },
      actorId: enseignant.utilisateurId,
    },
  });
  assert.equal(creationRefuseeEnseignant.statusCode, 403, creationRefuseeEnseignant.body);
  assert.equal(creationRefuseeEnseignant.json().code, 'CONFIGURATION_PERMISSION_DENIED');

  await serveur.close();
});

test('une ecole peut gerer sa configuration locale selon sa doctrine', async () => {
  const bootstrap = new GlobalTestBootstrap();
  const promoteur = await bootstrap.creerActeur({
    ...ROLE_FIXTURES.PROMOTEUR_ORGANISATION,
    organisationId: TENANT_FIXTURES.organisationA,
    ecoleId: TENANT_FIXTURES.ecoleA1,
  });
  const adminSystemeEcole = await bootstrap.creerActeur({
    ...ROLE_FIXTURES.ADMIN_SYSTEME_ECOLE,
    organisationId: TENANT_FIXTURES.organisationA,
    ecoleId: TENANT_FIXTURES.ecoleA1,
  });

  const serveur = Fastify();
  await serveur.register(async (instance) => {
    await requestContextPlugin(instance, {});
    await bootstrap.creerAuthenticationPlugin()(instance, {});
    await bootstrap.creerSecurityPlugin()(instance, {});
    await tenancyPlugin(instance, {});
    await instance.register(routeConfiguration);
  });

  const creationEcoleNotifications = await injecterCommeActeur(serveur, adminSystemeEcole, {
    method: 'POST',
    url: '/api/v1/configuration',
    payload: {
      configurationId: 'cfg-system-notification',
      key: 'notifications.templates.default',
      value: true,
      scope: {
        niveau: 'SCHOOL',
        organisationId: TENANT_FIXTURES.organisationA,
        ecoleId: TENANT_FIXTURES.ecoleA1,
      },
      actorId: adminSystemeEcole.utilisateurId,
    },
  });
  assert.equal(creationEcoleNotifications.statusCode, 201, creationEcoleNotifications.body);

  const validationEcole = await injecterCommeActeur(serveur, adminSystemeEcole, {
    method: 'POST',
    url: '/api/v1/configuration/validate',
    payload: {
      key: 'notifications.templates.default',
      value: false,
      scope: {
        niveau: 'SCHOOL',
        organisationId: TENANT_FIXTURES.organisationA,
        ecoleId: TENANT_FIXTURES.ecoleA1,
      },
    },
  });
  assert.equal(validationEcole.statusCode, 200, validationEcole.body);

  const creationOrganisationOverridable = await injecterCommeActeur(serveur, promoteur, {
    method: 'POST',
    url: '/api/v1/configuration',
    payload: {
      configurationId: 'cfg-org-policy',
      key: 'policies.notifications.digest',
      value: 'weekly',
      scope: {
        niveau: 'ORGANIZATION',
        organisationId: TENANT_FIXTURES.organisationA,
      },
      actorId: promoteur.utilisateurId,
      gouvernance: {
        overridable: true,
      },
    },
  });
  assert.equal(creationOrganisationOverridable.statusCode, 201, creationOrganisationOverridable.body);

  const overrideEcole = await injecterCommeActeur(serveur, adminSystemeEcole, {
    method: 'POST',
    url: '/api/v1/configuration/cfg-org-policy/override',
    payload: {
      scope: {
        niveau: 'SCHOOL',
        organisationId: TENANT_FIXTURES.organisationA,
        ecoleId: TENANT_FIXTURES.ecoleA1,
      },
      value: 'daily',
      actorId: adminSystemeEcole.utilisateurId,
    },
  });
  assert.equal(overrideEcole.statusCode, 200, overrideEcole.body);

  const lectureEffective = await injecterCommeActeur(serveur, adminSystemeEcole, {
    method: 'GET',
    url: `/api/v1/configuration/effective?niveau=SCHOOL&organisationId=${TENANT_FIXTURES.organisationA}&ecoleId=${TENANT_FIXTURES.ecoleA1}&keyPrefix=policies.notifications`,
  });
  assert.equal(lectureEffective.statusCode, 200, lectureEffective.body);
  assert.equal(
    lectureEffective.json().donnees.valeurs.find((valeur: { key: string }) => valeur.key === 'policies.notifications.digest')?.value,
    'daily',
  );

  const creationEcole = await injecterCommeActeur(serveur, adminSystemeEcole, {
    method: 'POST',
    url: '/api/v1/configuration',
    payload: {
      configurationId: 'cfg-school-runtime',
      key: 'school.theme',
      value: 'standard',
      scope: {
        niveau: 'SCHOOL',
        organisationId: TENANT_FIXTURES.organisationA,
        ecoleId: TENANT_FIXTURES.ecoleA1,
      },
      actorId: adminSystemeEcole.utilisateurId,
    },
  });
  assert.equal(creationEcole.statusCode, 201, creationEcole.body);

  const verrouillage = await injecterCommeActeur(serveur, adminSystemeEcole, {
    method: 'POST',
    url: '/api/v1/configuration/cfg-school-runtime/lock',
    payload: {
      niveauMinimalAutorise: 'SCHOOL',
      actorId: adminSystemeEcole.utilisateurId,
    },
  });
  assert.equal(verrouillage.statusCode, 200, verrouillage.body);

  const deverrouillage = await injecterCommeActeur(serveur, adminSystemeEcole, {
    method: 'POST',
    url: '/api/v1/configuration/cfg-school-runtime/unlock',
    payload: {
      actorId: adminSystemeEcole.utilisateurId,
    },
  });
  assert.equal(deverrouillage.statusCode, 200, deverrouillage.body);

  const snapshotSource = await injecterCommeActeur(serveur, adminSystemeEcole, {
    method: 'POST',
    url: '/api/v1/configuration/cfg-school-runtime/snapshots',
    payload: {
      snapshotId: 'snap-1',
      actorId: adminSystemeEcole.utilisateurId,
    },
  });
  assert.equal(snapshotSource.statusCode, 201, snapshotSource.body);

  const miseAJour = await injecterCommeActeur(serveur, adminSystemeEcole, {
    method: 'PUT',
    url: '/api/v1/configuration/cfg-school-runtime',
    payload: {
      value: 'contraste',
      actorId: adminSystemeEcole.utilisateurId,
    },
  });
  assert.equal(miseAJour.statusCode, 200, miseAJour.body);

  const snapshotCible = await injecterCommeActeur(serveur, adminSystemeEcole, {
    method: 'POST',
    url: '/api/v1/configuration/cfg-school-runtime/snapshots',
    payload: {
      snapshotId: 'snap-2',
      actorId: adminSystemeEcole.utilisateurId,
    },
  });
  assert.equal(snapshotCible.statusCode, 201, snapshotCible.body);

  const comparaison = await injecterCommeActeur(serveur, adminSystemeEcole, {
    method: 'GET',
    url: '/api/v1/configuration/cfg-school-runtime/snapshots/compare?sourceId=snap-1&cibleId=snap-2',
  });
  assert.equal(comparaison.statusCode, 200, comparaison.body);
  assert.equal(comparaison.json().donnees.modifications.length >= 1, true);

  const propagation = await injecterCommeActeur(serveur, adminSystemeEcole, {
    method: 'POST',
    url: '/api/v1/configuration/cfg-school-runtime/propagate',
    payload: {
      actorId: adminSystemeEcole.utilisateurId,
      canauxCibles: ['runtime'],
    },
  });
  assert.equal(propagation.statusCode, 200, propagation.body);

  const reload = await injecterCommeActeur(serveur, adminSystemeEcole, {
    method: 'POST',
    url: '/api/v1/configuration/cfg-school-runtime/reload',
    payload: {
      actorId: adminSystemeEcole.utilisateurId,
      forcer: true,
    },
  });
  assert.equal(reload.statusCode, 200, reload.body);

  await serveur.close();
});

test('la matrice familiale refuse un runtime plateforme a un acteur ecole', async () => {
  const bootstrap = new GlobalTestBootstrap();
  const adminSystemeEcole = await bootstrap.creerActeur({
    ...ROLE_FIXTURES.ADMIN_SYSTEME_ECOLE,
    organisationId: TENANT_FIXTURES.organisationA,
    ecoleId: TENANT_FIXTURES.ecoleA1,
  });

  const serveur = Fastify();
  await serveur.register(async (instance) => {
    await requestContextPlugin(instance, {});
    await bootstrap.creerAuthenticationPlugin()(instance, {});
    await bootstrap.creerSecurityPlugin()(instance, {});
    await tenancyPlugin(instance, {});
    await instance.register(routeConfiguration);
  });

  const tentative = await injecterCommeActeur(serveur, adminSystemeEcole, {
    method: 'POST',
    url: '/api/v1/configuration',
    payload: {
      configurationId: 'cfg-school-illegal-runtime',
      key: 'runtime.cache.ttlSeconds',
      value: 30,
      scope: {
        niveau: 'SCHOOL',
        organisationId: TENANT_FIXTURES.organisationA,
        ecoleId: TENANT_FIXTURES.ecoleA1,
      },
      actorId: adminSystemeEcole.utilisateurId,
    },
  });
  assert.equal(tentative.statusCode, 403, tentative.body);
  assert.equal(tentative.json().code, 'CONFIGURATION_FAMILY_DENIED');

  await serveur.close();
});

test('la matrice familiale reserve le branding technique d ecole au systeme ecole', async () => {
  const bootstrap = new GlobalTestBootstrap();
  const adminEcole = await bootstrap.creerActeur({
    ...ROLE_FIXTURES.ADMIN_ECOLE,
    organisationId: TENANT_FIXTURES.organisationA,
    ecoleId: TENANT_FIXTURES.ecoleA1,
  });

  const serveur = Fastify();
  await serveur.register(async (instance) => {
    await requestContextPlugin(instance, {});
    await bootstrap.creerAuthenticationPlugin()(instance, {});
    await bootstrap.creerSecurityPlugin()(instance, {});
    await tenancyPlugin(instance, {});
    await instance.register(routeConfiguration);
  });

  const tentative = await injecterCommeActeur(serveur, adminEcole, {
    method: 'POST',
    url: '/api/v1/configuration',
    payload: {
      configurationId: 'cfg-branding-technique',
      key: 'branding.logo.primary',
      value: 'https://cdn.educsyn.local/logo.svg',
      scope: {
        niveau: 'SCHOOL',
        organisationId: TENANT_FIXTURES.organisationA,
        ecoleId: TENANT_FIXTURES.ecoleA1,
      },
      actorId: adminEcole.utilisateurId,
    },
  });
  assert.equal(tentative.statusCode, 403, tentative.body);
  assert.equal(tentative.json().code, 'CONFIGURATION_FAMILY_DENIED');

  await serveur.close();
});

test('la matrice familiale reserve les preferences utilisateur au proprietaire', async () => {
  const bootstrap = new GlobalTestBootstrap();
  const utilisateurConfiguration = await bootstrap.creerActeur({
    ...ROLE_FIXTURES.ADMIN_SYSTEME_ECOLE,
    organisationId: TENANT_FIXTURES.organisationA,
    ecoleId: TENANT_FIXTURES.ecoleA1,
  });
  const autreUtilisateur = await bootstrap.creerActeur({
    ...ROLE_FIXTURES.ADMIN_SYSTEME_ECOLE,
    organisationId: TENANT_FIXTURES.organisationA,
    ecoleId: TENANT_FIXTURES.ecoleA1,
  });

  const serveur = Fastify();
  await serveur.register(async (instance) => {
    await requestContextPlugin(instance, {});
    await bootstrap.creerAuthenticationPlugin()(instance, {});
    await bootstrap.creerSecurityPlugin()(instance, {});
    await tenancyPlugin(instance, {});
    await instance.register(routeConfiguration);
  });

  const creationParProprietaire = await injecterCommeActeur(serveur, utilisateurConfiguration, {
    method: 'POST',
    url: '/api/v1/configuration',
    payload: {
      configurationId: 'cfg-user-preference',
      key: 'preferences.theme',
      value: 'claire',
      scope: {
        niveau: 'USER',
        organisationId: TENANT_FIXTURES.organisationA,
        ecoleId: TENANT_FIXTURES.ecoleA1,
        utilisateurId: utilisateurConfiguration.utilisateurId,
      },
      actorId: utilisateurConfiguration.utilisateurId,
    },
  });
  assert.equal(creationParProprietaire.statusCode, 201, creationParProprietaire.body);

  const lectureParAutre = await injecterCommeActeur(serveur, autreUtilisateur, {
    method: 'GET',
    url: '/api/v1/configuration/cfg-user-preference',
  });
  assert.equal(lectureParAutre.statusCode, 403, lectureParAutre.body);
  assert.equal(lectureParAutre.json().code, 'CONFIGURATION_FAMILY_DENIED');

  await serveur.close();
});
