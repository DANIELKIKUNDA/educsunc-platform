import test from 'node:test';
import assert from 'node:assert/strict';
import { ConsulterBulletinEleveUseCase } from 'contexts/bulletins-evaluations/application/use-cases/ConsulterBulletinEleve/ConsulterBulletinEleveUseCase';
import { ConsulterHistoriqueBulletinUseCase } from 'contexts/bulletins-evaluations/application/use-cases/ConsulterHistoriqueBulletin/ConsulterHistoriqueBulletinUseCase';
import { EncoderCoteUseCase } from 'contexts/bulletins-evaluations/application/use-cases/EncoderCote/EncoderCoteUseCase';
import { GenererBulletinEleveUseCase } from 'contexts/bulletins-evaluations/application/use-cases/GenererBulletinEleve/GenererBulletinEleveUseCase';
import { GenererProclamationClasseUseCase } from 'contexts/bulletins-evaluations/application/use-cases/GenererProclamationClasse/GenererProclamationClasseUseCase';
import { GenererSyntheseResultatsEcoleUseCase } from 'contexts/bulletins-evaluations/application/use-cases/GenererSyntheseResultatsEcole/GenererSyntheseResultatsEcoleUseCase';
import { InitialiserProclamationClasseUseCase } from 'contexts/bulletins-evaluations/application/use-cases/InitialiserProclamationClasse/InitialiserProclamationClasseUseCase';
import { InitialiserSyntheseResultatsEcoleUseCase } from 'contexts/bulletins-evaluations/application/use-cases/InitialiserSyntheseResultatsEcole/InitialiserSyntheseResultatsEcoleUseCase';
import { ModifierCoteUseCase } from 'contexts/bulletins-evaluations/application/use-cases/ModifierCote/ModifierCoteUseCase';
import { SynchroniserOperationsOfflineUseCase } from 'contexts/bulletins-evaluations/application/use-cases/SynchroniserOperationsOffline/SynchroniserOperationsOfflineUseCase';
import { ViderCoteUseCase } from 'contexts/bulletins-evaluations/application/use-cases/ViderCote/ViderCoteUseCase';
import { ProclamationClasse } from 'contexts/bulletins-evaluations/domain/aggregates/ProclamationClasse';
import { SyntheseResultatsEcole } from 'contexts/bulletins-evaluations/domain/aggregates/SyntheseResultatsEcole';
import { SnapshotResultatBulletin } from 'contexts/bulletins-evaluations/domain/entities/SnapshotResultatBulletin';
import { ValidationBulletinOfficielle } from 'contexts/bulletins-evaluations/domain/entities/ValidationBulletinOfficielle';
import type { DepotBulletinEleve } from 'contexts/bulletins-evaluations/domain/repositories/DepotBulletinEleve';
import type { DepotFicheCotationEleveCours } from 'contexts/bulletins-evaluations/domain/repositories/DepotFicheCotationEleveCours';
import type { DepotProclamationClasse } from 'contexts/bulletins-evaluations/domain/repositories/DepotProclamationClasse';
import type { DepotResultatBulletinEleve } from 'contexts/bulletins-evaluations/domain/repositories/DepotResultatBulletinEleve';
import type { DepotSyntheseResultatsEcole } from 'contexts/bulletins-evaluations/domain/repositories/DepotSyntheseResultatsEcole';
import { CodeColonneBulletin } from 'contexts/bulletins-evaluations/domain/value-objects/CodeColonneBulletin';
import { CodePeriodeSimple } from 'contexts/bulletins-evaluations/domain/value-objects/CodePeriodeSimple';
import { EtatProclamation } from 'contexts/bulletins-evaluations/domain/value-objects/EtatProclamation';
import { HistoriqueModificationCote } from 'contexts/bulletins-evaluations/domain/entities/HistoriqueModificationCote';
import { SexeEleve } from 'contexts/bulletins-evaluations/domain/value-objects/SexeEleve';
import { TypeProclamation } from 'contexts/bulletins-evaluations/domain/value-objects/TypeProclamation';
import { TypeSyntheseResultats } from 'contexts/bulletins-evaluations/domain/value-objects/TypeSyntheseResultats';
import {
  AutorisationGenerationBulletinPortMemoire,
  AutorisationGenerationProclamationPortMemoire,
  AutorisationGenerationSynthesePortMemoire,
  CacheMemoire,
  EventBusMemoire,
  FenetreEncodageCalendrierPortMemoire,
  HorlogeFixeMemoire,
  PdfPortMemoire,
  ReferentielAcademiquePortMemoire,
  TransactionManagerMemoire,
} from '../../mocks/BulletinsEvaluationsMocks';
import {
  creerBulletin,
  creerFicheCotation,
  creerLigneProclamation,
  creerProclamation,
  creerResultatBulletin,
  creerResultatColonne,
} from '../../factories/BulletinsEvaluationsFactories';

// Ce fichier couvre les cas d'usage applicatifs principaux du BC.
test('les use cases orchestrent transaction, projection et workflow offline', async () => {
  const fiche = creerFicheCotation();
  const depotFiche: DepotFicheCotationEleveCours = {
    async sauvegarder() {},
    async trouverParId() { return fiche; },
    async trouverParEleveCoursEtAnnee() { return fiche; },
    async listerParEleve() { return [fiche]; },
    async listerParClasseEtCours() { return [fiche]; },
    async listerParClasseEtColonne() { return [fiche]; },
    async existeFichePourEleveCoursAnnee() { return true; },
    async ajouterHistoriqueModificationCote(_historiqueModificationCote: HistoriqueModificationCote) {},
    async listerHistoriqueModifications() { return fiche.obtenirHistoriquesModificationCote(); },
  };

  const transaction = new TransactionManagerMemoire();
  const eventBus = new EventBusMemoire();
  const encoderUseCase = new EncoderCoteUseCase(depotFiche, transaction, undefined, undefined, undefined, undefined, undefined, eventBus);
  const sortieFiche = await encoderUseCase.executer({
    idFicheCotationEleveCours: fiche.obtenirId(),
    codeColonne: CodeColonneBulletin.P1,
    cote: 8,
    versionAttendue: fiche.obtenirVersion(),
    idUtilisateur: 'user-1',
  });
  assert.equal(transaction.nombreTransactions, 1);
  assert.equal(sortieFiche.colonnes[0].codeColonne, CodeColonneBulletin.P1);
  assert.ok(eventBus.evenementsPublies.length > 0);

  const bulletin = creerBulletin();
  const resultat = creerResultatBulletin();
  resultat.mettreAJourApplication(CodePeriodeSimple.P1, 72);
  const depotBulletin: DepotBulletinEleve = {
    async sauvegarder() {},
    async trouverParId() { return bulletin; },
    async trouverParEleveEtAnnee() { return bulletin; },
    async trouverVersionActive() { return bulletin; },
    async listerParClasse() { return [bulletin]; },
    async listerHistoriqueGenerations() { return bulletin.obtenirHistoriqueGeneration(); },
    async ajouterValidationOfficielle(_validation: ValidationBulletinOfficielle) {},
    async listerValidations() { return bulletin.obtenirValidationsOfficielles(); },
    async ajouterSnapshot(_snapshot: SnapshotResultatBulletin) {},
    async listerSnapshots() { return bulletin.obtenirSnapshotsResultats(); },
  };
  const depotResultat: DepotResultatBulletinEleve = {
    async sauvegarder() {},
    async trouverParId() { return resultat; },
    async trouverParEleveEtAnnee() { return resultat; },
    async trouverParEleveInscription() { return resultat; },
    async listerParClasse() { return [resultat]; },
    async listerNonClassesParClasseEtColonne() { return []; },
    async ajouterHistoriqueEncodageConduite() {},
    async listerHistoriqueEncodageConduite() { return []; },
    async ajouterSnapshotResultat(_snapshot: SnapshotResultatBulletin) {},
    async listerSnapshotsResultats() { return resultat.obtenirSnapshotsResultats(); },
  };
  const referentielMemoire = new ReferentielAcademiquePortMemoire();
  const generationUseCase = new GenererBulletinEleveUseCase(
    depotBulletin,
    depotResultat,
    new TransactionManagerMemoire(),
    referentielMemoire,
    new AutorisationGenerationBulletinPortMemoire(),
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    new CacheMemoire(),
    new EventBusMemoire(),
  );
  const sortieBulletin = await generationUseCase.executer({
    idEleve: 'eleve-1',
    idInscriptionScolaire: 'inscription-1',
    idAnneeScolaire: 'annee-1',
    idUtilisateur: 'user-1',
    typeGeneration: 'PROGRESSIF',
    preparerPdf: true,
  });
  assert.equal(sortieBulletin.idEleve, 'eleve-1');
  assert.equal(sortieBulletin.lignes.length, 1);
  assert.deepEqual(referentielMemoire.derniereReferenceProgrammeConsultee, {
    idProgrammeNiveau: 'programme-1',
    idEcole: 'ecole-1',
  });

  const generationUseCaseAvecPdf = new GenererBulletinEleveUseCase(
    depotBulletin,
    depotResultat,
    new TransactionManagerMemoire(),
    new ReferentielAcademiquePortMemoire(),
    new AutorisationGenerationBulletinPortMemoire(),
    undefined,
    undefined,
    undefined,
    undefined,
    new PdfPortMemoire(),
    undefined,
    new EventBusMemoire(),
  );
  await generationUseCaseAvecPdf.executer({
    idEleve: 'eleve-1',
    idInscriptionScolaire: 'inscription-1',
    idAnneeScolaire: 'annee-1',
    idUtilisateur: 'user-1',
    typeGeneration: 'PROGRESSIF',
    preparerPdf: true,
  });

  const synchronisationUseCase = new SynchroniserOperationsOfflineUseCase({
    async enregistrer() {},
    async marquerSynchronisee(idOperationOffline: string) {
      return {
        idOperationOffline,
        statut: 'SYNCHRONISEE',
        message: 'OK',
      };
    },
  });
  const sortieSync = await synchronisationUseCase.executer({
    idOperationOffline: 'offline-1',
    typeOperation: 'ENCODER_COTE',
    payload: { cote: 8 },
    cleIdempotence: 'cle-sync-1',
  });
  assert.equal(sortieSync.statut, 'SYNCHRONISEE');
});

test('la consultation de bulletin reapplique le controle local permission + perimetre', async () => {
  const appelsAutorisation: Array<Record<string, string | undefined>> = [];
  const useCase = new ConsulterBulletinEleveUseCase(
    {
      async executer() {
        return {
          idBulletinEleve: 'bulletin-1',
          idEleve: 'eleve-1',
          idInscriptionScolaire: 'inscription-1',
          idClassePedagogique: 'classe-1',
          idAnneeScolaire: 'annee-1',
          etatBulletin: 'GENERE' as never,
          versionBulletin: 1,
          lignes: [],
          blocsApplicationConduite: [],
        };
      },
      async executerParId() {
        return null;
      },
    },
    {
      async verifierLectureBulletin(contexte) {
        appelsAutorisation.push(contexte);
      },
    },
  );

  const sortie = await useCase.executer({
    idEleve: 'eleve-1',
    idAnneeScolaire: 'annee-1',
    idUtilisateur: 'user-1',
    idOrganisation: 'org-1',
    idEcole: 'ecole-1',
  });

  assert.equal(sortie.idBulletinEleve, 'bulletin-1');
  assert.deepEqual(appelsAutorisation, [{
    idUtilisateur: 'user-1',
    idOrganisation: 'org-1',
    idEcole: 'ecole-1',
    idEleve: 'eleve-1',
    idClassePedagogique: 'classe-1',
    idAnneeScolaire: 'annee-1',
  }]);
});

test("la consultation de l'historique recharge d'abord le bulletin puis reapplique le controle local", async () => {
  const appelsAutorisation: Array<Record<string, string | undefined>> = [];
  const useCase = new ConsulterHistoriqueBulletinUseCase(
    {
      async executer() {
        return [{ versionBulletin: 2 }] as never;
      },
    },
    {
      async executer() {
        return null;
      },
      async executerParId(idBulletinEleve: string) {
        return {
          idBulletinEleve,
          idEleve: 'eleve-1',
          idInscriptionScolaire: 'inscription-1',
          idClassePedagogique: 'classe-1',
          idAnneeScolaire: 'annee-1',
          etatBulletin: 'GENERE' as never,
          versionBulletin: 2,
          lignes: [],
          blocsApplicationConduite: [],
        };
      },
    },
    {
      async verifierLectureBulletin(contexte) {
        appelsAutorisation.push(contexte);
      },
    },
  );

  const sortie = await useCase.executer({
    idBulletinEleve: 'bulletin-1',
    idUtilisateur: 'user-1',
    idOrganisation: 'org-1',
    idEcole: 'ecole-1',
  });

  assert.equal(sortie[0]?.versionBulletin, 2);
  assert.deepEqual(appelsAutorisation, [{
    idUtilisateur: 'user-1',
    idOrganisation: 'org-1',
    idEcole: 'ecole-1',
    idEleve: 'eleve-1',
    idClassePedagogique: 'classe-1',
    idAnneeScolaire: 'annee-1',
  }]);
});

test('la generation de bulletin refuse une incoherence entre programme niveau et version de referentiel', async () => {
  const bulletin = creerBulletin({
    idProgrammeNiveau: 'programme-1',
    versionReferentielProgramme: 'version-ref-1',
  });
  const resultat = creerResultatBulletin({
    idProgrammeNiveau: 'programme-2',
    versionReferentielProgramme: 'version-ref-1',
  });
  const depotBulletin: DepotBulletinEleve = {
    async sauvegarder() {},
    async trouverParId() { return bulletin; },
    async trouverParEleveEtAnnee() { return bulletin; },
    async trouverVersionActive() { return bulletin; },
    async listerParClasse() { return [bulletin]; },
    async listerHistoriqueGenerations() { return bulletin.obtenirHistoriqueGeneration(); },
    async ajouterValidationOfficielle(_validation: ValidationBulletinOfficielle) {},
    async listerValidations() { return bulletin.obtenirValidationsOfficielles(); },
    async ajouterSnapshot(_snapshot: SnapshotResultatBulletin) {},
    async listerSnapshots() { return bulletin.obtenirSnapshotsResultats(); },
  };
  const depotResultat: DepotResultatBulletinEleve = {
    async sauvegarder() {},
    async trouverParId() { return resultat; },
    async trouverParEleveEtAnnee() { return resultat; },
    async trouverParEleveInscription() { return resultat; },
    async listerParClasse() { return [resultat]; },
    async listerNonClassesParClasseEtColonne() { return []; },
    async ajouterHistoriqueEncodageConduite() {},
    async listerHistoriqueEncodageConduite() { return []; },
    async ajouterSnapshotResultat(_snapshot: SnapshotResultatBulletin) {},
    async listerSnapshotsResultats() { return resultat.obtenirSnapshotsResultats(); },
  };
  const generationUseCase = new GenererBulletinEleveUseCase(
    depotBulletin,
    depotResultat,
    new TransactionManagerMemoire(),
    new ReferentielAcademiquePortMemoire(),
    new AutorisationGenerationBulletinPortMemoire(),
  );

  await assert.rejects(
    () => generationUseCase.executer({
      idEleve: 'eleve-1',
      idInscriptionScolaire: 'inscription-1',
      idAnneeScolaire: 'annee-1',
      idUtilisateur: 'user-1',
      typeGeneration: 'PROGRESSIF',
      preparerPdf: false,
    }),
    /meme programme niveau/i,
  );
});

test('la generation de bulletin verifie localement le droit bulletins.generate dans le bon scope', async () => {
  const bulletin = creerBulletin();
  const resultat = creerResultatBulletin();
  const autorisation = new AutorisationGenerationBulletinPortMemoire();
  const depotBulletin: DepotBulletinEleve = {
    async sauvegarder() {},
    async trouverParId() { return bulletin; },
    async trouverParEleveEtAnnee() { return bulletin; },
    async trouverVersionActive() { return bulletin; },
    async listerParClasse() { return [bulletin]; },
    async listerHistoriqueGenerations() { return bulletin.obtenirHistoriqueGeneration(); },
    async ajouterValidationOfficielle(_validation: ValidationBulletinOfficielle) {},
    async listerValidations() { return bulletin.obtenirValidationsOfficielles(); },
    async ajouterSnapshot(_snapshot: SnapshotResultatBulletin) {},
    async listerSnapshots() { return bulletin.obtenirSnapshotsResultats(); },
  };
  const depotResultat: DepotResultatBulletinEleve = {
    async sauvegarder() {},
    async trouverParId() { return resultat; },
    async trouverParEleveEtAnnee() { return resultat; },
    async trouverParEleveInscription() { return resultat; },
    async listerParClasse() { return [resultat]; },
    async listerNonClassesParClasseEtColonne() { return []; },
    async ajouterHistoriqueEncodageConduite() {},
    async listerHistoriqueEncodageConduite() { return []; },
    async ajouterSnapshotResultat(_snapshot: SnapshotResultatBulletin) {},
    async listerSnapshotsResultats() { return resultat.obtenirSnapshotsResultats(); },
  };
  const generationUseCase = new GenererBulletinEleveUseCase(
    depotBulletin,
    depotResultat,
    new TransactionManagerMemoire(),
    new ReferentielAcademiquePortMemoire(),
    autorisation,
  );

  await generationUseCase.executer({
    idEleve: 'eleve-1',
    idInscriptionScolaire: 'inscription-1',
    idAnneeScolaire: 'annee-1',
    idUtilisateur: 'user-1',
    idOrganisation: 'org-1',
    typeGeneration: 'PROGRESSIF',
    preparerPdf: false,
  });

  assert.deepEqual(autorisation.dernierContexte, {
    idUtilisateur: 'user-1',
    idOrganisation: 'org-1',
    idEcole: 'ecole-1',
    idClassePedagogique: 'classe-1',
    idAnneeScolaire: 'annee-1',
  });
});

test('la generation de bulletin refuse un utilisateur non autorise localement', async () => {
  const bulletin = creerBulletin();
  const resultat = creerResultatBulletin();
  const depotBulletin: DepotBulletinEleve = {
    async sauvegarder() {},
    async trouverParId() { return bulletin; },
    async trouverParEleveEtAnnee() { return bulletin; },
    async trouverVersionActive() { return bulletin; },
    async listerParClasse() { return [bulletin]; },
    async listerHistoriqueGenerations() { return bulletin.obtenirHistoriqueGeneration(); },
    async ajouterValidationOfficielle(_validation: ValidationBulletinOfficielle) {},
    async listerValidations() { return bulletin.obtenirValidationsOfficielles(); },
    async ajouterSnapshot(_snapshot: SnapshotResultatBulletin) {},
    async listerSnapshots() { return bulletin.obtenirSnapshotsResultats(); },
  };
  const depotResultat: DepotResultatBulletinEleve = {
    async sauvegarder() {},
    async trouverParId() { return resultat; },
    async trouverParEleveEtAnnee() { return resultat; },
    async trouverParEleveInscription() { return resultat; },
    async listerParClasse() { return [resultat]; },
    async listerNonClassesParClasseEtColonne() { return []; },
    async ajouterHistoriqueEncodageConduite() {},
    async listerHistoriqueEncodageConduite() { return []; },
    async ajouterSnapshotResultat(_snapshot: SnapshotResultatBulletin) {},
    async listerSnapshotsResultats() { return resultat.obtenirSnapshotsResultats(); },
  };
  const generationUseCase = new GenererBulletinEleveUseCase(
    depotBulletin,
    depotResultat,
    new TransactionManagerMemoire(),
    new ReferentielAcademiquePortMemoire(),
    new AutorisationGenerationBulletinPortMemoire(new Error('PERMISSION_REFUSED')),
  );

  await assert.rejects(
    () => generationUseCase.executer({
      idEleve: 'eleve-1',
      idInscriptionScolaire: 'inscription-1',
      idAnneeScolaire: 'annee-1',
      idUtilisateur: 'user-1',
      typeGeneration: 'PROGRESSIF',
      preparerPdf: false,
    }),
    /utilisateur demandeur n'est pas autorise a generer ce bulletin/i,
  );
});

test('la generation de bulletin refuse un programme niveau introuvable ou non valide', async () => {
  const bulletin = creerBulletin();
  const resultat = creerResultatBulletin();
  const depotBulletin: DepotBulletinEleve = {
    async sauvegarder() {},
    async trouverParId() { return bulletin; },
    async trouverParEleveEtAnnee() { return bulletin; },
    async trouverVersionActive() { return bulletin; },
    async listerParClasse() { return [bulletin]; },
    async listerHistoriqueGenerations() { return bulletin.obtenirHistoriqueGeneration(); },
    async ajouterValidationOfficielle(_validation: ValidationBulletinOfficielle) {},
    async listerValidations() { return bulletin.obtenirValidationsOfficielles(); },
    async ajouterSnapshot(_snapshot: SnapshotResultatBulletin) {},
    async listerSnapshots() { return bulletin.obtenirSnapshotsResultats(); },
  };
  const depotResultat: DepotResultatBulletinEleve = {
    async sauvegarder() {},
    async trouverParId() { return resultat; },
    async trouverParEleveEtAnnee() { return resultat; },
    async trouverParEleveInscription() { return resultat; },
    async listerParClasse() { return [resultat]; },
    async listerNonClassesParClasseEtColonne() { return []; },
    async ajouterHistoriqueEncodageConduite() {},
    async listerHistoriqueEncodageConduite() { return []; },
    async ajouterSnapshotResultat(_snapshot: SnapshotResultatBulletin) {},
    async listerSnapshotsResultats() { return resultat.obtenirSnapshotsResultats(); },
  };
  const referentielIntrouvable = new ReferentielAcademiquePortMemoire();
  referentielIntrouvable.consulterProgrammeNiveau = async () => null;
  const useCaseProgrammeIntrouvable = new GenererBulletinEleveUseCase(
    depotBulletin,
    depotResultat,
    new TransactionManagerMemoire(),
    referentielIntrouvable,
    new AutorisationGenerationBulletinPortMemoire(),
  );

  await assert.rejects(
    () => useCaseProgrammeIntrouvable.executer({
      idEleve: 'eleve-1',
      idInscriptionScolaire: 'inscription-1',
      idAnneeScolaire: 'annee-1',
      idUtilisateur: 'user-1',
      typeGeneration: 'PROGRESSIF',
      preparerPdf: false,
    }),
    /programme niveau local rattache au bulletin est introuvable/i,
  );

  const referentielBrouillon = new ReferentielAcademiquePortMemoire();
  referentielBrouillon.consulterProgrammeNiveau = async (referenceProgramme) => ({
    idProgrammeNiveau: referenceProgramme.idProgrammeNiveau,
    idClassePedagogique: 'classe-1',
    typeStructureEvaluation: resultat.obtenirTypeStructureEvaluation(),
    versionReferentielProgramme: 'version-ref-1',
    statutProgrammeNiveau: 'BROUILLON',
  });
  const useCaseProgrammeBrouillon = new GenererBulletinEleveUseCase(
    depotBulletin,
    depotResultat,
    new TransactionManagerMemoire(),
    referentielBrouillon,
    new AutorisationGenerationBulletinPortMemoire(),
  );

  await assert.rejects(
    () => useCaseProgrammeBrouillon.executer({
      idEleve: 'eleve-1',
      idInscriptionScolaire: 'inscription-1',
      idAnneeScolaire: 'annee-1',
      idUtilisateur: 'user-1',
      typeGeneration: 'PROGRESSIF',
      preparerPdf: false,
    }),
    /programme niveau rattache au bulletin doit etre valide/i,
  );
});

test('la generation de bulletin refuse un programme sans cours exploitables ou avec cours introuvable', async () => {
  const bulletin = creerBulletin();
  const resultat = creerResultatBulletin();
  const depotBulletin: DepotBulletinEleve = {
    async sauvegarder() {},
    async trouverParId() { return bulletin; },
    async trouverParEleveEtAnnee() { return bulletin; },
    async trouverVersionActive() { return bulletin; },
    async listerParClasse() { return [bulletin]; },
    async listerHistoriqueGenerations() { return bulletin.obtenirHistoriqueGeneration(); },
    async ajouterValidationOfficielle(_validation: ValidationBulletinOfficielle) {},
    async listerValidations() { return bulletin.obtenirValidationsOfficielles(); },
    async ajouterSnapshot(_snapshot: SnapshotResultatBulletin) {},
    async listerSnapshots() { return bulletin.obtenirSnapshotsResultats(); },
  };
  const depotResultat: DepotResultatBulletinEleve = {
    async sauvegarder() {},
    async trouverParId() { return resultat; },
    async trouverParEleveEtAnnee() { return resultat; },
    async trouverParEleveInscription() { return resultat; },
    async listerParClasse() { return [resultat]; },
    async listerNonClassesParClasseEtColonne() { return []; },
    async ajouterHistoriqueEncodageConduite() {},
    async listerHistoriqueEncodageConduite() { return []; },
    async ajouterSnapshotResultat(_snapshot: SnapshotResultatBulletin) {},
    async listerSnapshotsResultats() { return resultat.obtenirSnapshotsResultats(); },
  };
  const referentielSansCours = new ReferentielAcademiquePortMemoire();
  referentielSansCours.listerCoursProgramme = async () => [];
  const useCaseSansCours = new GenererBulletinEleveUseCase(
    depotBulletin,
    depotResultat,
    new TransactionManagerMemoire(),
    referentielSansCours,
    new AutorisationGenerationBulletinPortMemoire(),
  );

  await assert.rejects(
    () => useCaseSansCours.executer({
      idEleve: 'eleve-1',
      idInscriptionScolaire: 'inscription-1',
      idAnneeScolaire: 'annee-1',
      idUtilisateur: 'user-1',
      typeGeneration: 'PROGRESSIF',
      preparerPdf: false,
    }),
    /aucun cours exploitable/i,
  );

  const referentielCoursIntrouvable = new ReferentielAcademiquePortMemoire();
  referentielCoursIntrouvable.listerCoursProgramme = async () => {
    throw new Error('Le cours "cours-1" reference par le programme niveau "programme-1" est introuvable.');
  };
  const useCaseCoursIntrouvable = new GenererBulletinEleveUseCase(
    depotBulletin,
    depotResultat,
    new TransactionManagerMemoire(),
    referentielCoursIntrouvable,
    new AutorisationGenerationBulletinPortMemoire(),
  );

  await assert.rejects(
    () => useCaseCoursIntrouvable.executer({
      idEleve: 'eleve-1',
      idInscriptionScolaire: 'inscription-1',
      idAnneeScolaire: 'annee-1',
      idUtilisateur: 'user-1',
      typeGeneration: 'PROGRESSIF',
      preparerPdf: false,
    }),
    /cours "cours-1".*introuvable/i,
  );
});

test('la generation de bulletin refuse une incoherence de contexte entre bulletin et resultat consolide', async () => {
  const bulletin = creerBulletin({
    idEcole: 'ecole-1',
    idClassePedagogique: 'classe-1',
    idAnneeScolaire: 'annee-1',
    idInscriptionScolaire: 'inscription-1',
  });
  const resultat = creerResultatBulletin({
    idEcole: 'ecole-2',
    idClassePedagogique: 'classe-1',
    idAnneeScolaire: 'annee-1',
    idInscriptionScolaire: 'inscription-1',
  });
  const depotBulletin: DepotBulletinEleve = {
    async sauvegarder() {},
    async trouverParId() { return bulletin; },
    async trouverParEleveEtAnnee() { return bulletin; },
    async trouverVersionActive() { return bulletin; },
    async listerParClasse() { return [bulletin]; },
    async listerHistoriqueGenerations() { return bulletin.obtenirHistoriqueGeneration(); },
    async ajouterValidationOfficielle(_validation: ValidationBulletinOfficielle) {},
    async listerValidations() { return bulletin.obtenirValidationsOfficielles(); },
    async ajouterSnapshot(_snapshot: SnapshotResultatBulletin) {},
    async listerSnapshots() { return bulletin.obtenirSnapshotsResultats(); },
  };
  const depotResultat: DepotResultatBulletinEleve = {
    async sauvegarder() {},
    async trouverParId() { return resultat; },
    async trouverParEleveEtAnnee() { return resultat; },
    async trouverParEleveInscription() { return resultat; },
    async listerParClasse() { return [resultat]; },
    async listerNonClassesParClasseEtColonne() { return []; },
    async ajouterHistoriqueEncodageConduite() {},
    async listerHistoriqueEncodageConduite() { return []; },
    async ajouterSnapshotResultat(_snapshot: SnapshotResultatBulletin) {},
    async listerSnapshotsResultats() { return resultat.obtenirSnapshotsResultats(); },
  };
  const generationUseCase = new GenererBulletinEleveUseCase(
    depotBulletin,
    depotResultat,
    new TransactionManagerMemoire(),
    new ReferentielAcademiquePortMemoire(),
    new AutorisationGenerationBulletinPortMemoire(),
  );

  await assert.rejects(
    () => generationUseCase.executer({
      idEleve: 'eleve-1',
      idInscriptionScolaire: 'inscription-1',
      idAnneeScolaire: 'annee-1',
      idUtilisateur: 'user-1',
      typeGeneration: 'PROGRESSIF',
      preparerPdf: false,
    }),
    /meme ecole/i,
  );
});

test("l'encodage d'une cote est autorise quand la colonne de periode correspond a la fenetre courante", async () => {
  const fiche = creerFicheCotation();
  const depotFiche: DepotFicheCotationEleveCours = {
    async sauvegarder() {},
    async trouverParId() { return fiche; },
    async trouverParEleveCoursEtAnnee() { return fiche; },
    async listerParEleve() { return [fiche]; },
    async listerParClasseEtCours() { return [fiche]; },
    async listerParClasseEtColonne() { return [fiche]; },
    async existeFichePourEleveCoursAnnee() { return true; },
    async ajouterHistoriqueModificationCote(_historiqueModificationCote: HistoriqueModificationCote) {},
    async listerHistoriqueModifications() { return fiche.obtenirHistoriquesModificationCote(); },
  };
  const portCalendrier = new FenetreEncodageCalendrierPortMemoire({
    idCalendrierAcademique: 'cal-1',
    idEcole: 'ecole-1',
    idAnneeScolaire: 'annee-1',
    verrouille: true,
    dateReference: '2026-09-15T00:00:00.000Z',
    periodeCouranteCode: 'P1',
    examenCourantCode: null,
  });
  const useCase = new EncoderCoteUseCase(
    depotFiche,
    new TransactionManagerMemoire(),
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    portCalendrier,
    new HorlogeFixeMemoire(new Date('2026-09-15T00:00:00.000Z')),
  );

  const sortie = await useCase.executer({
    idFicheCotationEleveCours: fiche.obtenirId(),
    codeColonne: CodeColonneBulletin.P1,
    cote: 9,
    versionAttendue: fiche.obtenirVersion(),
    idUtilisateur: 'user-1',
  });

  assert.equal(sortie.colonnes[0].codeColonne, CodeColonneBulletin.P1);
  assert.equal(portCalendrier.dernierContexte?.codeColonne, CodeColonneBulletin.P1);
});

test("l'encodage d'une cote de periode est refuse hors de la fenetre courante", async () => {
  const fiche = creerFicheCotation();
  const depotFiche: DepotFicheCotationEleveCours = {
    async sauvegarder() {},
    async trouverParId() { return fiche; },
    async trouverParEleveCoursEtAnnee() { return fiche; },
    async listerParEleve() { return [fiche]; },
    async listerParClasseEtCours() { return [fiche]; },
    async listerParClasseEtColonne() { return [fiche]; },
    async existeFichePourEleveCoursAnnee() { return true; },
    async ajouterHistoriqueModificationCote(_historiqueModificationCote: HistoriqueModificationCote) {},
    async listerHistoriqueModifications() { return fiche.obtenirHistoriquesModificationCote(); },
  };
  const useCase = new EncoderCoteUseCase(
    depotFiche,
    new TransactionManagerMemoire(),
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    new FenetreEncodageCalendrierPortMemoire({
      idCalendrierAcademique: 'cal-1',
      idEcole: 'ecole-1',
      idAnneeScolaire: 'annee-1',
      verrouille: true,
      dateReference: '2026-10-15T00:00:00.000Z',
      periodeCouranteCode: 'P2',
      examenCourantCode: null,
    }),
    new HorlogeFixeMemoire(new Date('2026-10-15T00:00:00.000Z')),
  );

  await assert.rejects(
    () => useCase.executer({
      idFicheCotationEleveCours: fiche.obtenirId(),
      codeColonne: CodeColonneBulletin.P1,
      cote: 9,
      versionAttendue: fiche.obtenirVersion(),
      idUtilisateur: 'user-1',
    }),
    /n'est pas ouverte a l'encodage/i,
  );
});

test("l'encodage d'une cote d'examen est autorise pendant l'examen courant", async () => {
  const fiche = creerFicheCotation();
  const depotFiche: DepotFicheCotationEleveCours = {
    async sauvegarder() {},
    async trouverParId() { return fiche; },
    async trouverParEleveCoursEtAnnee() { return fiche; },
    async listerParEleve() { return [fiche]; },
    async listerParClasseEtCours() { return [fiche]; },
    async listerParClasseEtColonne() { return [fiche]; },
    async existeFichePourEleveCoursAnnee() { return true; },
    async ajouterHistoriqueModificationCote(_historiqueModificationCote: HistoriqueModificationCote) {},
    async listerHistoriqueModifications() { return fiche.obtenirHistoriquesModificationCote(); },
  };
  const useCase = new EncoderCoteUseCase(
    depotFiche,
    new TransactionManagerMemoire(),
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    new FenetreEncodageCalendrierPortMemoire({
      idCalendrierAcademique: 'cal-1',
      idEcole: 'ecole-1',
      idAnneeScolaire: 'annee-1',
      verrouille: true,
      dateReference: '2026-12-15T00:00:00.000Z',
      periodeCouranteCode: null,
      examenCourantCode: 'EX1',
    }),
    new HorlogeFixeMemoire(new Date('2026-12-15T00:00:00.000Z')),
  );

  const sortie = await useCase.executer({
    idFicheCotationEleveCours: fiche.obtenirId(),
    codeColonne: CodeColonneBulletin.EX1,
    cote: 8,
    versionAttendue: fiche.obtenirVersion(),
    idUtilisateur: 'user-1',
  });

  assert.equal(sortie.colonnes.some((colonne) => colonne.codeColonne === CodeColonneBulletin.EX1), true);
});

test("l'encodage d'une cote est refuse si le calendrier est absent ou non verrouille", async () => {
  const fiche = creerFicheCotation();
  const depotFiche: DepotFicheCotationEleveCours = {
    async sauvegarder() {},
    async trouverParId() { return fiche; },
    async trouverParEleveCoursEtAnnee() { return fiche; },
    async listerParEleve() { return [fiche]; },
    async listerParClasseEtCours() { return [fiche]; },
    async listerParClasseEtColonne() { return [fiche]; },
    async existeFichePourEleveCoursAnnee() { return true; },
    async ajouterHistoriqueModificationCote(_historiqueModificationCote: HistoriqueModificationCote) {},
    async listerHistoriqueModifications() { return fiche.obtenirHistoriquesModificationCote(); },
  };
  const useCaseSansCalendrier = new EncoderCoteUseCase(
    depotFiche,
    new TransactionManagerMemoire(),
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    new FenetreEncodageCalendrierPortMemoire(null),
    new HorlogeFixeMemoire(new Date('2026-09-15T00:00:00.000Z')),
  );

  await assert.rejects(
    () => useCaseSansCalendrier.executer({
      idFicheCotationEleveCours: fiche.obtenirId(),
      codeColonne: CodeColonneBulletin.P1,
      cote: 8,
      versionAttendue: fiche.obtenirVersion(),
      idUtilisateur: 'user-1',
    }),
    /aucun calendrier academique local/i,
  );

  const useCaseCalendrierNonVerrouille = new EncoderCoteUseCase(
    depotFiche,
    new TransactionManagerMemoire(),
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    new FenetreEncodageCalendrierPortMemoire({
      idCalendrierAcademique: 'cal-1',
      idEcole: 'ecole-1',
      idAnneeScolaire: 'annee-1',
      verrouille: false,
      dateReference: '2026-09-15T00:00:00.000Z',
      periodeCouranteCode: 'P1',
      examenCourantCode: null,
    }),
    new HorlogeFixeMemoire(new Date('2026-09-15T00:00:00.000Z')),
  );

  await assert.rejects(
    () => useCaseCalendrierNonVerrouille.executer({
      idFicheCotationEleveCours: fiche.obtenirId(),
      codeColonne: CodeColonneBulletin.P1,
      cote: 8,
      versionAttendue: fiche.obtenirVersion(),
      idUtilisateur: 'user-1',
    }),
    /doit etre verrouille/i,
  );
});

test("la modification et le vidage d'une cote sont refuses apres fermeture de la fenetre", async () => {
  const fiche = creerFicheCotation();
  fiche.encoderCote(CodeColonneBulletin.P1, 10, 'user-1');
  const depotFiche: DepotFicheCotationEleveCours = {
    async sauvegarder() {},
    async trouverParId() { return fiche; },
    async trouverParEleveCoursEtAnnee() { return fiche; },
    async listerParEleve() { return [fiche]; },
    async listerParClasseEtCours() { return [fiche]; },
    async listerParClasseEtColonne() { return [fiche]; },
    async existeFichePourEleveCoursAnnee() { return true; },
    async ajouterHistoriqueModificationCote(_historiqueModificationCote: HistoriqueModificationCote) {},
    async listerHistoriqueModifications() { return fiche.obtenirHistoriquesModificationCote(); },
  };
  const portCalendrier = new FenetreEncodageCalendrierPortMemoire({
    idCalendrierAcademique: 'cal-1',
    idEcole: 'ecole-1',
    idAnneeScolaire: 'annee-1',
    verrouille: true,
    dateReference: '2026-10-15T00:00:00.000Z',
    periodeCouranteCode: 'P2',
    examenCourantCode: null,
  });
  const horloge = new HorlogeFixeMemoire(new Date('2026-10-15T00:00:00.000Z'));
  const modifierUseCase = new ModifierCoteUseCase(
    depotFiche,
    new TransactionManagerMemoire(),
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    portCalendrier,
    horloge,
  );
  const viderUseCase = new ViderCoteUseCase(
    depotFiche,
    new TransactionManagerMemoire(),
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    portCalendrier,
    horloge,
  );

  await assert.rejects(
    () => modifierUseCase.executer({
      idFicheCotationEleveCours: fiche.obtenirId(),
      codeColonne: CodeColonneBulletin.P1,
      nouvelleCote: 12,
      versionAttendue: fiche.obtenirVersion(),
      idUtilisateur: 'user-2',
    }),
    /n'est pas ouverte a l'encodage/i,
  );

  await assert.rejects(
    () => viderUseCase.executer({
      idFicheCotationEleveCours: fiche.obtenirId(),
      codeColonne: CodeColonneBulletin.P1,
      versionAttendue: fiche.obtenirVersion(),
      idUtilisateur: 'user-2',
    }),
    /n'est pas ouverte a l'encodage/i,
  );
});

test("l'initialisation d'une proclamation cree un brouillon unique et sa generation transporte les non classes reels", async () => {
  let proclamationStockee: ProclamationClasse | null = null;
  const depotProclamation: DepotProclamationClasse = {
    async sauvegarder(proclamationClasse) {
      proclamationStockee = proclamationClasse;
    },
    async trouverParClasseEtColonne(idClassePedagogique, codeColonne, idAnneeScolaire) {
      if (
        proclamationStockee !== null
        && proclamationStockee.obtenirIdClassePedagogique() === idClassePedagogique
        && proclamationStockee.obtenirCodeColonne() === codeColonne
        && proclamationStockee.obtenirIdAnneeScolaire() === idAnneeScolaire
      ) {
        return proclamationStockee;
      }

      return null;
    },
    async listerParClasseEtAnnee() { return proclamationStockee === null ? [] : [proclamationStockee]; },
    async listerParEcoleEtColonne(idEcole, codeColonne, idAnneeScolaire) {
      if (
        proclamationStockee !== null
        && proclamationStockee.obtenirIdEcole() === idEcole
        && proclamationStockee.obtenirCodeColonne() === codeColonne
        && proclamationStockee.obtenirIdAnneeScolaire() === idAnneeScolaire
      ) {
        return [proclamationStockee];
      }

      return [];
    },
    async listerHistoriqueProclamations() { return proclamationStockee === null ? [] : [proclamationStockee]; },
    async changerEtatProclamation(_idProclamationClasse, etatProclamation) {
      if (proclamationStockee !== null && etatProclamation === EtatProclamation.ANNULEE) {
        proclamationStockee.annuler('Annulation test');
      }
    },
    async verrouillerProclamation(_idProclamationClasse, verrouillePar) {
      proclamationStockee?.verrouiller(verrouillePar);
    },
  };
  const resultatClasse = creerResultatBulletin({
    idResultatBulletinEleve: 'resultat-1',
    idEleve: 'eleve-1',
    resultatsColonnes: [creerResultatColonne(CodeColonneBulletin.TOTAL_GENERAL)],
  });
  const resultatNonClasse = creerResultatBulletin({
    idResultatBulletinEleve: 'resultat-2',
    idEleve: 'eleve-2',
    idInscriptionScolaire: 'inscription-2',
    resultatsColonnes: [
      creerResultatColonne(CodeColonneBulletin.TOTAL_GENERAL, {
        totalObtenu: undefined,
        maximumGeneral: undefined,
        pourcentage: undefined,
        rang: undefined,
        estClassable: false,
        estNonClasse: true,
      }),
    ],
  });
  const depotResultat: DepotResultatBulletinEleve = {
    async sauvegarder() {},
    async trouverParId() { return resultatClasse; },
    async trouverParEleveEtAnnee() { return resultatClasse; },
    async trouverParEleveInscription() { return resultatClasse; },
    async listerParClasse() { return [resultatClasse, resultatNonClasse]; },
    async listerNonClassesParClasseEtColonne() { return [resultatNonClasse]; },
    async ajouterHistoriqueEncodageConduite() {},
    async listerHistoriqueEncodageConduite() { return []; },
    async ajouterSnapshotResultat(_snapshot: SnapshotResultatBulletin) {},
    async listerSnapshotsResultats() { return []; },
  };
  const scolaritePort = {
    async consulterEleve(idEleve: string) {
      return idEleve === 'eleve-1'
        ? { idEleve, nomComplet: 'Eleve Classe', sexe: SexeEleve.M, idEcole: 'ecole-1' }
        : { idEleve, nomComplet: 'Eleve Non Classe', sexe: SexeEleve.F, idEcole: 'ecole-1' };
    },
    async consulterInscription() { return null; },
    async consulterClassePedagogique() { return null; },
    async verifierAbandon() { return null; },
  };
  const eventBus = new EventBusMemoire();
  const autorisationProclamation = new AutorisationGenerationProclamationPortMemoire();
  const initialiserUseCase = new InitialiserProclamationClasseUseCase(
    depotProclamation,
    new TransactionManagerMemoire(),
    autorisationProclamation,
    undefined,
    eventBus,
  );

  const brouillon = await initialiserUseCase.executer({
    idClassePedagogique: 'classe-1',
    idAnneeScolaire: 'annee-1',
    idEcole: 'ecole-1',
    codeColonne: CodeColonneBulletin.TOTAL_GENERAL,
    versionReferentielProgramme: 'version-ref-1',
    creePar: 'user-1',
  });

  assert.equal(brouillon.nonClasses.length, 0);
  assert.ok(proclamationStockee !== null);
  const proclamationInitialisee = proclamationStockee as ProclamationClasse;
  assert.equal(proclamationInitialisee.obtenirEtatProclamation(), EtatProclamation.BROUILLON);
  assert.deepEqual(autorisationProclamation.dernierContexteInitialisation, {
    idUtilisateur: 'user-1',
    idEcole: 'ecole-1',
    idClassePedagogique: 'classe-1',
    idAnneeScolaire: 'annee-1',
  });
  assert.ok(eventBus.evenementsPublies.some((evenement) => (evenement as { typeEvenement?: string }).typeEvenement === 'ProclamationClasseInitialisee'));

  await assert.rejects(
    () => initialiserUseCase.executer({
      idClassePedagogique: 'classe-1',
      idAnneeScolaire: 'annee-1',
      idEcole: 'ecole-1',
      codeColonne: CodeColonneBulletin.TOTAL_GENERAL,
      versionReferentielProgramme: 'version-ref-1',
      creePar: 'user-1',
    }),
    /proclamation active existe deja/i,
  );

  const genererUseCase = new GenererProclamationClasseUseCase(
    depotProclamation,
    depotResultat,
    scolaritePort,
    new TransactionManagerMemoire(),
    autorisationProclamation,
    undefined,
    undefined,
    new EventBusMemoire(),
  );

  const sortie = await genererUseCase.executer({
    idClassePedagogique: 'classe-1',
    idAnneeScolaire: 'annee-1',
    codeColonne: CodeColonneBulletin.TOTAL_GENERAL,
    typeProclamation: TypeProclamation.ANNUEL,
    idUtilisateur: 'user-1',
  });

  assert.equal(sortie.nonClasses.length, 1);
  assert.equal(sortie.nonClasses[0].idEleve, 'eleve-2');
  assert.equal(sortie.statistiques?.nonClassesTotal, 1);
  assert.equal(sortie.statistiques?.classesTotal, 1);
  assert.deepEqual(autorisationProclamation.dernierContexteGeneration, {
    idUtilisateur: 'user-1',
    idEcole: 'ecole-1',
    idClassePedagogique: 'classe-1',
    idAnneeScolaire: 'annee-1',
  });
});

test("la generation d'une proclamation refuse toute donnee scolarite eleve absente", async () => {
  let proclamationStockee: ProclamationClasse | null = ProclamationClasse.initialiser({
    idProclamationClasse: 'proclamation-classe-1-annee-1-TOTAL_GENERAL',
    idEcole: 'ecole-1',
    idClassePedagogique: 'classe-1',
    idAnneeScolaire: 'annee-1',
    codeColonne: CodeColonneBulletin.TOTAL_GENERAL,
    typeProclamation: TypeProclamation.ANNUEL,
    versionReferentielProgramme: 'version-ref-1',
    creePar: 'user-1',
    creeLe: new Date('2026-01-01T00:00:00.000Z'),
  });
  const depotProclamation: DepotProclamationClasse = {
    async sauvegarder(proclamationClasse) { proclamationStockee = proclamationClasse; },
    async trouverParClasseEtColonne() { return proclamationStockee; },
    async listerParClasseEtAnnee() { return proclamationStockee === null ? [] : [proclamationStockee]; },
    async listerParEcoleEtColonne() { return proclamationStockee === null ? [] : [proclamationStockee]; },
    async listerHistoriqueProclamations() { return proclamationStockee === null ? [] : [proclamationStockee]; },
    async changerEtatProclamation() {},
    async verrouillerProclamation() {},
  };
  const resultat = creerResultatBulletin({
    resultatsColonnes: [creerResultatColonne(CodeColonneBulletin.TOTAL_GENERAL)],
  });
  const depotResultat: DepotResultatBulletinEleve = {
    async sauvegarder() {},
    async trouverParId() { return resultat; },
    async trouverParEleveEtAnnee() { return resultat; },
    async trouverParEleveInscription() { return resultat; },
    async listerParClasse() { return [resultat]; },
    async listerNonClassesParClasseEtColonne() { return []; },
    async ajouterHistoriqueEncodageConduite() {},
    async listerHistoriqueEncodageConduite() { return []; },
    async ajouterSnapshotResultat(_snapshot: SnapshotResultatBulletin) {},
    async listerSnapshotsResultats() { return []; },
  };
  const genererUseCase = new GenererProclamationClasseUseCase(
    depotProclamation,
    depotResultat,
    {
      async consulterEleve() { return null; },
      async consulterInscription() { return null; },
      async consulterClassePedagogique() { return null; },
      async verifierAbandon() { return null; },
    },
    new TransactionManagerMemoire(),
    new AutorisationGenerationProclamationPortMemoire(),
  );

  await assert.rejects(
    () => genererUseCase.executer({
      idClassePedagogique: 'classe-1',
      idAnneeScolaire: 'annee-1',
      codeColonne: CodeColonneBulletin.TOTAL_GENERAL,
      typeProclamation: TypeProclamation.ANNUEL,
      idUtilisateur: 'user-1',
    }),
    /informations scolarite de l'eleve/i,
  );
});

test("l'initialisation et la generation d'une proclamation verifient localement le droit proclamations.generate", async () => {
  let proclamationStockee: ProclamationClasse | null = null;
  const depotProclamation: DepotProclamationClasse = {
    async sauvegarder(proclamationClasse) { proclamationStockee = proclamationClasse; },
    async trouverParClasseEtColonne() { return proclamationStockee; },
    async listerParClasseEtAnnee() { return proclamationStockee === null ? [] : [proclamationStockee]; },
    async listerParEcoleEtColonne() { return proclamationStockee === null ? [] : [proclamationStockee]; },
    async listerHistoriqueProclamations() { return proclamationStockee === null ? [] : [proclamationStockee]; },
    async changerEtatProclamation() {},
    async verrouillerProclamation() {},
  };
  const depotResultat: DepotResultatBulletinEleve = {
    async sauvegarder() {},
    async trouverParId() { return creerResultatBulletin(); },
    async trouverParEleveEtAnnee() { return creerResultatBulletin(); },
    async trouverParEleveInscription() { return creerResultatBulletin(); },
    async listerParClasse() {
      return [creerResultatBulletin({ resultatsColonnes: [creerResultatColonne(CodeColonneBulletin.TOTAL_GENERAL)] })];
    },
    async listerNonClassesParClasseEtColonne() { return []; },
    async ajouterHistoriqueEncodageConduite() {},
    async listerHistoriqueEncodageConduite() { return []; },
    async ajouterSnapshotResultat(_snapshot: SnapshotResultatBulletin) {},
    async listerSnapshotsResultats() { return []; },
  };
  const autorisation = new AutorisationGenerationProclamationPortMemoire();
  const initialiserUseCase = new InitialiserProclamationClasseUseCase(
    depotProclamation,
    new TransactionManagerMemoire(),
    autorisation,
  );

  await initialiserUseCase.executer({
    idClassePedagogique: 'classe-1',
    idAnneeScolaire: 'annee-1',
    idEcole: 'ecole-1',
    codeColonne: CodeColonneBulletin.TOTAL_GENERAL,
    versionReferentielProgramme: 'version-ref-1',
    creePar: 'user-1',
  });

  const genererUseCase = new GenererProclamationClasseUseCase(
    depotProclamation,
    depotResultat,
    {
      async consulterEleve(idEleve: string) { return { idEleve, nomComplet: 'Eleve', sexe: SexeEleve.M, idEcole: 'ecole-1' }; },
      async consulterInscription() { return null; },
      async consulterClassePedagogique() { return null; },
      async verifierAbandon() { return null; },
    },
    new TransactionManagerMemoire(),
    autorisation,
  );

  await genererUseCase.executer({
    idClassePedagogique: 'classe-1',
    idAnneeScolaire: 'annee-1',
    codeColonne: CodeColonneBulletin.TOTAL_GENERAL,
    typeProclamation: TypeProclamation.ANNUEL,
    idUtilisateur: 'user-1',
  });

  assert.deepEqual(autorisation.dernierContexteInitialisation, {
    idUtilisateur: 'user-1',
    idEcole: 'ecole-1',
    idClassePedagogique: 'classe-1',
    idAnneeScolaire: 'annee-1',
  });
  assert.deepEqual(autorisation.dernierContexteGeneration, {
    idUtilisateur: 'user-1',
    idEcole: 'ecole-1',
    idClassePedagogique: 'classe-1',
    idAnneeScolaire: 'annee-1',
  });
});

test("l'initialisation et la generation d'une proclamation refusent un utilisateur non autorise localement", async () => {
  const depotProclamation: DepotProclamationClasse = {
    async sauvegarder() {},
    async trouverParClasseEtColonne() { return null; },
    async listerParClasseEtAnnee() { return []; },
    async listerParEcoleEtColonne() { return []; },
    async listerHistoriqueProclamations() { return []; },
    async changerEtatProclamation() {},
    async verrouillerProclamation() {},
  };
  const initialiserUseCase = new InitialiserProclamationClasseUseCase(
    depotProclamation,
    new TransactionManagerMemoire(),
    new AutorisationGenerationProclamationPortMemoire(new Error('PERMISSION_REFUSED')),
  );

  await assert.rejects(
    () => initialiserUseCase.executer({
      idClassePedagogique: 'classe-1',
      idAnneeScolaire: 'annee-1',
      idEcole: 'ecole-1',
      codeColonne: CodeColonneBulletin.TOTAL_GENERAL,
      versionReferentielProgramme: 'version-ref-1',
      creePar: 'user-1',
    }),
    /PERMISSION_REFUSED/i,
  );
});

test("l'initialisation et la generation d'une synthese utilisent les proclamations reelles et les vraies classes", async () => {
  let syntheseStockee: SyntheseResultatsEcole | null = null;
  const depotSynthese: DepotSyntheseResultatsEcole = {
    async sauvegarder(synthese) {
      syntheseStockee = synthese;
    },
    async trouverParEcoleEtColonne(idEcole, codeColonne, idAnneeScolaire) {
      if (
        syntheseStockee !== null
        && syntheseStockee.obtenirIdEcole() === idEcole
        && syntheseStockee.obtenirCodeColonne() === codeColonne
        && syntheseStockee.obtenirIdAnneeScolaire() === idAnneeScolaire
      ) {
        return syntheseStockee;
      }

      return null;
    },
    async listerParAnnee(idEcole, idAnneeScolaire) {
      if (
        syntheseStockee !== null
        && syntheseStockee.obtenirIdEcole() === idEcole
        && syntheseStockee.obtenirIdAnneeScolaire() === idAnneeScolaire
      ) {
        return [syntheseStockee];
      }

      return [];
    },
  };
  const proclamationA = creerProclamation({
    idProclamationClasse: 'proclamation-a',
    idEcole: 'ecole-1',
    idClassePedagogique: 'classe-1',
    idAnneeScolaire: 'annee-1',
    codeColonne: CodeColonneBulletin.TOTAL_GENERAL,
  });
  proclamationA.calculerStatistiques();
  const proclamationB = creerProclamation({
    idProclamationClasse: 'proclamation-b',
    idEcole: 'ecole-1',
    idClassePedagogique: 'classe-2',
    idAnneeScolaire: 'annee-1',
    codeColonne: CodeColonneBulletin.TOTAL_GENERAL,
    lignesProclamation: [
      creerLigneProclamation({
        idLigneProclamationClasse: 'ligne-proclamation-2',
        idEleve: 'eleve-2',
        nomComplet: 'Eleve Deux',
        sexe: SexeEleve.F,
        rang: 1,
      }),
    ],
  });
  proclamationB.calculerStatistiques();
  const depotProclamation: DepotProclamationClasse = {
    async sauvegarder() {},
    async trouverParClasseEtColonne() { return null; },
    async listerParClasseEtAnnee(idClassePedagogique, idAnneeScolaire) {
      return [proclamationA, proclamationB].filter((proclamation) =>
        proclamation.obtenirIdClassePedagogique() === idClassePedagogique
        && proclamation.obtenirIdAnneeScolaire() === idAnneeScolaire,
      );
    },
    async listerParEcoleEtColonne(idEcole, codeColonne, idAnneeScolaire) {
      return [proclamationA, proclamationB].filter((proclamation) =>
        proclamation.obtenirIdEcole() === idEcole
        && proclamation.obtenirCodeColonne() === codeColonne
        && proclamation.obtenirIdAnneeScolaire() === idAnneeScolaire,
      );
    },
    async listerHistoriqueProclamations() { return [proclamationA, proclamationB]; },
    async changerEtatProclamation() {},
    async verrouillerProclamation() {},
  };
  const scolaritePort = {
    async consulterEleve() { return null; },
    async consulterInscription() { return null; },
    async consulterClassePedagogique(idClassePedagogique: string) {
      return {
        idClassePedagogique,
        libelleClasse: idClassePedagogique === 'classe-1' ? '1re A' : '2e B',
        idEcole: 'ecole-1',
      };
    },
    async verifierAbandon() { return null; },
  };
  const autorisationSynthese = new AutorisationGenerationSynthesePortMemoire();
  const initialiserUseCase = new InitialiserSyntheseResultatsEcoleUseCase(
    depotSynthese,
    depotProclamation,
    new TransactionManagerMemoire(),
    autorisationSynthese,
    undefined,
    new EventBusMemoire(),
  );

  const brouillon = await initialiserUseCase.executer({
    idEcole: 'ecole-1',
    idAnneeScolaire: 'annee-1',
    codeColonne: CodeColonneBulletin.TOTAL_GENERAL,
    typeSynthese: TypeSyntheseResultats.ANNUELLE,
    creePar: 'user-1',
  });

  assert.equal(brouillon.lignes.length, 0);
  assert.deepEqual(autorisationSynthese.dernierContexteInitialisation, {
    idUtilisateur: 'user-1',
    idEcole: 'ecole-1',
    idAnneeScolaire: 'annee-1',
    idClassesPedagogiques: ['classe-1', 'classe-2'],
  });

  await assert.rejects(
    () => initialiserUseCase.executer({
      idEcole: 'ecole-1',
      idAnneeScolaire: 'annee-1',
      codeColonne: CodeColonneBulletin.TOTAL_GENERAL,
      typeSynthese: TypeSyntheseResultats.ANNUELLE,
      creePar: 'user-1',
    }),
    /synthese active existe deja/i,
  );

  const genererUseCase = new GenererSyntheseResultatsEcoleUseCase(
    depotSynthese,
    depotProclamation,
    new TransactionManagerMemoire(),
    autorisationSynthese,
    undefined,
    undefined,
    scolaritePort,
  );

  const sortie = await genererUseCase.executer({
    idEcole: 'ecole-1',
    idAnneeScolaire: 'annee-1',
    codeColonne: CodeColonneBulletin.TOTAL_GENERAL,
    typeSynthese: TypeSyntheseResultats.ANNUELLE,
    idUtilisateur: 'user-1',
  });

  assert.deepEqual(
    sortie.lignes.map((ligne) => ({ idClassePedagogique: ligne.idClassePedagogique, libelleClasse: ligne.libelleClasse })),
    [
      { idClassePedagogique: 'classe-1', libelleClasse: '1re A' },
      { idClassePedagogique: 'classe-2', libelleClasse: '2e B' },
    ],
  );
  assert.equal(sortie.totauxEcole?.classesTotal, 2);
  assert.equal(sortie.totauxEcole?.inscritsTotal, 2);
});

test("la generation d'une synthese refuse une classe pedagogique introuvable ou l'absence de proclamations exploitables", async () => {
  const synthese = SyntheseResultatsEcole.initialiser({
    idSyntheseResultatsEcole: 'synthese-ecole-1-annee-1-TOTAL_GENERAL',
    idEcole: 'ecole-1',
    idAnneeScolaire: 'annee-1',
    codeColonne: CodeColonneBulletin.TOTAL_GENERAL,
    typeSynthese: TypeSyntheseResultats.ANNUELLE,
    creePar: 'user-1',
    creeLe: new Date('2026-01-01T00:00:00.000Z'),
  });
  const depotSynthese: DepotSyntheseResultatsEcole = {
    async sauvegarder() {},
    async trouverParEcoleEtColonne() { return synthese; },
    async listerParAnnee() { return [synthese]; },
  };
  const proclamation = creerProclamation({
    idProclamationClasse: 'proclamation-a',
    idEcole: 'ecole-1',
    idClassePedagogique: 'classe-1',
    idAnneeScolaire: 'annee-1',
    codeColonne: CodeColonneBulletin.TOTAL_GENERAL,
  });
  proclamation.calculerStatistiques();
  const depotProclamation: DepotProclamationClasse = {
    async sauvegarder() {},
    async trouverParClasseEtColonne() { return proclamation; },
    async listerParClasseEtAnnee() { return [proclamation]; },
    async listerParEcoleEtColonne() { return [proclamation]; },
    async listerHistoriqueProclamations() { return [proclamation]; },
    async changerEtatProclamation() {},
    async verrouillerProclamation() {},
  };
  const useCaseClasseIntrouvable = new GenererSyntheseResultatsEcoleUseCase(
    depotSynthese,
    depotProclamation,
    new TransactionManagerMemoire(),
    new AutorisationGenerationSynthesePortMemoire(),
    undefined,
    undefined,
    {
      async consulterEleve() { return null; },
      async consulterInscription() { return null; },
      async consulterClassePedagogique() { return null; },
      async verifierAbandon() { return null; },
    },
  );

  await assert.rejects(
    () => useCaseClasseIntrouvable.executer({
      idEcole: 'ecole-1',
      idAnneeScolaire: 'annee-1',
      codeColonne: CodeColonneBulletin.TOTAL_GENERAL,
      typeSynthese: TypeSyntheseResultats.ANNUELLE,
      idUtilisateur: 'user-1',
    }),
    /classe pedagogique "classe-1".*introuvable/i,
  );

  const useCaseSansProclamations = new GenererSyntheseResultatsEcoleUseCase(
    depotSynthese,
    {
      async sauvegarder() {},
      async trouverParClasseEtColonne() { return null; },
      async listerParClasseEtAnnee() { return []; },
      async listerParEcoleEtColonne() { return []; },
      async listerHistoriqueProclamations() { return []; },
      async changerEtatProclamation() {},
      async verrouillerProclamation() {},
    },
    new TransactionManagerMemoire(),
    new AutorisationGenerationSynthesePortMemoire(),
    undefined,
    undefined,
    {
      async consulterEleve() { return null; },
      async consulterInscription() { return null; },
      async consulterClassePedagogique() { return null; },
      async verifierAbandon() { return null; },
    },
  );

  await assert.rejects(
    () => useCaseSansProclamations.executer({
      idEcole: 'ecole-1',
      idAnneeScolaire: 'annee-1',
      codeColonne: CodeColonneBulletin.TOTAL_GENERAL,
      typeSynthese: TypeSyntheseResultats.ANNUELLE,
      idUtilisateur: 'user-1',
    }),
    /aucune proclamation exploitable/i,
  );
});

test("l'initialisation d'une synthese verifie localement le droit proclamations.generate sur les classes consolidees", async () => {
  const depotSynthese: DepotSyntheseResultatsEcole = {
    async sauvegarder() {},
    async trouverParEcoleEtColonne() { return null; },
    async listerParAnnee() { return []; },
  };
  const proclamation = creerProclamation({
    idProclamationClasse: 'proclamation-a',
    idEcole: 'ecole-1',
    idClassePedagogique: 'classe-1',
    idAnneeScolaire: 'annee-1',
    codeColonne: CodeColonneBulletin.TOTAL_GENERAL,
  });
  proclamation.calculerStatistiques();
  const depotProclamation: DepotProclamationClasse = {
    async sauvegarder() {},
    async trouverParClasseEtColonne() { return proclamation; },
    async listerParClasseEtAnnee() { return [proclamation]; },
    async listerParEcoleEtColonne() { return [proclamation]; },
    async listerHistoriqueProclamations() { return [proclamation]; },
    async changerEtatProclamation() {},
    async verrouillerProclamation() {},
  };
  const autorisation = new AutorisationGenerationSynthesePortMemoire();
  const useCase = new InitialiserSyntheseResultatsEcoleUseCase(
    depotSynthese,
    depotProclamation,
    new TransactionManagerMemoire(),
    autorisation,
  );

  await useCase.executer({
    idEcole: 'ecole-1',
    idAnneeScolaire: 'annee-1',
    codeColonne: CodeColonneBulletin.TOTAL_GENERAL,
    typeSynthese: TypeSyntheseResultats.ANNUELLE,
    creePar: 'user-1',
  });

  assert.deepEqual(autorisation.dernierContexteInitialisation, {
    idUtilisateur: 'user-1',
    idEcole: 'ecole-1',
    idAnneeScolaire: 'annee-1',
    idClassesPedagogiques: ['classe-1'],
  });
});

test("l'initialisation d'une synthese refuse un utilisateur non autorise localement", async () => {
  const depotSynthese: DepotSyntheseResultatsEcole = {
    async sauvegarder() {},
    async trouverParEcoleEtColonne() { return null; },
    async listerParAnnee() { return []; },
  };
  const proclamation = creerProclamation({
    idProclamationClasse: 'proclamation-a',
    idEcole: 'ecole-1',
    idClassePedagogique: 'classe-1',
    idAnneeScolaire: 'annee-1',
    codeColonne: CodeColonneBulletin.TOTAL_GENERAL,
  });
  const depotProclamation: DepotProclamationClasse = {
    async sauvegarder() {},
    async trouverParClasseEtColonne() { return proclamation; },
    async listerParClasseEtAnnee() { return [proclamation]; },
    async listerParEcoleEtColonne() { return [proclamation]; },
    async listerHistoriqueProclamations() { return [proclamation]; },
    async changerEtatProclamation() {},
    async verrouillerProclamation() {},
  };
  const useCase = new InitialiserSyntheseResultatsEcoleUseCase(
    depotSynthese,
    depotProclamation,
    new TransactionManagerMemoire(),
    new AutorisationGenerationSynthesePortMemoire(undefined, new Error('PERMISSION_REFUSED')),
  );

  await assert.rejects(
    () => useCase.executer({
      idEcole: 'ecole-1',
      idAnneeScolaire: 'annee-1',
      codeColonne: CodeColonneBulletin.TOTAL_GENERAL,
      typeSynthese: TypeSyntheseResultats.ANNUELLE,
      creePar: 'user-1',
    }),
    /PERMISSION_REFUSED/i,
  );
});

test("la generation d'une synthese verifie localement le droit proclamations.generate sur les classes consolidees", async () => {
  const synthese = SyntheseResultatsEcole.initialiser({
    idSyntheseResultatsEcole: 'synthese-ecole-1-annee-1-TOTAL_GENERAL',
    idEcole: 'ecole-1',
    idAnneeScolaire: 'annee-1',
    codeColonne: CodeColonneBulletin.TOTAL_GENERAL,
    typeSynthese: TypeSyntheseResultats.ANNUELLE,
    creePar: 'user-1',
    creeLe: new Date('2026-01-01T00:00:00.000Z'),
  });
  const depotSynthese: DepotSyntheseResultatsEcole = {
    async sauvegarder() {},
    async trouverParEcoleEtColonne() { return synthese; },
    async listerParAnnee() { return [synthese]; },
  };
  const proclamation = creerProclamation({
    idProclamationClasse: 'proclamation-a',
    idEcole: 'ecole-1',
    idClassePedagogique: 'classe-1',
    idAnneeScolaire: 'annee-1',
    codeColonne: CodeColonneBulletin.TOTAL_GENERAL,
  });
  proclamation.calculerStatistiques();
  const depotProclamation: DepotProclamationClasse = {
    async sauvegarder() {},
    async trouverParClasseEtColonne() { return proclamation; },
    async listerParClasseEtAnnee() { return [proclamation]; },
    async listerParEcoleEtColonne() { return [proclamation]; },
    async listerHistoriqueProclamations() { return [proclamation]; },
    async changerEtatProclamation() {},
    async verrouillerProclamation() {},
  };
  const autorisation = new AutorisationGenerationSynthesePortMemoire();
  const useCase = new GenererSyntheseResultatsEcoleUseCase(
    depotSynthese,
    depotProclamation,
    new TransactionManagerMemoire(),
    autorisation,
    undefined,
    undefined,
    {
      async consulterEleve() { return null; },
      async consulterInscription() { return null; },
      async consulterClassePedagogique() {
        return {
          idClassePedagogique: 'classe-1',
          libelleClasse: '1re A',
          idEcole: 'ecole-1',
        };
      },
      async verifierAbandon() { return null; },
    },
  );

  await useCase.executer({
    idEcole: 'ecole-1',
    idAnneeScolaire: 'annee-1',
    codeColonne: CodeColonneBulletin.TOTAL_GENERAL,
    typeSynthese: TypeSyntheseResultats.ANNUELLE,
    idUtilisateur: 'user-1',
  });

  assert.deepEqual(autorisation.dernierContexte, {
    idUtilisateur: 'user-1',
    idEcole: 'ecole-1',
    idAnneeScolaire: 'annee-1',
    idClassesPedagogiques: ['classe-1'],
  });
});

test("la generation d'une synthese refuse un utilisateur non autorise localement", async () => {
  const synthese = SyntheseResultatsEcole.initialiser({
    idSyntheseResultatsEcole: 'synthese-ecole-1-annee-1-TOTAL_GENERAL',
    idEcole: 'ecole-1',
    idAnneeScolaire: 'annee-1',
    codeColonne: CodeColonneBulletin.TOTAL_GENERAL,
    typeSynthese: TypeSyntheseResultats.ANNUELLE,
    creePar: 'user-1',
    creeLe: new Date('2026-01-01T00:00:00.000Z'),
  });
  const depotSynthese: DepotSyntheseResultatsEcole = {
    async sauvegarder() {},
    async trouverParEcoleEtColonne() { return synthese; },
    async listerParAnnee() { return [synthese]; },
  };
  const proclamation = creerProclamation({
    idProclamationClasse: 'proclamation-a',
    idEcole: 'ecole-1',
    idClassePedagogique: 'classe-1',
    idAnneeScolaire: 'annee-1',
    codeColonne: CodeColonneBulletin.TOTAL_GENERAL,
  });
  proclamation.calculerStatistiques();
  const depotProclamation: DepotProclamationClasse = {
    async sauvegarder() {},
    async trouverParClasseEtColonne() { return proclamation; },
    async listerParClasseEtAnnee() { return [proclamation]; },
    async listerParEcoleEtColonne() { return [proclamation]; },
    async listerHistoriqueProclamations() { return [proclamation]; },
    async changerEtatProclamation() {},
    async verrouillerProclamation() {},
  };
  const useCase = new GenererSyntheseResultatsEcoleUseCase(
    depotSynthese,
    depotProclamation,
    new TransactionManagerMemoire(),
    new AutorisationGenerationSynthesePortMemoire(new Error('PERMISSION_REFUSED')),
    undefined,
    undefined,
    {
      async consulterEleve() { return null; },
      async consulterInscription() { return null; },
      async consulterClassePedagogique() {
        return {
          idClassePedagogique: 'classe-1',
          libelleClasse: '1re A',
          idEcole: 'ecole-1',
        };
      },
      async verifierAbandon() { return null; },
    },
  );

  await assert.rejects(
    () => useCase.executer({
      idEcole: 'ecole-1',
      idAnneeScolaire: 'annee-1',
      codeColonne: CodeColonneBulletin.TOTAL_GENERAL,
      typeSynthese: TypeSyntheseResultats.ANNUELLE,
      idUtilisateur: 'user-1',
    }),
    /PERMISSION_REFUSED/i,
  );
});
