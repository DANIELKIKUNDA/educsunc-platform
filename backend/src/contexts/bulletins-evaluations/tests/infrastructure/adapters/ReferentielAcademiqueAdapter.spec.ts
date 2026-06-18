import test from 'node:test';
import assert from 'node:assert/strict';
import { ReferentielAcademiqueAdapter } from 'contexts/bulletins-evaluations/infrastructure/adapters/ReferentielAcademiqueAdapter';
import { CodeColonneBulletin } from 'contexts/bulletins-evaluations/domain/value-objects/CodeColonneBulletin';
import { TypeStructureEvaluation } from 'contexts/bulletins-evaluations/domain/value-objects/TypeStructureEvaluation';
import type {
  CoursReferentielDTO,
  ReferenceProgrammeNiveauDTO,
} from 'contexts/bulletins-evaluations/application/ports/out/ReferentielAcademiquePort';
import type {
  ReferentielAcademiqueLectureRepository,
} from 'contexts/bulletins-evaluations/infrastructure/adapters/ReferentielAcademiqueAdapter';

class ReferentielAcademiqueLectureRepositoryMemoire
  implements ReferentielAcademiqueLectureRepository
{
  public derniereReferenceProgramme: ReferenceProgrammeNiveauDTO | null = null;

  public async consulterProgrammeNiveau(referenceProgramme: ReferenceProgrammeNiveauDTO) {
    this.derniereReferenceProgramme = referenceProgramme;

    return {
      idProgrammeNiveau: referenceProgramme.idProgrammeNiveau,
      typeStructureEvaluation: TypeStructureEvaluation.SEMESTRIEL,
      versionReferentielProgramme: 'version-ref-1',
      statutProgrammeNiveau: 'VALIDE' as const,
      lignes: [
        {
          idReferentielCours: 'cours-2',
          ordreAffichage: 2,
          estCalculable: false,
          aExamen: false,
        },
        {
          idReferentielCours: 'cours-1',
          ordreAffichage: 1,
          estCalculable: true,
          aExamen: true,
        },
      ],
    };
  }

  public async consulterCours(idReferentielCours: string): Promise<CoursReferentielDTO | null> {
    const cours: Record<string, CoursReferentielDTO> = {
      'cours-1': {
        idReferentielCours: 'cours-1',
        codeCours: 'MATH',
        libelleCours: 'Mathematiques',
        estCalculable: true,
        aExamen: true,
      },
      'cours-2': {
        idReferentielCours: 'cours-2',
        codeCours: 'FR',
        libelleCours: 'Francais',
        estCalculable: true,
        aExamen: true,
      },
    };

    return cours[idReferentielCours] ?? null;
  }
}

test('l adaptateur referentiel retourne le programme local et ses cours reels', async () => {
  const repository = new ReferentielAcademiqueLectureRepositoryMemoire();
  const adapter = new ReferentielAcademiqueAdapter(repository);
  const referenceProgramme = {
    idProgrammeNiveau: 'programme-1',
    idEcole: 'ecole-1',
  };

  const programme = await adapter.consulterProgrammeNiveau(referenceProgramme);
  const cours = await adapter.listerCoursProgramme(referenceProgramme);

  assert.deepEqual(repository.derniereReferenceProgramme, referenceProgramme);
  assert.deepEqual(programme, {
    idProgrammeNiveau: 'programme-1',
    typeStructureEvaluation: TypeStructureEvaluation.SEMESTRIEL,
    versionReferentielProgramme: 'version-ref-1',
    statutProgrammeNiveau: 'VALIDE',
  });
  assert.deepEqual(cours, [
    {
      idReferentielCours: 'cours-1',
      codeCours: 'MATH',
      libelleCours: 'Mathematiques',
      ordreAffichage: 1,
      estCalculable: true,
      aExamen: true,
    },
    {
      idReferentielCours: 'cours-2',
      codeCours: 'FR',
      libelleCours: 'Francais',
      ordreAffichage: 2,
      estCalculable: false,
      aExamen: false,
    },
  ]);
});

test('l adaptateur referentiel derive les colonnes autorisees selon la structure', async () => {
  const adapter = new ReferentielAcademiqueAdapter(
    new ReferentielAcademiqueLectureRepositoryMemoire(),
  );

  const colonnesSemestrielles = await adapter.listerColonnesAutorisees(
    TypeStructureEvaluation.SEMESTRIEL,
  );
  const colonnesTrimestrielles = await adapter.listerColonnesAutorisees(
    TypeStructureEvaluation.TRIMESTRIEL,
  );

  assert.deepEqual(colonnesSemestrielles, [
    CodeColonneBulletin.P1,
    CodeColonneBulletin.P2,
    CodeColonneBulletin.EX1,
    CodeColonneBulletin.TOTAL_S1,
    CodeColonneBulletin.P3,
    CodeColonneBulletin.P4,
    CodeColonneBulletin.EX2,
    CodeColonneBulletin.TOTAL_S2,
    CodeColonneBulletin.TOTAL_GENERAL,
  ]);
  assert.deepEqual(colonnesTrimestrielles, [
    CodeColonneBulletin.P1,
    CodeColonneBulletin.P2,
    CodeColonneBulletin.EX1,
    CodeColonneBulletin.TOTAL_T1,
    CodeColonneBulletin.P3,
    CodeColonneBulletin.P4,
    CodeColonneBulletin.EX2,
    CodeColonneBulletin.TOTAL_T2,
    CodeColonneBulletin.P5,
    CodeColonneBulletin.P6,
    CodeColonneBulletin.EX3,
    CodeColonneBulletin.TOTAL_T3,
    CodeColonneBulletin.TOTAL_GENERAL,
  ]);
});
