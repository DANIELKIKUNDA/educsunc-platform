import test from 'node:test';
import assert from 'node:assert/strict';
import { Money } from '../../../domain/value-objects/Money';
import type { RegistreFinancierClasseReadModel } from '../../../application/read-models/RegistreFinancierClasseReadModel';
import { SyntheseFinanciereClasseQueryRepository } from '../../../infrastructure/persistence/postgres/queries/SyntheseFinanciereClasseQueryRepository';

class RegistreFinancierClasseStub {
  public async consulterRegistreClasse(): Promise<RegistreFinancierClasseReadModel> {
    return {
      idOrganisation: 'ORG-001',
      idEcole: 'ECOLE-001',
      idAnneeScolaire: 'ANNEE-001',
      idClassePedagogique: 'CLASSE-001',
      colonnes: [
        {
          code: 'MOIS_SEPTEMBRE',
          type: 'MOIS',
          libelle: 'Septembre',
          ordre: 1,
          moisScolaire: 'SEPTEMBRE',
          typeFrais: 'FRAIS_MINERVAL',
        },
      ],
      lignes: [
        {
          numeroOrdre: 1,
          idEleve: 'E-1',
          nom: 'Alpha',
          statutScolaire: 'ACTIF',
          cellules: [{
            colonneCode: 'MOIS_SEPTEMBRE',
            montantAttendu: new Money(100, 'CDF'),
            montantPaye: new Money(100, 'CDF'),
            montantExonere: new Money(0, 'CDF'),
            resteARecouvrer: new Money(0, 'CDF'),
            estRedevable: true,
            estEnOrdre: true,
          }],
          situationFinanciere: {
            montantAttendu: new Money(100, 'CDF'),
            montantPaye: new Money(100, 'CDF'),
            montantExonere: new Money(0, 'CDF'),
            resteARecouvrer: new Money(0, 'CDF'),
            estEnOrdre: true,
          },
        },
        {
          numeroOrdre: 2,
          idEleve: 'E-2',
          nom: 'Beta',
          statutScolaire: 'ABANDONNE',
          cellules: [{
            colonneCode: 'MOIS_SEPTEMBRE',
            montantAttendu: new Money(0, 'CDF'),
            montantPaye: new Money(0, 'CDF'),
            montantExonere: new Money(0, 'CDF'),
            resteARecouvrer: new Money(0, 'CDF'),
            estRedevable: false,
            estEnOrdre: false,
            statutAffiche: 'AB',
          }],
          situationFinanciere: {
            montantAttendu: new Money(0, 'CDF'),
            montantPaye: new Money(0, 'CDF'),
            montantExonere: new Money(0, 'CDF'),
            resteARecouvrer: new Money(0, 'CDF'),
            estEnOrdre: false,
          },
        },
      ],
      statistiquesParColonne: [{
        colonneCode: 'MOIS_SEPTEMBRE',
        elevesRedevables: 1,
        montantAttendu: new Money(100, 'CDF'),
        montantPaye: new Money(100, 'CDF'),
        resteARecouvrer: new Money(0, 'CDF'),
        elevesEnOrdre: 1,
        elevesNonEnOrdre: 0,
        tauxRecouvrement: 100,
      }],
    };
  }
}

test('SyntheseFinanciereClasseQueryRepository derive une synthese mensuelle officielle depuis VF-01', async () => {
  const repository = new SyntheseFinanciereClasseQueryRepository(
    new RegistreFinancierClasseStub() as never,
  );

  const lecture = await repository.consulterSyntheseClasse({
    idOrganisation: 'ORG-001',
    idEcole: 'ECOLE-001',
    idAnneeScolaire: 'ANNEE-001',
    idClassePedagogique: 'CLASSE-001',
    typeFrais: 'FRAIS_MINERVAL',
  });

  assert.equal(lecture.lignes.length, 1);
  assert.equal(lecture.lignes[0]?.libelle, 'Septembre');
  assert.equal(lecture.lignes[0]?.effectifTotal, 1);
  assert.equal(lecture.situationActuelle.effectifTotal, 1);
  assert.equal(lecture.situationActuelle.elevesRedevables, 1);
});
