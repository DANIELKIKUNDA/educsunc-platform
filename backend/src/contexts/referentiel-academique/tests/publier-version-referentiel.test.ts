import test from 'node:test';
import assert from 'node:assert/strict';
import { ReferentielProgramme } from '../domain/aggregates/ReferentielProgramme';
import { VersionReferentielProgramme } from '../domain/aggregates/VersionReferentielProgramme';
import { LigneReferentielProgramme } from '../domain/entities/LigneReferentielProgramme';
import { DepotReferentielProgramme } from '../domain/repositories/DepotReferentielProgramme';
import { ClasseAcademiqueId } from '../domain/value-objects/ClasseAcademiqueId';
import { LigneReferentielProgrammeId } from '../domain/value-objects/LigneReferentielProgrammeId';
import { PonderationEvaluation } from '../domain/value-objects/PonderationEvaluation';
import { ReferentielCoursId } from '../domain/value-objects/ReferentielCoursId';
import { ReferentielProgrammeId } from '../domain/value-objects/ReferentielProgrammeId';
import { SourceLigneProgramme } from '../domain/value-objects/SourceLigneProgramme';
import { SourceReferentiel } from '../domain/value-objects/SourceReferentiel';
import { TypeStructureEvaluation } from '../domain/value-objects/TypeStructureEvaluation';
import { PublierVersionReferentiel } from '../application/use-cases/referentiels/PublierVersionReferentiel';
import type { EntreeJournalAuditReferentielAcademique } from '../application/services/ServiceJournalAuditReferentielAcademique';
import { ServiceJournalAuditReferentielAcademique } from '../application/services/ServiceJournalAuditReferentielAcademique';
import { Pagination, ResultatPagine } from '../../../shared/application/Pagination';
import { ReferentielProgrammeId as IdReferentielProgramme } from '../domain/value-objects/ReferentielProgrammeId';
import { ClasseAcademiqueId as IdClasseAcademique } from '../domain/value-objects/ClasseAcademiqueId';
import { VersionReferentielProgrammeId } from '../domain/value-objects/VersionReferentielProgrammeId';

class FauxDepotReferentielProgramme implements DepotReferentielProgramme {
  public readonly referentielProgramme: ReferentielProgramme;
  public nombreSauvegardes = 0;

  constructor(referentielProgramme: ReferentielProgramme) {
    this.referentielProgramme = referentielProgramme;
  }

  public async trouverParId(
    idReferentielProgramme: IdReferentielProgramme,
  ): Promise<ReferentielProgramme | null> {
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
    _idClasseAcademique: IdClasseAcademique,
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

class FauxServiceJournalAuditReferentielAcademique
  implements ServiceJournalAuditReferentielAcademique
{
  public readonly entrees: EntreeJournalAuditReferentielAcademique[] = [];

  public async journaliser(entree: EntreeJournalAuditReferentielAcademique): Promise<void> {
    this.entrees.push(entree);
  }
}

function creerVersionPublieeDeTest(): VersionReferentielProgramme {
  const ligne = new LigneReferentielProgramme(
    new LigneReferentielProgrammeId('00000000-0000-0000-0000-000000000401'),
    new ReferentielCoursId('00000000-0000-0000-0000-000000000402'),
    1,
    true,
    false,
    true,
    SourceLigneProgramme.OFFICIEL,
    new PonderationEvaluation({
      maxP1: 10,
      maxP2: 0,
      maxEX1: 0,
      maxP3: 0,
      maxP4: 0,
      maxEX2: 0,
      maxP5: 0,
      maxP6: 0,
      maxEX3: 0,
    }),
  );
  const version = new VersionReferentielProgramme(
    new VersionReferentielProgrammeId('00000000-0000-0000-0000-000000000300'),
    '2026-V1',
    '2026',
    new Date('2026-03-31T00:00:00.000Z'),
    SourceReferentiel.JSON_OFFICIEL,
    'Publication officielle',
    false,
    new Date('2026-03-31T00:00:00.000Z'),
    [ligne],
  );

  version.publierVersion();

  return version;
}

test('publier une version rattache la version au root et journalise audit', async () => {
  const referentielProgramme = new ReferentielProgramme(
    new ReferentielProgrammeId('00000000-0000-0000-0000-000000000100'),
    new ClasseAcademiqueId('00000000-0000-0000-0000-000000000200'),
    TypeStructureEvaluation.TRIMESTRIEL,
  );
  referentielProgramme.ajouterVersion(creerVersionPublieeDeTest());
  const depotReferentielProgramme = new FauxDepotReferentielProgramme(referentielProgramme);
  const serviceJournalAudit = new FauxServiceJournalAuditReferentielAcademique();
  const casUsage = new PublierVersionReferentiel(
    depotReferentielProgramme,
    undefined,
    serviceJournalAudit,
  );

  const sortie = await casUsage.executer({
    idReferentielProgramme: referentielProgramme.obtenirId().obtenirValeur(),
    codeVersion: '2026-V1',
    anneeReference: '2026',
    datePublication: new Date('2026-03-31T00:00:00.000Z'),
    sourceImport: SourceReferentiel.JSON_OFFICIEL,
    motifPublication: 'Publication officielle',
    publiePar: 'responsable.referentiel',
  });

  assert.equal(depotReferentielProgramme.nombreSauvegardes, 0);
  assert.ok(referentielProgramme.trouverVersionParCode('2026-V1'));
  assert.equal(sortie.versionReferentielProgramme.codeVersion, '2026-V1');
  assert.equal(serviceJournalAudit.entrees.length, 1);
  assert.equal(serviceJournalAudit.entrees[0].action, 'PUBLIER_VERSION_REFERENTIEL');
  assert.equal(
    serviceJournalAudit.entrees[0].idRessource,
    referentielProgramme.trouverVersionParCode('2026-V1')?.obtenirId().obtenirValeur(),
  );
});
