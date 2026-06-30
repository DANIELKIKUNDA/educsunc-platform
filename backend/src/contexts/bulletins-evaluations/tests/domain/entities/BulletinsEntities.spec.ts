import test from 'node:test';
import assert from 'node:assert/strict';
import { ErreurClassementImpossible } from 'contexts/bulletins-evaluations/domain/exceptions/ErreurClassementImpossible';
import { ErreurProclamationIncoherente } from 'contexts/bulletins-evaluations/domain/exceptions/ErreurProclamationIncoherente';
import { ErreurResultatBulletinIncoherent } from 'contexts/bulletins-evaluations/domain/exceptions/ErreurResultatBulletinIncoherent';
import { CodeColonneBulletin } from 'contexts/bulletins-evaluations/domain/value-objects/CodeColonneBulletin';
import { SexeEleve } from 'contexts/bulletins-evaluations/domain/value-objects/SexeEleve';
import { StatutProclamationEleve } from 'contexts/bulletins-evaluations/domain/value-objects/StatutProclamationEleve';
import { StyleAffichageCote } from 'contexts/bulletins-evaluations/domain/value-objects/StyleAffichageCote';
import { CoteColonneBulletin } from 'contexts/bulletins-evaluations/domain/entities/CoteColonneBulletin';
import { DiagnosticEchec } from 'contexts/bulletins-evaluations/domain/entities/DiagnosticEchec';
import { LigneBulletinEleve } from 'contexts/bulletins-evaluations/domain/entities/LigneBulletinEleve';
import { LigneClassementEleve } from 'contexts/bulletins-evaluations/domain/entities/LigneClassementEleve';
import { LigneProclamationClasse } from 'contexts/bulletins-evaluations/domain/entities/LigneProclamationClasse';

// Ce fichier couvre les transitions et validations des principales entites du domaine.
test('les entites protegeent leurs invariants et transitions', () => {
  const cote = new CoteColonneBulletin({
    idCoteColonneBulletin: 'c1',
    codeColonne: CodeColonneBulletin.P1,
    maximumColonne: 10,
  });
  cote.encoder(4, 'user-1');
  assert.equal(cote.obtenirEstEchec(), true);
  assert.equal(cote.obtenirStyleAffichage(), StyleAffichageCote.ECHEC_ROUGE);

  const ligneBulletin = new LigneBulletinEleve({
    idLigneBulletinEleve: 'lb1',
    idReferentielCours: 'cours-1',
    libelleCours: 'Francais',
    ordreAffichage: 1,
    estCalculable: true,
    aExamen: true,
  });
  ligneBulletin.definirCote(CodeColonneBulletin.P1, 8);
  ligneBulletin.definirTotal(CodeColonneBulletin.TOTAL_GENERAL, 15);
  ligneBulletin.definirStyle(CodeColonneBulletin.P1, StyleAffichageCote.NORMAL);
  assert.equal(ligneBulletin.obtenirCotesColonnes()[CodeColonneBulletin.P1], 8);

  assert.throws(() => new LigneClassementEleve({
    idLigneClassementEleve: 'lc1',
    idEleve: 'eleve-1',
    nomComplet: 'Eleve Test',
    sexe: SexeEleve.M,
    estNonClasse: false,
  }), ErreurClassementImpossible);

  const ligneProclamation = new LigneProclamationClasse({
    idLigneProclamationClasse: 'lp1',
    idEleve: 'eleve-1',
    nomComplet: 'Eleve Test',
    sexe: SexeEleve.F,
    statutProclamation: StatutProclamationEleve.CLASSE,
    rang: 1,
    totalObtenu: 100,
    maximumGeneral: 120,
    pourcentage: 83.33,
  });
  ligneProclamation.definirObservation('Tres bien');
  assert.equal(ligneProclamation.obtenirObservation(), 'Tres bien');

  assert.throws(() => new LigneProclamationClasse({
    idLigneProclamationClasse: 'lp2',
    idEleve: 'eleve-2',
    nomComplet: 'Eleve NC',
    sexe: SexeEleve.M,
    rang: 1,
    statutProclamation: StatutProclamationEleve.NON_CLASSE,
  }), ErreurProclamationIncoherente);

  assert.throws(() => new DiagnosticEchec({
    idDiagnosticEchec: 'd1',
    codeColonne: CodeColonneBulletin.TOTAL_GENERAL,
    nombreEchecs: 1,
    nombreEchecsLegers: 1,
    nombreEchecsProfonds: 1,
    eligiblePerequation: false,
    eligibleRepechage: false,
  }), ErreurResultatBulletinIncoherent);
});
