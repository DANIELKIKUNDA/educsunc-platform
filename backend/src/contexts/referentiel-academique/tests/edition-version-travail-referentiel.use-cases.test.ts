import test from 'node:test';
import assert from 'node:assert/strict';
import { Pagination, ResultatPagine } from '../../../shared/application/Pagination';
import { ReferentielProgramme } from '../domain/aggregates/ReferentielProgramme';
import { VersionReferentielProgramme } from '../domain/aggregates/VersionReferentielProgramme';
import { MigrationReferentielProgramme } from '../domain/aggregates/MigrationReferentielProgramme';
import { LigneReferentielProgramme } from '../domain/entities/LigneReferentielProgramme';
import { ErreurMigrationImpossible } from '../domain/exceptions/ErreurMigrationImpossible';
import { DepotMigrationReferentielProgramme } from '../domain/repositories/DepotMigrationReferentielProgramme';
import { DepotReferentielProgramme } from '../domain/repositories/DepotReferentielProgramme';
import { ClasseAcademiqueId } from '../domain/value-objects/ClasseAcademiqueId';
import { LigneReferentielProgrammeId } from '../domain/value-objects/LigneReferentielProgrammeId';
import { PonderationEvaluation } from '../domain/value-objects/PonderationEvaluation';
import { ProgrammeNiveauId } from '../domain/value-objects/ProgrammeNiveauId';
import { ReferentielCoursId } from '../domain/value-objects/ReferentielCoursId';
import { ReferentielProgrammeId } from '../domain/value-objects/ReferentielProgrammeId';
import { SourceLigneProgramme } from '../domain/value-objects/SourceLigneProgramme';
import { SourceReferentiel } from '../domain/value-objects/SourceReferentiel';
import { TypeStructureEvaluation } from '../domain/value-objects/TypeStructureEvaluation';
import { VersionReferentielProgrammeId } from '../domain/value-objects/VersionReferentielProgrammeId';
import {
  AjouterLigneVersionReferentielProgramme,
  CreerVersionTravailReferentielDepuisVersion,
  ModifierLigneVersionReferentielProgramme,
  ModifierPonderationLigneVersionReferentielProgramme,
  ReordonnerLignesVersionReferentielProgramme,
  RetirerLigneVersionReferentielProgramme,
  VerifierCoherenceVersionReferentielAvantPublication,
} from '../application/use-cases/referentiels';
import type { EntreeJournalAuditReferentielAcademique } from '../application/services/ServiceJournalAuditReferentielAcademique';
import { ServiceJournalAuditReferentielAcademique } from '../application/services/ServiceJournalAuditReferentielAcademique';

class FauxDepotReferentielProgramme implements DepotReferentielProgramme {
  public readonly referentielProgramme: ReferentielProgramme;
  public nombreSauvegardes = 0;

  constructor(referentielProgramme: ReferentielProgramme) {
    this.referentielProgramme = referentielProgramme;
  }

  public async trouverParId(idReferentielProgramme: ReferentielProgrammeId): Promise<ReferentielProgramme | null> {
    return this.referentielProgramme.obtenirId().estEgal(idReferentielProgramme)
      ? this.referentielProgramme
      : null;
  }

  public async trouverParClasseAcademique(): Promise<ReferentielProgramme | null> {
    return this.referentielProgramme;
  }

  public async trouverParIdVersion(
    idVersionReferentielProgramme: VersionReferentielProgrammeId,
  ): Promise<ReferentielProgramme | null> {
    return this.referentielProgramme.trouverVersionParId(idVersionReferentielProgramme) === null
      ? null
      : this.referentielProgramme;
  }

  public async listerParClasseAcademique(
    _idClasseAcademique: ClasseAcademiqueId,
    pagination: Pagination,
  ): Promise<ResultatPagine<ReferentielProgramme>> {
    return {
      donnees: [this.referentielProgramme],
      total: 1,
      page: pagination.page,
      taillePage: pagination.taillePage,
    };
  }

  public async sauvegarder(): Promise<void> {
    this.nombreSauvegardes += 1;
  }
}

class FauxDepotMigrationReferentielProgramme implements DepotMigrationReferentielProgramme {
  public versionsEngagees = new Set<string>();

  public async trouverParId(): Promise<MigrationReferentielProgramme | null> {
    return null;
  }

  public async listerParProgrammeNiveau(
    _idProgrammeNiveau: ProgrammeNiveauId,
    pagination: Pagination,
  ): Promise<ResultatPagine<MigrationReferentielProgramme>> {
    return {
      donnees: [],
      total: 0,
      page: pagination.page,
      taillePage: pagination.taillePage,
    };
  }

  public async estVersionEngagee(
    idVersionReferentielProgramme: VersionReferentielProgrammeId,
  ): Promise<boolean> {
    return this.versionsEngagees.has(idVersionReferentielProgramme.obtenirValeur());
  }

  public async sauvegarder(): Promise<void> {
    return Promise.resolve();
  }
}

class FauxServiceJournalAuditReferentielAcademique
  implements ServiceJournalAuditReferentielAcademique
{
  public readonly entrees: EntreeJournalAuditReferentielAcademique[] = [];

  public async journaliser(entree: EntreeJournalAuditReferentielAcademique): Promise<void> {
    this.entrees.push(entree);
  }
}

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
  idLigne: string,
  idCours: string,
  ordreAffichage: number,
  aExamen = false,
): LigneReferentielProgramme {
  return new LigneReferentielProgramme(
    new LigneReferentielProgrammeId(idLigne),
    new ReferentielCoursId(idCours),
    ordreAffichage,
    true,
    aExamen,
    true,
    SourceLigneProgramme.OFFICIEL,
    aExamen ? creerPonderationAvecExamen() : creerPonderationSansExamen(),
  );
}

function creerReferentielAvecVersionPubliee(): ReferentielProgramme {
  const version = new VersionReferentielProgramme(
    new VersionReferentielProgrammeId('70000000-0000-0000-0000-000000000001'),
    '2026-V1',
    '2026',
    new Date('2026-06-01T00:00:00.000Z'),
    SourceReferentiel.JSON_OFFICIEL,
    'Publication officielle',
    true,
    new Date('2026-06-01T00:00:00.000Z'),
    [
      creerLigne(
        '71000000-0000-0000-0000-000000000001',
        '72000000-0000-0000-0000-000000000001',
        1,
      ),
    ],
    false,
  );

  version.publierVersion();

  const referentiel = new ReferentielProgramme(
    new ReferentielProgrammeId('73000000-0000-0000-0000-000000000001'),
    new ClasseAcademiqueId('74000000-0000-0000-0000-000000000001'),
    TypeStructureEvaluation.SEMESTRIEL,
  );
  referentiel.ajouterVersion(version);

  return referentiel;
}

function creerVersionTravail(referentiel: ReferentielProgramme): VersionReferentielProgramme {
  return referentiel.creerVersionTravailDepuisVersion(
    referentiel.obtenirVersionsReferentielProgramme()[0].obtenirId(),
    {
      codeVersion: '2026-V2-WIP',
      anneeReference: '2026',
      datePublication: new Date('2026-07-01T00:00:00.000Z'),
      sourceImport: SourceReferentiel.CORRECTION_SYSTEME,
      motifPublication: 'Preparation plateforme',
    },
  );
}

test('creer une version de travail depuis une version publiee fonctionne cote application', async () => {
  const referentiel = creerReferentielAvecVersionPubliee();
  const depotReferentiel = new FauxDepotReferentielProgramme(referentiel);
  const depotMigration = new FauxDepotMigrationReferentielProgramme();
  const audit = new FauxServiceJournalAuditReferentielAcademique();
  const casUsage = new CreerVersionTravailReferentielDepuisVersion(
    depotReferentiel,
    depotMigration,
    undefined,
    audit,
  );

  const sortie = await casUsage.executer({
    idVersionSource: referentiel.obtenirVersionsReferentielProgramme()[0].obtenirId().obtenirValeur(),
    codeVersion: '2026-V2-WIP-APP',
    anneeReference: '2026',
    datePublication: new Date('2026-07-10T00:00:00.000Z'),
    sourceImport: SourceReferentiel.CORRECTION_SYSTEME,
    motifPublication: 'Nouvelle base de travail',
    creePar: 'manager.systeme',
  });

  assert.equal(depotReferentiel.nombreSauvegardes, 1);
  assert.equal(sortie.versionReferentielProgramme.publiee, false);
  assert.equal(sortie.versionReferentielProgramme.active, false);
  assert.equal(audit.entrees.length, 1);
});

test('ajouter une ligne sur une version de travail sauvegarde et journalise', async () => {
  const referentiel = creerReferentielAvecVersionPubliee();
  const versionTravail = creerVersionTravail(referentiel);
  const depotReferentiel = new FauxDepotReferentielProgramme(referentiel);
  const depotMigration = new FauxDepotMigrationReferentielProgramme();
  const audit = new FauxServiceJournalAuditReferentielAcademique();
  const casUsage = new AjouterLigneVersionReferentielProgramme(
    depotReferentiel,
    depotMigration,
    undefined,
    audit,
  );

  const sortie = await casUsage.executer({
    idVersionReferentielProgramme: versionTravail.obtenirId().obtenirValeur(),
    idReferentielCours: '72000000-0000-0000-0000-000000000099',
    ordreAffichage: 2,
    obligatoire: true,
    aExamen: false,
    estCalculable: true,
    ponderation: creerPonderationSansExamen().obtenirValeurs(),
    ajouteePar: 'manager.systeme',
  });

  assert.equal(depotReferentiel.nombreSauvegardes, 1);
  assert.equal(sortie.versionReferentielProgramme.lignes.length, 2);
  assert.equal(audit.entrees[0].action, 'AJOUTER_LIGNE_VERSION_REFERENTIEL_PROGRAMME');
});

test('une version engagee dans une migration est refusee en modification', async () => {
  const referentiel = creerReferentielAvecVersionPubliee();
  const versionTravail = creerVersionTravail(referentiel);
  const depotReferentiel = new FauxDepotReferentielProgramme(referentiel);
  const depotMigration = new FauxDepotMigrationReferentielProgramme();
  depotMigration.versionsEngagees.add(versionTravail.obtenirId().obtenirValeur());
  const casUsage = new ModifierLigneVersionReferentielProgramme(
    depotReferentiel,
    depotMigration,
  );

  await assert.rejects(
    () => casUsage.executer({
      idVersionReferentielProgramme: versionTravail.obtenirId().obtenirValeur(),
      idLigneReferentielProgramme: versionTravail.obtenirLignes()[0].obtenirId().obtenirValeur(),
      obligatoire: false,
      modifieePar: 'manager.systeme',
    }),
    (erreur: unknown) => erreur instanceof ErreurMigrationImpossible,
  );
});

test('reordonner les lignes d une version de travail fonctionne cote application', async () => {
  const referentiel = creerReferentielAvecVersionPubliee();
  const versionTravail = creerVersionTravail(referentiel);
  const depotReferentiel = new FauxDepotReferentielProgramme(referentiel);
  const depotMigration = new FauxDepotMigrationReferentielProgramme();
  const audit = new FauxServiceJournalAuditReferentielAcademique();
  const ajoutLigne = new AjouterLigneVersionReferentielProgramme(depotReferentiel, depotMigration);
  await ajoutLigne.executer({
    idVersionReferentielProgramme: versionTravail.obtenirId().obtenirValeur(),
    idReferentielCours: '72000000-0000-0000-0000-000000000100',
    ordreAffichage: 2,
    obligatoire: true,
    aExamen: false,
    estCalculable: true,
    ponderation: creerPonderationSansExamen().obtenirValeurs(),
    ajouteePar: 'manager.systeme',
  });

  const casUsage = new ReordonnerLignesVersionReferentielProgramme(
    depotReferentiel,
    depotMigration,
    undefined,
    audit,
  );

  const lignesAvant = versionTravail.obtenirLignes();
  const sortie = await casUsage.executer({
    idVersionReferentielProgramme: versionTravail.obtenirId().obtenirValeur(),
    lignes: [
      {
        idLigneReferentielProgramme: lignesAvant[0].obtenirId().obtenirValeur(),
        ordreAffichage: 2,
      },
      {
        idLigneReferentielProgramme: lignesAvant[1].obtenirId().obtenirValeur(),
        ordreAffichage: 1,
      },
    ],
    reordonneePar: 'manager.systeme',
  });

  assert.equal(sortie.versionReferentielProgramme.lignes[0].ordreAffichage, 2);
  assert.equal(sortie.versionReferentielProgramme.lignes[1].ordreAffichage, 1);
  assert.equal(audit.entrees[0].action, 'REORDONNER_LIGNES_VERSION_REFERENTIEL_PROGRAMME');
});

test('modifier la ponderation d une ligne de travail fonctionne cote application', async () => {
  const referentiel = creerReferentielAvecVersionPubliee();
  const versionTravail = creerVersionTravail(referentiel);
  const depotReferentiel = new FauxDepotReferentielProgramme(referentiel);
  const depotMigration = new FauxDepotMigrationReferentielProgramme();
  const audit = new FauxServiceJournalAuditReferentielAcademique();
  const casUsage = new ModifierPonderationLigneVersionReferentielProgramme(
    depotReferentiel,
    depotMigration,
    undefined,
    audit,
  );

  const sortie = await casUsage.executer({
    idVersionReferentielProgramme: versionTravail.obtenirId().obtenirValeur(),
    idLigneReferentielProgramme: versionTravail.obtenirLignes()[0].obtenirId().obtenirValeur(),
    ponderation: {
      maxP1: 15,
      maxP2: 10,
      maxEX1: 0,
      maxP3: 10,
      maxP4: 10,
      maxEX2: 0,
      maxP5: 0,
      maxP6: 0,
      maxEX3: 0,
    },
    modifieePar: 'manager.systeme',
  });

  assert.equal(sortie.versionReferentielProgramme.lignes[0].ponderation.maxP1, 15);
  assert.equal(audit.entrees[0].action, 'MODIFIER_PONDERATION_LIGNE_VERSION_REFERENTIEL_PROGRAMME');
});

test('retirer une ligne de travail fonctionne cote application', async () => {
  const referentiel = creerReferentielAvecVersionPubliee();
  const versionTravail = creerVersionTravail(referentiel);
  const depotReferentiel = new FauxDepotReferentielProgramme(referentiel);
  const depotMigration = new FauxDepotMigrationReferentielProgramme();
  const audit = new FauxServiceJournalAuditReferentielAcademique();
  const ajoutLigne = new AjouterLigneVersionReferentielProgramme(depotReferentiel, depotMigration);
  await ajoutLigne.executer({
    idVersionReferentielProgramme: versionTravail.obtenirId().obtenirValeur(),
    idReferentielCours: '72000000-0000-0000-0000-000000000101',
    ordreAffichage: 2,
    obligatoire: true,
    aExamen: false,
    estCalculable: true,
    ponderation: creerPonderationSansExamen().obtenirValeurs(),
    ajouteePar: 'manager.systeme',
  });

  const ligneRetiree = versionTravail.obtenirLignes()[1];
  const casUsage = new RetirerLigneVersionReferentielProgramme(
    depotReferentiel,
    depotMigration,
    undefined,
    audit,
  );

  const sortie = await casUsage.executer({
    idVersionReferentielProgramme: versionTravail.obtenirId().obtenirValeur(),
    idLigneReferentielProgramme: ligneRetiree.obtenirId().obtenirValeur(),
    retireePar: 'manager.systeme',
  });

  assert.equal(sortie.versionReferentielProgramme.lignes.length, 1);
  assert.equal(audit.entrees[0].action, 'RETIRER_LIGNE_VERSION_REFERENTIEL_PROGRAMME');
});

test('verifier la coherence d une version de travail journalise une verification explicite', async () => {
  const referentiel = creerReferentielAvecVersionPubliee();
  const versionTravail = creerVersionTravail(referentiel);
  const depotReferentiel = new FauxDepotReferentielProgramme(referentiel);
  const depotMigration = new FauxDepotMigrationReferentielProgramme();
  const audit = new FauxServiceJournalAuditReferentielAcademique();
  const casUsage = new VerifierCoherenceVersionReferentielAvantPublication(
    depotReferentiel,
    depotMigration,
    undefined,
    audit,
  );

  const sortie = await casUsage.executer({
    idVersionReferentielProgramme: versionTravail.obtenirId().obtenirValeur(),
    verifieePar: 'manager.systeme',
  });

  assert.equal(sortie.estCoherente, true);
  assert.deepEqual(sortie.erreurs, []);
  assert.equal(audit.entrees[0].action, 'VERIFIER_COHERENCE_VERSION_REFERENTIEL');
});
