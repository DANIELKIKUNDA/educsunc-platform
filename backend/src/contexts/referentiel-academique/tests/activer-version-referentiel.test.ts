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
import { ActiverVersionReferentiel } from '../application/use-cases/referentiels/ActiverVersionReferentiel';
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

function creerVersionDeTest(id: string, codeVersion: string, active = false): VersionReferentielProgramme {
  const ligne = new LigneReferentielProgramme(
    new LigneReferentielProgrammeId(`00000000-0000-0000-0000-${id.slice(-12)}`),
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
    new VersionReferentielProgrammeId(id),
    codeVersion,
    '2026',
    new Date('2026-03-31T00:00:00.000Z'),
    SourceReferentiel.JSON_OFFICIEL,
    `${codeVersion} officiel`,
    active,
    new Date('2026-03-31T00:00:00.000Z'),
    [ligne],
  );

  version.publierVersion();

  return version;
}

test('activer une version desactive les autres, persiste et journalise audit', async () => {
  const referentielProgramme = new ReferentielProgramme(
    new ReferentielProgrammeId('00000000-0000-0000-0000-000000000100'),
    new ClasseAcademiqueId('00000000-0000-0000-0000-000000000200'),
    TypeStructureEvaluation.TRIMESTRIEL,
  );
  const version1 = creerVersionDeTest('00000000-0000-0000-0000-000000000301', '2026-V1', true);
  const version2 = creerVersionDeTest('00000000-0000-0000-0000-000000000302', '2026-V2', false);
  referentielProgramme.ajouterVersion(version1);
  referentielProgramme.ajouterVersion(version2);

  const depotReferentielProgramme = new FauxDepotReferentielProgramme(referentielProgramme);
  const serviceJournalAudit = new FauxServiceJournalAuditReferentielAcademique();
  const casUsage = new ActiverVersionReferentiel(
    depotReferentielProgramme,
    undefined,
    serviceJournalAudit,
  );

  const sortie = await casUsage.executer({
    idVersionReferentielProgramme: version2.obtenirId().obtenirValeur(),
    activePar: 'manager.systeme',
  });

  assert.equal(depotReferentielProgramme.nombreSauvegardes, 1);
  assert.equal(referentielProgramme.trouverVersionParCode('2026-V1')?.estActive(), false);
  assert.equal(referentielProgramme.trouverVersionParCode('2026-V2')?.estActive(), true);
  assert.equal(sortie.versionReferentielProgramme.codeVersion, '2026-V2');
  assert.equal(sortie.versionReferentielProgramme.active, true);
  assert.equal(serviceJournalAudit.entrees.length, 1);
  assert.equal(serviceJournalAudit.entrees[0].action, 'ACTIVER_VERSION_REFERENTIEL');
  assert.equal(serviceJournalAudit.entrees[0].acteur, 'manager.systeme');
  assert.equal(serviceJournalAudit.entrees[0].idRessource, version2.obtenirId().obtenirValeur());
});
