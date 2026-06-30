import test from 'node:test';
import assert from 'node:assert/strict';
import { ActiverQualificationFinanciereEleveUseCase } from '../../../application/use-cases/qualifications-financieres/ActiverQualificationFinanciereEleveUseCase';
import { DesactiverQualificationFinanciereEleveUseCase } from '../../../application/use-cases/qualifications-financieres/DesactiverQualificationFinanciereEleveUseCase';
import { ListerQualificationsFinancieresEleveUseCase } from '../../../application/use-cases/qualifications-financieres/ListerQualificationsFinancieresEleveUseCase';
import { CodeQualificationFinanciereEleve } from '../../../domain/value-objects/CodeQualificationFinanciereEleve';
import { QualificationFinanciereEleve } from '../../../domain/aggregates/QualificationFinanciereEleve';
import { StatutQualificationFinanciereEleve } from '../../../domain/value-objects/StatutQualificationFinanciereEleve';

test('QualificationFinanciereEleve active puis desactive ENFANT_AGENT sans dupliquer le statut', async () => {
  const depot = new Map<string, QualificationFinanciereEleve>();
  const repository = {
    async sauvegarder(qualification: QualificationFinanciereEleve) {
      depot.set(qualification.obtenirId(), qualification);
    },
    async trouverParId(idQualification: string) {
      return depot.get(idQualification) ?? null;
    },
    async trouverActiveParEleveEtCode(params: { idEcole: string; idEleve: string; codeQualification: CodeQualificationFinanciereEleve }) {
      return Array.from(depot.values()).find((qualification) =>
        qualification.obtenirIdEcole() === params.idEcole
        && qualification.obtenirIdEleve() === params.idEleve
        && qualification.obtenirCodeQualification() === params.codeQualification
        && qualification.obtenirStatut() === StatutQualificationFinanciereEleve.ACTIVE) ?? null;
    },
    async listerParEleve(idEcole: string, idEleve: string) {
      return Array.from(depot.values()).filter((qualification) =>
        qualification.obtenirIdEcole() === idEcole
        && qualification.obtenirIdEleve() === idEleve);
    },
  };
  const autorisation = {
    async verifierGestionQualification() { return; },
    async verifierConsultationQualification() { return; },
  };

  const activer = new ActiverQualificationFinanciereEleveUseCase(repository, autorisation);
  const desactiver = new DesactiverQualificationFinanciereEleveUseCase(repository, autorisation);
  const lister = new ListerQualificationsFinancieresEleveUseCase(repository, autorisation);

  const qualification = await activer.executer({
    idOrganisation: 'ORG-1',
    idEcole: 'ECOLE-1',
    idUtilisateur: 'USER-1',
    idEleve: 'ELEVE-1',
    codeQualification: CodeQualificationFinanciereEleve.ENFANT_AGENT,
    raison: 'Enfant d un agent de l ecole',
  });

  assert.equal(qualification.codeQualification, CodeQualificationFinanciereEleve.ENFANT_AGENT);
  assert.equal(qualification.statut, StatutQualificationFinanciereEleve.ACTIVE);

  const reactive = await activer.executer({
    idOrganisation: 'ORG-1',
    idEcole: 'ECOLE-1',
    idUtilisateur: 'USER-1',
    idEleve: 'ELEVE-1',
    codeQualification: CodeQualificationFinanciereEleve.ENFANT_AGENT,
  });
  assert.equal(reactive.idQualification, qualification.idQualification);

  const desactivee = await desactiver.executer({
    idOrganisation: 'ORG-1',
    idEcole: 'ECOLE-1',
    idUtilisateur: 'USER-1',
    idQualification: qualification.idQualification,
    raison: 'Fin du lien avec l agent',
    dateFinEffet: '2026-06-26',
  });
  assert.equal(desactivee.statut, StatutQualificationFinanciereEleve.DESACTIVEE);

  const liste = await lister.executer({
    idOrganisation: 'ORG-1',
    idEcole: 'ECOLE-1',
    idUtilisateur: 'USER-1',
    idEleve: 'ELEVE-1',
  });
  assert.equal(liste.length, 1);
  assert.equal(liste[0]?.statut, StatutQualificationFinanciereEleve.DESACTIVEE);
});
