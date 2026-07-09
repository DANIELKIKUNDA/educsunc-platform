import test from 'node:test';
import assert from 'node:assert/strict';
import { ReferentielProgramme } from '../domain/aggregates/ReferentielProgramme';
import { VersionReferentielProgramme } from '../domain/aggregates/VersionReferentielProgramme';
import { LigneReferentielProgramme } from '../domain/entities/LigneReferentielProgramme';
import { ClasseAcademiqueId } from '../domain/value-objects/ClasseAcademiqueId';
import { LigneReferentielProgrammeId } from '../domain/value-objects/LigneReferentielProgrammeId';
import { PonderationEvaluation } from '../domain/value-objects/PonderationEvaluation';
import { ReferentielCoursId } from '../domain/value-objects/ReferentielCoursId';
import { ReferentielProgrammeId } from '../domain/value-objects/ReferentielProgrammeId';
import { SourceLigneProgramme } from '../domain/value-objects/SourceLigneProgramme';
import { SourceReferentiel } from '../domain/value-objects/SourceReferentiel';
import { TypeStructureEvaluation } from '../domain/value-objects/TypeStructureEvaluation';
import { VersionReferentielProgrammeId } from '../domain/value-objects/VersionReferentielProgrammeId';
import { ValidationError } from '../../../shared/exceptions/ValidationError';

function creerPonderationSansExamen(): PonderationEvaluation {
  return new PonderationEvaluation({
    maxP1: 10,
    maxP2: 10,
    maxEX1: 0,
    maxP3: 10,
    maxP4: 10,
    maxEX2: 0,
    maxP5: 0,
    maxP6: 0,
    maxEX3: 0,
  });
}

function creerPonderationAvecExamen(): PonderationEvaluation {
  return new PonderationEvaluation({
    maxP1: 10,
    maxP2: 10,
    maxEX1: 20,
    maxP3: 10,
    maxP4: 10,
    maxEX2: 20,
    maxP5: 0,
    maxP6: 0,
    maxEX3: 0,
  });
}

function creerLigne(
  suffixe: string,
  overrides: {
    ordreAffichage?: number;
    aExamen?: boolean;
    estCalculable?: boolean;
    obligatoire?: boolean;
    ponderation?: PonderationEvaluation;
  } = {},
): LigneReferentielProgramme {
  const aExamen = overrides.aExamen ?? false;

  return new LigneReferentielProgramme(
    new LigneReferentielProgrammeId(`00000000-0000-0000-0000-000000000${suffixe}`),
    new ReferentielCoursId(`10000000-0000-0000-0000-000000000${suffixe}`),
    overrides.ordreAffichage ?? Number.parseInt(suffixe, 10),
    overrides.obligatoire ?? true,
    aExamen,
    overrides.estCalculable ?? true,
    SourceLigneProgramme.OFFICIEL,
    overrides.ponderation ?? (aExamen ? creerPonderationAvecExamen() : creerPonderationSansExamen()),
  );
}

function creerVersionTravail(): VersionReferentielProgramme {
  return new VersionReferentielProgramme(
    new VersionReferentielProgrammeId('20000000-0000-0000-0000-000000000001'),
    '2026-V2-WIP',
    '2026',
    new Date('2026-07-01T00:00:00.000Z'),
    SourceReferentiel.CORRECTION_SYSTEME,
    'Version de travail',
    false,
    new Date('2026-07-01T00:00:00.000Z'),
    [creerLigne('001'), creerLigne('002', { ordreAffichage: 2 })],
    false,
  );
}

function creerVersionPubliee(active = false): VersionReferentielProgramme {
  const version = new VersionReferentielProgramme(
    new VersionReferentielProgrammeId('20000000-0000-0000-0000-000000000002'),
    active ? '2026-V1-ACTIVE' : '2026-V1',
    '2026',
    new Date('2026-06-01T00:00:00.000Z'),
    SourceReferentiel.JSON_OFFICIEL,
    'Publication officielle',
    active,
    new Date('2026-06-01T00:00:00.000Z'),
    [creerLigne('011')],
    false,
  );

  version.publierVersion();

  return version;
}

function creerReferentielAvecVersionPubliee(): ReferentielProgramme {
  const referentiel = new ReferentielProgramme(
    new ReferentielProgrammeId('30000000-0000-0000-0000-000000000001'),
    new ClasseAcademiqueId('40000000-0000-0000-0000-000000000001'),
    TypeStructureEvaluation.SEMESTRIEL,
  );
  referentiel.ajouterVersion(creerVersionPubliee());

  return referentiel;
}

test('une version publiee refuse toute nouvelle ligne', () => {
  const version = creerVersionPubliee();

  assert.throws(
    () => version.ajouterLigne(creerLigne('012', { ordreAffichage: 2 }), TypeStructureEvaluation.SEMESTRIEL),
    (erreur: unknown) =>
      erreur instanceof ValidationError
      && erreur.code === 'VERSION_REFERENTIEL_PUBLIEE_IMMUTABLE',
  );
});

test('une version active refuse la modification de ponderation', () => {
  const version = creerVersionPubliee(true);
  const ligne = version.obtenirLignes()[0];

  assert.throws(
    () => version.modifierPonderationLigne(
      ligne.obtenirId(),
      creerPonderationAvecExamen(),
      TypeStructureEvaluation.SEMESTRIEL,
    ),
    (erreur: unknown) =>
      erreur instanceof ValidationError
      && erreur.code === 'VERSION_REFERENTIEL_ACTIVE_IMMUTABLE',
  );
});

test('creer une version de travail clone les lignes et garde la version non publiee', () => {
  const referentiel = creerReferentielAvecVersionPubliee();
  const versionSource = referentiel.obtenirVersionsReferentielProgramme()[0];

  const versionTravail = referentiel.creerVersionTravailDepuisVersion(versionSource.obtenirId(), {
    codeVersion: '2026-V2-WIP',
    anneeReference: '2026',
    datePublication: new Date('2026-07-10T00:00:00.000Z'),
    sourceImport: SourceReferentiel.CORRECTION_SYSTEME,
    motifPublication: 'Preparation de la version suivante',
  });

  assert.equal(versionTravail.estPubliee(), false);
  assert.equal(versionTravail.estActive(), false);
  assert.equal(versionTravail.estModifiable(), true);
  assert.equal(versionTravail.obtenirLignes().length, versionSource.obtenirLignes().length);
  assert.notEqual(
    versionTravail.obtenirLignes()[0].obtenirId().obtenirValeur(),
    versionSource.obtenirLignes()[0].obtenirId().obtenirValeur(),
  );
  assert.equal(
    versionTravail.obtenirLignes()[0].obtenirSourceLigne(),
    SourceLigneProgramme.HERITE_ANCIENNE_VERSION,
  );
});

test('creer une version de travail avec un code deja utilise est refuse', () => {
  const referentiel = creerReferentielAvecVersionPubliee();
  const versionSource = referentiel.obtenirVersionsReferentielProgramme()[0];

  assert.throws(
    () => referentiel.creerVersionTravailDepuisVersion(versionSource.obtenirId(), {
      codeVersion: versionSource.obtenirCodeVersion(),
      anneeReference: '2026',
      datePublication: new Date('2026-07-10T00:00:00.000Z'),
    }),
    (erreur: unknown) =>
      erreur instanceof ValidationError
      && erreur.code === 'REFERENTIEL_PROGRAMME_CODE_VERSION_DUPLIQUE',
  );
});

test('une version de travail accepte une nouvelle ligne valide', () => {
  const version = creerVersionTravail();

  version.ajouterLigne(
    creerLigne('003', { ordreAffichage: 3, aExamen: true }),
    TypeStructureEvaluation.SEMESTRIEL,
  );

  assert.equal(version.obtenirLignes().length, 3);
});

test('une version de travail refuse un cours deja present', () => {
  const version = creerVersionTravail();
  const ligneExistante = version.obtenirLignes()[0];
  const ligneDupliquee = new LigneReferentielProgramme(
    new LigneReferentielProgrammeId('50000000-0000-0000-0000-000000000001'),
    ligneExistante.obtenirReferentielCoursId(),
    3,
    true,
    false,
    true,
    SourceLigneProgramme.OFFICIEL,
    creerPonderationSansExamen(),
  );

  assert.throws(
    () => version.ajouterLigne(ligneDupliquee, TypeStructureEvaluation.SEMESTRIEL),
    (erreur: unknown) =>
      erreur instanceof ValidationError
      && erreur.code === 'VERSION_REFERENTIEL_COURS_DUPLIQUE',
  );
});

test('une version de travail refuse un ordre duplique', () => {
  const version = creerVersionTravail();

  assert.throws(
    () => version.modifierLigne(
      version.obtenirLignes()[1].obtenirId(),
      { ordreAffichage: 1 },
      TypeStructureEvaluation.SEMESTRIEL,
    ),
    (erreur: unknown) =>
      erreur instanceof ValidationError
      && erreur.code === 'VERSION_REFERENTIEL_ORDRE_DUPLIQUE',
  );
});

test('une version de travail peut modifier les indicateurs d une ligne', () => {
  const version = creerVersionTravail();
  const ligneCible = version.obtenirLignes()[0];

  version.modifierLigne(
    ligneCible.obtenirId(),
    {
      obligatoire: false,
      estCalculable: false,
      domaine: 'Sciences',
      sousDomaine: 'Maths',
    },
    TypeStructureEvaluation.SEMESTRIEL,
  );

  const ligneModifiee = version.obtenirLignes()[0];
  assert.equal(ligneModifiee.estObligatoire(), false);
  assert.equal(ligneModifiee.estCalculableDansProgramme(), false);
  assert.equal(ligneModifiee.obtenirDomaine(), 'Sciences');
  assert.equal(ligneModifiee.obtenirSousDomaine(), 'Maths');
});

test('une version de travail peut retirer une ligne', () => {
  const version = creerVersionTravail();
  const idLigne = version.obtenirLignes()[1].obtenirId();

  version.retirerLigne(idLigne, TypeStructureEvaluation.SEMESTRIEL);

  assert.equal(version.obtenirLignes().length, 1);
});

test('une version de travail peut reordonner plusieurs lignes', () => {
  const version = creerVersionTravail();
  const [ligne1, ligne2] = version.obtenirLignes();

  version.reordonnerLignes(
    [
      { idLigne: ligne1.obtenirId(), ordreAffichage: 2 },
      { idLigne: ligne2.obtenirId(), ordreAffichage: 1 },
    ],
    TypeStructureEvaluation.SEMESTRIEL,
  );

  const [ligne1Apres, ligne2Apres] = version.obtenirLignes();
  assert.equal(ligne1Apres.obtenirOrdreAffichage(), 2);
  assert.equal(ligne2Apres.obtenirOrdreAffichage(), 1);
});

test('une ligne sans examen ne peut pas recevoir de maxima d examen', () => {
  const version = creerVersionTravail();
  const ligneCible = version.obtenirLignes()[0];

  assert.throws(
    () => version.modifierLigne(
      ligneCible.obtenirId(),
      {
        aExamen: false,
        ponderation: creerPonderationAvecExamen(),
      },
      TypeStructureEvaluation.SEMESTRIEL,
    ),
    (erreur: unknown) =>
      erreur instanceof ValidationError
      && erreur.code === 'PONDERATION_EXAMEN_INVALIDE',
  );
});
