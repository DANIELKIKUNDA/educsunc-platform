import test from 'node:test';
import assert from 'node:assert/strict';
import { ConsulterFichesCotationClasseCoursUseCase } from 'contexts/bulletins-evaluations/application/use-cases/ConsulterFichesCotationClasseCours/ConsulterFichesCotationClasseCoursUseCase';
import { EncoderCoteUseCase } from 'contexts/bulletins-evaluations/application/use-cases/EncoderCote/EncoderCoteUseCase';
import { ModifierCoteUseCase } from 'contexts/bulletins-evaluations/application/use-cases/ModifierCote/ModifierCoteUseCase';
import { ViderCoteUseCase } from 'contexts/bulletins-evaluations/application/use-cases/ViderCote/ViderCoteUseCase';
import type { AutorisationEncodageCotesPort } from 'contexts/bulletins-evaluations/application/ports/out/AutorisationEncodageCotesPort';
import type { ScolariteElevesPort } from 'contexts/bulletins-evaluations/application/ports/out/ScolariteElevesPort';
import type { DepotFicheCotationEleveCours } from 'contexts/bulletins-evaluations/domain/repositories/DepotFicheCotationEleveCours';
import { CodeColonneBulletin } from 'contexts/bulletins-evaluations/domain/value-objects/CodeColonneBulletin';
import { SexeEleve } from 'contexts/bulletins-evaluations/domain/value-objects/SexeEleve';
import { HistoriqueModificationCote } from 'contexts/bulletins-evaluations/domain/entities/HistoriqueModificationCote';
import { EventBusMemoire, TransactionManagerMemoire } from '../../mocks/BulletinsEvaluationsMocks';
import { creerFicheCotation } from '../../factories/BulletinsEvaluationsFactories';

class AutorisationEncodageCotesPortMemoire implements AutorisationEncodageCotesPort {
  public consultations: Array<Record<string, string | undefined>> = [];
  public encodages: Array<Record<string, string | undefined>> = [];

  constructor(private readonly erreur?: Error) {}

  public async verifierConsultationFichesClasseCours(params: {
    idUtilisateur: string;
    idOrganisation?: string;
    idEcole: string;
    idClassePedagogique: string;
    idReferentielCours: string;
    idAnneeScolaire: string;
  }): Promise<void> {
    this.consultations.push(params);

    if (this.erreur) {
      throw this.erreur;
    }
  }

  public async verifierEncodageCotes(params: {
    idUtilisateur: string;
    idOrganisation?: string;
    idEcole: string;
    idClassePedagogique: string;
    idReferentielCours: string;
    idAnneeScolaire: string;
  }): Promise<void> {
    this.encodages.push(params);

    if (this.erreur) {
      throw this.erreur;
    }
  }
}

function creerScolaritePortMemoire(): ScolariteElevesPort {
  return {
    async consulterEleve(idEleve) {
      return {
        idEleve,
        nomComplet: idEleve === 'eleve-1' ? 'Kanku Ilunga Aime' : 'Kasongo Ruth',
        sexe: idEleve === 'eleve-1' ? SexeEleve.M : SexeEleve.F,
        idEcole: 'ecole-1',
        matricule: idEleve === 'eleve-1' ? 'MAT-001' : 'MAT-002',
        nom: idEleve === 'eleve-1' ? 'Kanku' : 'Kasongo',
        postNom: idEleve === 'eleve-1' ? 'Ilunga' : 'Ruth',
        prenom: idEleve === 'eleve-1' ? 'Aime' : 'Grace',
      };
    },
    async consulterInscription() {
      return null;
    },
    async consulterClassePedagogique() {
      return null;
    },
    async verifierAbandon() {
      return null;
    },
  };
}

function creerDepotFiches(fiches: ReturnType<typeof creerFicheCotation>[]): DepotFicheCotationEleveCours {
  return {
    async sauvegarder() {},
    async trouverParId(idFicheCotationEleveCours) {
      return fiches.find((fiche) => fiche.obtenirId() === idFicheCotationEleveCours) ?? null;
    },
    async trouverParEleveCoursEtAnnee(idEleve, idReferentielCours, idAnneeScolaire) {
      return fiches.find((fiche) =>
        fiche.obtenirIdEleve() === idEleve
        && fiche.obtenirIdReferentielCours() === idReferentielCours
        && fiche.obtenirIdAnneeScolaire() === idAnneeScolaire,
      ) ?? null;
    },
    async listerParEleve(idEleve, idAnneeScolaire) {
      return fiches.filter((fiche) =>
        fiche.obtenirIdEleve() === idEleve && fiche.obtenirIdAnneeScolaire() === idAnneeScolaire,
      );
    },
    async listerParClasseEtCours(idClassePedagogique, idReferentielCours, idAnneeScolaire) {
      return fiches.filter((fiche) =>
        fiche.obtenirIdClassePedagogique() === idClassePedagogique
        && fiche.obtenirIdReferentielCours() === idReferentielCours
        && fiche.obtenirIdAnneeScolaire() === idAnneeScolaire,
      );
    },
    async listerParClasseEtColonne() {
      return fiches;
    },
    async existeFichePourEleveCoursAnnee() {
      return true;
    },
    async ajouterHistoriqueModificationCote(_historiqueModificationCote: HistoriqueModificationCote) {},
    async listerHistoriqueModifications() {
      return [];
    },
  };
}

test("la consultation des fiches par classe, cours et annee ouvre enfin l'espace de travail reel", async () => {
  const fiche1 = creerFicheCotation({
    idFicheCotationEleveCours: 'fiche-1',
    idClassePedagogique: 'classe-1',
    idReferentielCours: 'cours-1',
    idAnneeScolaire: 'annee-1',
    idEleve: 'eleve-1',
  });
  const fiche2 = creerFicheCotation({
    idFicheCotationEleveCours: 'fiche-2',
    idClassePedagogique: 'classe-1',
    idReferentielCours: 'cours-1',
    idAnneeScolaire: 'annee-1',
    idEleve: 'eleve-2',
  });
  const ficheHorsPerimetre = creerFicheCotation({
    idFicheCotationEleveCours: 'fiche-3',
    idClassePedagogique: 'classe-2',
    idReferentielCours: 'cours-1',
    idAnneeScolaire: 'annee-1',
    idEleve: 'eleve-3',
  });
  const autorisation = new AutorisationEncodageCotesPortMemoire();
  const useCase = new ConsulterFichesCotationClasseCoursUseCase(
    creerDepotFiches([fiche1, fiche2, ficheHorsPerimetre]),
    autorisation,
    creerScolaritePortMemoire(),
  );

  const sortie = await useCase.executer({
    idUtilisateur: 'user-1',
    idOrganisation: 'org-1',
    idEcole: 'ecole-1',
    idClassePedagogique: 'classe-1',
    idReferentielCours: 'cours-1',
    idAnneeScolaire: 'annee-1',
  });

  assert.deepEqual(sortie.map((fiche) => fiche.idFicheCotationEleveCours), ['fiche-1', 'fiche-2']);
  assert.deepEqual(sortie[0]?.identiteEleve, {
    nomComplet: 'Kanku Ilunga Aime',
    sexe: SexeEleve.M,
    matricule: 'MAT-001',
    nom: 'Kanku',
    postNom: 'Ilunga',
    prenom: 'Aime',
  });
  assert.deepEqual(autorisation.consultations, [{
    idUtilisateur: 'user-1',
    idOrganisation: 'org-1',
    idEcole: 'ecole-1',
    idClassePedagogique: 'classe-1',
    idReferentielCours: 'cours-1',
    idAnneeScolaire: 'annee-1',
  }]);
});

test("l'encodage, la modification et le vidage reappliquent le verrou local enseignant + perimetre", async () => {
  const fiche = creerFicheCotation({
    idFicheCotationEleveCours: 'fiche-1',
    idClassePedagogique: 'classe-1',
    idReferentielCours: 'cours-1',
    idAnneeScolaire: 'annee-1',
  });
  fiche.encoderCote(CodeColonneBulletin.P1, 10, 'user-1');

  const autorisation = new AutorisationEncodageCotesPortMemoire();
  const depot = creerDepotFiches([fiche]);

  const encoderUseCase = new EncoderCoteUseCase(
    depot,
    new TransactionManagerMemoire(),
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    new EventBusMemoire(),
    undefined,
    undefined,
    undefined,
    autorisation,
  );
  const modifierUseCase = new ModifierCoteUseCase(
    depot,
    new TransactionManagerMemoire(),
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    autorisation,
  );
  const viderUseCase = new ViderCoteUseCase(
    depot,
    new TransactionManagerMemoire(),
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    autorisation,
  );

  await encoderUseCase.executer({
    idFicheCotationEleveCours: 'fiche-1',
    codeColonne: CodeColonneBulletin.P2,
    cote: 9,
    versionAttendue: fiche.obtenirVersion(),
    idUtilisateur: 'user-1',
    idOrganisation: 'org-1',
  });

  await modifierUseCase.executer({
    idFicheCotationEleveCours: 'fiche-1',
    codeColonne: CodeColonneBulletin.P1,
    nouvelleCote: 8,
    versionAttendue: fiche.obtenirVersion(),
    idUtilisateur: 'user-1',
    idOrganisation: 'org-1',
  });

  await viderUseCase.executer({
    idFicheCotationEleveCours: 'fiche-1',
    codeColonne: CodeColonneBulletin.P1,
    versionAttendue: fiche.obtenirVersion(),
    idUtilisateur: 'user-1',
    idOrganisation: 'org-1',
  });

  assert.equal(autorisation.encodages.length, 3);
  assert.deepEqual(autorisation.encodages[0], {
    idUtilisateur: 'user-1',
    idOrganisation: 'org-1',
    idEcole: 'ecole-1',
    idClassePedagogique: 'classe-1',
    idReferentielCours: 'cours-1',
    idAnneeScolaire: 'annee-1',
  });
});

test("l'encodage d'une cote est refuse si le verrou local enseignant + perimetre echoue", async () => {
  const fiche = creerFicheCotation({
    idFicheCotationEleveCours: 'fiche-1',
  });
  const depot = creerDepotFiches([fiche]);
  const useCase = new EncoderCoteUseCase(
    depot,
    new TransactionManagerMemoire(),
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    new AutorisationEncodageCotesPortMemoire(new Error('PERMISSION_REFUSED')),
  );

  await assert.rejects(
    () => useCase.executer({
      idFicheCotationEleveCours: 'fiche-1',
      codeColonne: CodeColonneBulletin.P1,
      cote: 8,
      versionAttendue: fiche.obtenirVersion(),
      idUtilisateur: 'user-2',
    }),
    /PERMISSION_REFUSED/,
  );
});
