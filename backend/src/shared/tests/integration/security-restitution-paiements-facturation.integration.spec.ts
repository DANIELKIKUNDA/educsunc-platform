import assert from 'node:assert/strict';
import test from 'node:test';
import { AutorisationRestitutionPaiementAdapter } from '../../../app/adapters/AutorisationRestitutionPaiementAdapter';
import { TypeFrais } from '../../../contexts/paiements-facturation/domain/value-objects/TypeFrais';

test("SECURITY aligne la restitution sur la meme doctrine que la perception", async () => {
  const appels: Array<{
    idUtilisateur: string;
    idOrganisation: string;
    idEcole: string;
    idEleve: string;
    typeFrais: TypeFrais;
  }> = [];

  const adaptateur = new AutorisationRestitutionPaiementAdapter({
    async verifierPerceptionPaiement(params) {
      appels.push(params);

      if (params.idUtilisateur === 'enseignant') {
        throw new Error('REFUS');
      }

      if (params.idUtilisateur === 'prefet' && params.typeFrais === TypeFrais.FRAIS_MINERVAL) {
        throw new Error('REFUS_MINERVAL');
      }
    },
  });

  await assert.doesNotReject(() => adaptateur.verifierRestitutionPaiement({
    idUtilisateur: 'caissier',
    idOrganisation: 'ORG-001',
    idEcole: 'ECOLE-001',
    idEleve: 'ELEVE-001',
    typeFrais: TypeFrais.FRAIS_SCOLAIRES,
  }));

  await assert.doesNotReject(() => adaptateur.verifierRestitutionPaiement({
    idUtilisateur: 'prefet',
    idOrganisation: 'ORG-001',
    idEcole: 'ECOLE-001',
    idEleve: 'ELEVE-001',
    typeFrais: TypeFrais.FRAIS_SCOLAIRES,
  }));

  await assert.rejects(() => adaptateur.verifierRestitutionPaiement({
    idUtilisateur: 'prefet',
    idOrganisation: 'ORG-001',
    idEcole: 'ECOLE-001',
    idEleve: 'ELEVE-001',
    typeFrais: TypeFrais.FRAIS_MINERVAL,
  }));

  await assert.rejects(() => adaptateur.verifierRestitutionPaiement({
    idUtilisateur: 'enseignant',
    idOrganisation: 'ORG-001',
    idEcole: 'ECOLE-001',
    idEleve: 'ELEVE-001',
    typeFrais: TypeFrais.FRAIS_SCOLAIRES,
  }));

  assert.deepEqual(appels[0], {
    idUtilisateur: 'caissier',
    idOrganisation: 'ORG-001',
    idEcole: 'ECOLE-001',
    idEleve: 'ELEVE-001',
    typeFrais: TypeFrais.FRAIS_SCOLAIRES,
  });
  assert.equal(appels.length, 4);
});
