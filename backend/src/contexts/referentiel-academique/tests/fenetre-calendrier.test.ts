import test from 'node:test';
import assert from 'node:assert/strict';
import { DeterminerFenetreCalendrier } from '../application/use-cases/calendriers/DeterminerFenetreCalendrier';
import { CalendrierAcademique } from '../domain/aggregates/CalendrierAcademique';
import { PeriodeCalendrier } from '../domain/entities/PeriodeCalendrier';
import type { DepotCalendrierAcademique } from '../domain/repositories/DepotCalendrierAcademique';
import { AnneeScolaireId } from '../domain/value-objects/AnneeScolaireId';
import { CalendrierAcademiqueId } from '../domain/value-objects/CalendrierAcademiqueId';
import { EcoleId } from '../domain/value-objects/EcoleId';
import { PeriodeCalendrierId } from '../domain/value-objects/PeriodeCalendrierId';
import { TypePeriodeCalendrier } from '../domain/value-objects/TypePeriodeCalendrier';
import { TypeStructureEvaluation } from '../domain/value-objects/TypeStructureEvaluation';

class DepotCalendrierAcademiqueMemoire implements DepotCalendrierAcademique {
  constructor(private readonly calendrierAcademique: CalendrierAcademique | null) {}

  public async trouverParId(_idCalendrierAcademique: CalendrierAcademiqueId): Promise<CalendrierAcademique | null> {
    return this.calendrierAcademique;
  }

  public async trouverParEcoleEtAnnee(
    _idEcole: EcoleId,
    _idAnneeScolaire: AnneeScolaireId,
  ): Promise<CalendrierAcademique | null> {
    return this.calendrierAcademique;
  }

  public async sauvegarder(_calendrierAcademique: CalendrierAcademique): Promise<void> {}
}

test('la fenetre calendrier retrouve la periode courante a une date pedagogique', async () => {
  const calendrierAcademique = creerCalendrierAcademiqueMemoire();
  const useCase = new DeterminerFenetreCalendrier(
    new DepotCalendrierAcademiqueMemoire(calendrierAcademique),
  );

  const sortie = await useCase.executer({
    idEcole: 'ecole-1',
    idAnneeScolaire: 'annee-1',
    dateReference: new Date('2026-09-15T00:00:00.000Z'),
  });

  assert.equal(sortie.fenetreCalendrier?.periodeCourante?.code, 'P1');
  assert.equal(sortie.fenetreCalendrier?.examenCourant, null);
});

test("la fenetre calendrier retrouve l'examen courant a une date d'examen", async () => {
  const calendrierAcademique = creerCalendrierAcademiqueMemoire();
  const useCase = new DeterminerFenetreCalendrier(
    new DepotCalendrierAcademiqueMemoire(calendrierAcademique),
  );

  const sortie = await useCase.executer({
    idEcole: 'ecole-1',
    idAnneeScolaire: 'annee-1',
    dateReference: new Date('2026-12-15T00:00:00.000Z'),
  });

  assert.equal(sortie.fenetreCalendrier?.periodeCourante, null);
  assert.equal(sortie.fenetreCalendrier?.examenCourant?.code, 'EX1');
});

test("la fenetre calendrier retourne l'absence de periode courante hors des bornes configurees", async () => {
  const calendrierAcademique = creerCalendrierAcademiqueMemoire();
  const useCase = new DeterminerFenetreCalendrier(
    new DepotCalendrierAcademiqueMemoire(calendrierAcademique),
  );

  const sortie = await useCase.executer({
    idEcole: 'ecole-1',
    idAnneeScolaire: 'annee-1',
    dateReference: new Date('2026-11-10T00:00:00.000Z'),
  });

  assert.equal(sortie.fenetreCalendrier?.periodeCourante, null);
  assert.equal(sortie.fenetreCalendrier?.examenCourant, null);
});

function creerCalendrierAcademiqueMemoire(): CalendrierAcademique {
  return new CalendrierAcademique(
    new CalendrierAcademiqueId('cal-1'),
    new EcoleId('ecole-1'),
    new AnneeScolaireId('annee-1'),
    TypeStructureEvaluation.SEMESTRIEL,
    new Date('2026-09-01T00:00:00.000Z'),
    new Date('2027-06-30T00:00:00.000Z'),
    [
      new PeriodeCalendrier(
        new PeriodeCalendrierId('periode-p1'),
        'P1',
        'Periode 1',
        1,
        TypePeriodeCalendrier.PERIODE,
        new Date('2026-09-01T00:00:00.000Z'),
        new Date('2026-09-30T23:59:59.999Z'),
      ),
      new PeriodeCalendrier(
        new PeriodeCalendrierId('periode-ex1'),
        'EX1',
        'Examen 1',
        2,
        TypePeriodeCalendrier.EXAMEN,
        new Date('2026-12-10T00:00:00.000Z'),
        new Date('2026-12-20T23:59:59.999Z'),
      ),
    ],
    'admin',
    true,
  );
}
