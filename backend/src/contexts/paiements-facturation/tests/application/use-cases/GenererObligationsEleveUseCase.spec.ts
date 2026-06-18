import test from 'node:test';
import assert from 'node:assert/strict';
import { GenererObligationsEleveUseCase } from '../../../application/use-cases/obligations/GenererObligationsEleveUseCase';
import { GrilleTarification } from '../../../domain/aggregates/GrilleTarification';
import { CategorieTechnique } from '../../../domain/value-objects/CategorieTechnique';
import { Money } from '../../../domain/value-objects/Money';
import { TypeFrais } from '../../../domain/value-objects/TypeFrais';

class DepotGrilleTarificationMemoire {
  constructor(private readonly grilles: GrilleTarification[]) {}

  public async listerActivesParEcoleEtAnnee(idEcole: string, idAnneeScolaire: string) {
    return this.grilles.filter((grille) =>
      grille.obtenirIdEcole() === idEcole
      && grille.obtenirIdAnneeScolaire() === idAnneeScolaire
      && grille.obtenirActif());
  }
}

class DepotObligationMemoire {
  public obligations: Array<{ libelle: string }> = [];

  public async listerParEleveEtAnnee(): Promise<never[]> {
    return [];
  }

  public async sauvegarder(obligation: { obtenirLibelle(): string }): Promise<void> {
    this.obligations.push({ libelle: obligation.obtenirLibelle() });
  }
}

test('GenererObligationsEleve applique les criteres reels de grille a la classe', async () => {
  const depotObligation = new DepotObligationMemoire();
  const casUsage = new GenererObligationsEleveUseCase(
    {
      async consulterEleve() {
        return { idEleve: 'ELEVE-001', idEcole: 'ECOLE-001', idOrganisation: 'ORG-001' };
      },
      async consulterInscriptionActive() {
        return null;
      },
      async consulterClasseActiveEleve() {
        return {
          idClassePedagogique: 'CLASSE-001',
          idEcole: 'ECOLE-001',
          idAnneeScolaire: 'AN-001',
        };
      },
      async consulterFamilleEleve() {
        return null;
      },
      async verifierStatutScolaire() {
        return { idEleve: 'ELEVE-001', statut: 'ACTIF', actif: true };
      },
    },
    {
      async consulterReglesFraisClasse() {
        return {
          idClassePedagogique: 'CLASSE-001',
          section: 'SECONDAIRE',
          optionEstTechnique: true,
          optionCategorieTechnique: 'GROUPE_1',
          estClasseTENASOSP: false,
          estClasseEXETAT: true,
          estClasseFinaliste: true,
          categorieFraisEtat: 'SECONDAIRE_TECHNIQUE',
        };
      },
    },
    {
      async sauvegarder() {},
      async trouverParId() { return null; },
      async trouverActifParEcole() { return null; },
    } as never,
    new DepotGrilleTarificationMemoire([
      GrilleTarification.creer({
        idGrilleTarification: 'GRILLE-BASE',
        idEcole: 'ECOLE-001',
        idAnneeScolaire: 'AN-001',
        typeFrais: TypeFrais.FRAIS_SCOLAIRES,
        libelle: 'Frais scolaires',
        montant: new Money(50000, 'CDF'),
        obligatoire: true,
        actif: true,
        creePar: 'UTIL-ADMIN',
      }),
      GrilleTarification.creer({
        idGrilleTarification: 'GRILLE-G1',
        idEcole: 'ECOLE-001',
        idAnneeScolaire: 'AN-001',
        typeFrais: TypeFrais.FRAIS_TECHNIQUES,
        libelle: 'Frais techniques G1',
        montant: new Money(25000, 'CDF'),
        categorieTechnique: CategorieTechnique.GROUPE_1,
        obligatoire: true,
        actif: true,
        creePar: 'UTIL-ADMIN',
      }),
      GrilleTarification.creer({
        idGrilleTarification: 'GRILLE-G2',
        idEcole: 'ECOLE-001',
        idAnneeScolaire: 'AN-001',
        typeFrais: TypeFrais.FRAIS_TECHNIQUES,
        libelle: 'Frais techniques G2',
        montant: new Money(25000, 'CDF'),
        categorieTechnique: CategorieTechnique.GROUPE_2,
        obligatoire: true,
        actif: true,
        creePar: 'UTIL-ADMIN',
      }),
      GrilleTarification.creer({
        idGrilleTarification: 'GRILLE-TENASOSP',
        idEcole: 'ECOLE-001',
        idAnneeScolaire: 'AN-001',
        typeFrais: TypeFrais.FRAIS_PARTICIPATION_TENASOSP,
        libelle: 'Frais TENASOSP',
        montant: new Money(10000, 'CDF'),
        estClasseTENASOSP: true,
        obligatoire: true,
        actif: true,
        creePar: 'UTIL-ADMIN',
      }),
      GrilleTarification.creer({
        idGrilleTarification: 'GRILLE-EXETAT',
        idEcole: 'ECOLE-001',
        idAnneeScolaire: 'AN-001',
        typeFrais: TypeFrais.FRAIS_PARTICIPATION_EXETAT,
        libelle: 'Frais EXETAT',
        montant: new Money(12000, 'CDF'),
        estClasseEXETAT: true,
        obligatoire: true,
        actif: true,
        creePar: 'UTIL-ADMIN',
      }),
    ]) as never,
    depotObligation as never,
  );

  const obligations = await casUsage.executer({
    idEleve: 'ELEVE-001',
    idInscriptionScolaire: 'INS-001',
    idEcole: 'ECOLE-001',
    idAnneeScolaire: 'AN-001',
    creePar: 'UTIL-ADMIN',
  });

  assert.deepEqual(
    obligations.map((obligation) => obligation.libelle),
    ['Frais scolaires', 'Frais techniques G1', 'Frais EXETAT'],
  );
});
