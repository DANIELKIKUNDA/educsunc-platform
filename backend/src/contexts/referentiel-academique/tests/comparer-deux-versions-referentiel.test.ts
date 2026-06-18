import test from 'node:test';
import assert from 'node:assert/strict';
import { ReferentielProgramme } from '../domain/aggregates/ReferentielProgramme';
import { VersionReferentielProgramme } from '../domain/aggregates/VersionReferentielProgramme';
import { LigneReferentielProgramme } from '../domain/entities/LigneReferentielProgramme';
import { ComparerDeuxVersionsReferentiel } from '../application/use-cases/referentiels/ComparerDeuxVersionsReferentiel';
import { DepotClasseAcademique } from '../domain/repositories/DepotClasseAcademique';
import { DepotReferentielProgramme } from '../domain/repositories/DepotReferentielProgramme';
import { ClasseAcademique } from '../domain/aggregates/ClasseAcademique';
import { ClasseAcademiqueId } from '../domain/value-objects/ClasseAcademiqueId';
import { LigneReferentielProgrammeId } from '../domain/value-objects/LigneReferentielProgrammeId';
import { OrdreClasse } from '../domain/value-objects/OrdreClasse';
import { PonderationEvaluation } from '../domain/value-objects/PonderationEvaluation';
import { ReferentielCoursId } from '../domain/value-objects/ReferentielCoursId';
import { ReferentielProgrammeId } from '../domain/value-objects/ReferentielProgrammeId';
import { SectionScolaireId } from '../domain/value-objects/SectionScolaireId';
import { SourceLigneProgramme } from '../domain/value-objects/SourceLigneProgramme';
import { SourceReferentiel } from '../domain/value-objects/SourceReferentiel';
import { TypeStructureEvaluation } from '../domain/value-objects/TypeStructureEvaluation';
import { VersionReferentielProgrammeId } from '../domain/value-objects/VersionReferentielProgrammeId';
import { Pagination, ResultatPagine } from '../../../shared/application/Pagination';
import { ClasseAcademiqueId as IdClasseAcademique } from '../domain/value-objects/ClasseAcademiqueId';
import { ReferentielProgrammeId as IdReferentielProgramme } from '../domain/value-objects/ReferentielProgrammeId';

class FauxDepotClasseAcademique implements DepotClasseAcademique {
  constructor(private readonly classeAcademique: ClasseAcademique) {}

  public async trouverParId(id: ClasseAcademiqueId): Promise<ClasseAcademique | null> {
    return this.classeAcademique.obtenirId().estEgal(id) ? this.classeAcademique : null;
  }

  public async trouverParCode(code: string): Promise<ClasseAcademique | null> {
    return this.classeAcademique.obtenirCode() === code ? this.classeAcademique : null;
  }

  public async listerParSection(
    _idSectionScolaire: SectionScolaireId,
    pagination: Pagination,
  ): Promise<ResultatPagine<ClasseAcademique>> {
    return {
      donnees: [this.classeAcademique],
      total: 1,
      page: pagination.page,
      taillePage: pagination.taillePage,
    };
  }

  public async lister(pagination: Pagination): Promise<ResultatPagine<ClasseAcademique>> {
    return {
      donnees: [this.classeAcademique],
      total: 1,
      page: pagination.page,
      taillePage: pagination.taillePage,
    };
  }

  public async sauvegarder(): Promise<void> {}
}

class FauxDepotReferentielProgramme implements DepotReferentielProgramme {
  constructor(private readonly referentielProgramme: ReferentielProgramme) {}

  public async trouverParId(
    idReferentielProgramme: IdReferentielProgramme,
  ): Promise<ReferentielProgramme | null> {
    return this.referentielProgramme.obtenirId().estEgal(idReferentielProgramme)
      ? this.referentielProgramme
      : null;
  }

  public async trouverParClasseAcademique(
    idClasseAcademique: IdClasseAcademique,
  ): Promise<ReferentielProgramme | null> {
    return this.referentielProgramme.obtenirClasseAcademiqueId().estEgal(idClasseAcademique)
      ? this.referentielProgramme
      : null;
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

  public async sauvegarder(): Promise<void> {}
}

function creerVersionPubliee(id: string, codeVersion: string, ordreAffichage: number): VersionReferentielProgramme {
  const ligne = new LigneReferentielProgramme(
    new LigneReferentielProgrammeId(`00000000-0000-0000-0000-${id.slice(-12)}`),
    new ReferentielCoursId('00000000-0000-0000-0000-000000000402'),
    ordreAffichage,
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
    false,
    new Date('2026-03-31T00:00:00.000Z'),
    [ligne],
  );

  version.publierVersion();

  return version;
}

test('comparer deux versions de referentiel retourne les differences de structure attendues', async () => {
  const classeAcademique = new ClasseAcademique(
    new ClasseAcademiqueId('00000000-0000-0000-0000-000000000200'),
    new SectionScolaireId('SECONDAIRE'),
    'H4',
    '4e Humanites',
    new OrdreClasse(4),
    'SECONDAIRE',
    false,
    false,
    TypeStructureEvaluation.SEMESTRIEL,
    undefined,
    true,
    new Date('2026-03-31T00:00:00.000Z'),
    undefined,
    1,
    false,
    false,
    false,
  );
  const referentielProgramme = new ReferentielProgramme(
    new ReferentielProgrammeId('00000000-0000-0000-0000-000000000100'),
    classeAcademique.obtenirId(),
    TypeStructureEvaluation.TRIMESTRIEL,
  );
  referentielProgramme.ajouterVersion(
    creerVersionPubliee('00000000-0000-0000-0000-000000000301', '2026-V1', 1),
  );
  referentielProgramme.ajouterVersion(
    creerVersionPubliee('00000000-0000-0000-0000-000000000302', '2026-V2', 2),
  );

  const casUsage = new ComparerDeuxVersionsReferentiel(
    new FauxDepotReferentielProgramme(referentielProgramme),
    new FauxDepotClasseAcademique(classeAcademique),
  );

  const sortie = await casUsage.executer({
    idClasseAcademique: classeAcademique.obtenirId().obtenirValeur(),
    versionReferentielSource: '2026-V1',
    versionReferentielCible: '2026-V2',
  });

  assert.equal(sortie.versionReferentielSource, '2026-V1');
  assert.equal(sortie.versionReferentielCible, '2026-V2');
  assert.equal(sortie.differences.length, 1);
});
