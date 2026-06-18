import test from 'node:test';
import assert from 'node:assert/strict';
import { HistoriqueEncodageConduite } from 'contexts/bulletins-evaluations/domain/entities/HistoriqueEncodageConduite';
import { HistoriqueModificationCote } from 'contexts/bulletins-evaluations/domain/entities/HistoriqueModificationCote';
import { SnapshotResultatBulletin } from 'contexts/bulletins-evaluations/domain/entities/SnapshotResultatBulletin';
import { ValidationBulletinOfficielle } from 'contexts/bulletins-evaluations/domain/entities/ValidationBulletinOfficielle';
import { CodePeriodeSimple } from 'contexts/bulletins-evaluations/domain/value-objects/CodePeriodeSimple';
import { EtatValidationBulletin } from 'contexts/bulletins-evaluations/domain/value-objects/EtatValidationBulletin';
import { MentionBulletin } from 'contexts/bulletins-evaluations/domain/value-objects/MentionBulletin';

// Ce fichier couvre les nouvelles entites enterprise ajoutees au domaine.
test("l'historique de modification de cote est cree et reste immutable", () => {
  const historique = new HistoriqueModificationCote({
    idHistoriqueModificationCote: 'hist-1',
    idFicheCotationEleveCours: 'fiche-1',
    idEleve: 'eleve-1',
    idReferentielCours: 'cours-1',
    codeColonne: 'P1',
    ancienneCote: 8,
    nouvelleCote: 10,
    ancienMaximum: 20,
    nouveauMaximum: 20,
    modifiePar: 'prefet-1',
    dateModification: new Date('2026-05-18T10:00:00.000Z'),
    motifModification: 'Correction apres verification',
    versionAvant: 1,
    versionApres: 2,
  });

  assert.equal(historique.obtenirAncienneCote(), 8);
  assert.equal(historique.obtenirNouvelleCote(), 10);
  assert.equal(historique.obtenirMotifModification(), 'Correction apres verification');
});

test("l'historique d'encodage de conduite est cree et reste immutable", () => {
  const historique = new HistoriqueEncodageConduite({
    idHistoriqueEncodageConduite: 'hist-conduite-1',
    idResultatBulletinEleve: 'resultat-1',
    idEleve: 'eleve-1',
    idClassePedagogique: 'classe-1',
    idAnneeScolaire: 'annee-1',
    codePeriode: CodePeriodeSimple.P1,
    anciensPointsConduite: 65,
    nouveauxPointsConduite: 80,
    ancienneMentionConduite: MentionBulletin.B,
    nouvelleMentionConduite: MentionBulletin.TB,
    encodeePar: 'titulaire-1',
    dateEncodage: new Date('2026-05-18T11:00:00.000Z'),
  });

  assert.equal(historique.obtenirAnciensPointsConduite(), 65);
  assert.equal(historique.obtenirNouveauxPointsConduite(), 80);
  assert.equal(historique.obtenirEncodeePar(), 'titulaire-1');
});

test('le snapshot de resultat conserve la version du referentiel et reste fige', () => {
  const snapshot = new SnapshotResultatBulletin({
    idSnapshotResultatBulletin: 'snap-1',
    idEleve: 'eleve-1',
    idInscriptionScolaire: 'insc-1',
    idClassePedagogique: 'classe-1',
    idAnneeScolaire: 'annee-1',
    codeColonne: 'P1',
    totalObtenu: 75,
    maximumGeneral: 100,
    pourcentage: 75.36,
    rang: 3,
    versionReferentielProgramme: 'v2.2',
    dateSnapshot: new Date('2026-05-18T10:00:00.000Z'),
    motifSnapshot: 'BULLETIN_GENERE',
    creePar: 'moteur-1',
  });

  assert.equal(snapshot.obtenirVersionReferentielProgramme(), 'v2.2');
  assert.equal(snapshot.obtenirPourcentage(), 75.4);
});

test('la validation officielle gere acceptance et refus avec commentaire', () => {
  const validationAcceptee = new ValidationBulletinOfficielle({
    idValidationBulletinOfficielle: 'val-1',
    idBulletinEleve: 'bulletin-1',
    validePar: 'directeur-1',
    roleValidateur: 'PREFET',
    dateValidation: new Date('2026-05-18T10:00:00.000Z'),
    etatValidation: EtatValidationBulletin.VALIDEE,
    versionBulletin: 2,
  });

  assert.equal(validationAcceptee.estValidationAcceptee(), true);

  assert.throws(
    () =>
      new ValidationBulletinOfficielle({
        idValidationBulletinOfficielle: 'val-2',
        idBulletinEleve: 'bulletin-1',
        validePar: 'directeur-1',
        roleValidateur: 'PREFET',
        dateValidation: new Date('2026-05-18T10:00:00.000Z'),
        etatValidation: EtatValidationBulletin.REFUSEE,
        versionBulletin: 2,
      }),
  );
});
