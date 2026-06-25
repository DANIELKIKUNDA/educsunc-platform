import test from 'node:test';
import assert from 'node:assert/strict';
import {
  construirePayloadInformationsInstitutionnellesEcole,
  validerEnregistrementInformationsInstitutionnellesEcole,
} from '../../../scripts/MettreAJourInformationsInstitutionnellesEcoles.shared';

test('valide un enregistrement institutionnel complet et nettoie les champs', () => {
  const enregistrement = validerEnregistrementInformationsInstitutionnellesEcole(
    {
      idEcole: ' ecole-1 ',
      sigle: ' CAT ',
      ville: ' Lubumbashi ',
      communeOuTerritoire: ' Kampemba ',
    },
    0,
  );

  assert.deepEqual(enregistrement, {
    idEcole: 'ecole-1',
    sigle: 'CAT',
    adresse: undefined,
    telephone: undefined,
    email: undefined,
    provinceEducationnelle: undefined,
    ville: 'Lubumbashi',
    communeOuTerritoire: 'Kampemba',
  });
});

test('refuse un enregistrement sans aucune information institutionnelle', () => {
  assert.throws(
    () =>
      validerEnregistrementInformationsInstitutionnellesEcole(
        {
          idEcole: 'ecole-1',
        },
        0,
      ),
    /au moins une information institutionnelle/i,
  );
});

test('construit un payload minimal sans injecter des champs absents', () => {
  const payload = construirePayloadInformationsInstitutionnellesEcole({
    idEcole: 'ecole-1',
    provinceEducationnelle: 'Haut-Katanga 1',
    ville: 'Lubumbashi',
  });

  assert.deepEqual(payload, {
    provinceEducationnelle: 'Haut-Katanga 1',
    ville: 'Lubumbashi',
  });
});
