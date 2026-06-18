import assert from 'node:assert/strict';
import test from 'node:test';
import type { AutorisationExonerationPort } from '../../../application/ports/AutorisationExonerationPort';
import { AccorderExonerationUseCase } from '../../../application/use-cases/exonerations/AccorderExonerationUseCase';
import { AnnulerExonerationUseCase } from '../../../application/use-cases/exonerations/AnnulerExonerationUseCase';
import { Exoneration } from '../../../domain/aggregates/Exoneration';
import { ObligationFinanciereEleve } from '../../../domain/aggregates/ObligationFinanciereEleve';
import type { DepotExoneration } from '../../../domain/repositories/DepotExoneration';
import type { DepotObligationFinanciere } from '../../../domain/repositories/DepotObligationFinanciere';
import { Money } from '../../../domain/value-objects/Money';
import { OrigineObligation } from '../../../domain/value-objects/OrigineObligation';
import { ReferenceFrais } from '../../../domain/value-objects/ReferenceFrais';
import { StatutExoneration } from '../../../domain/value-objects/StatutExoneration';
import { TypeExoneration } from '../../../domain/value-objects/TypeExoneration';
import { TypeFrais } from '../../../domain/value-objects/TypeFrais';

class DepotObligationMemoire implements DepotObligationFinanciere {
  public readonly sauvegardes: ObligationFinanciereEleve[] = [];

  constructor(private readonly obligations: ObligationFinanciereEleve[]) {}

  public async sauvegarder(obligation: ObligationFinanciereEleve): Promise<void> {
    this.sauvegardes.push(obligation);
  }

  public async trouverParId(idObligation: string): Promise<ObligationFinanciereEleve | null> {
    return this.obligations.find((obligation) => obligation.obtenirId() === idObligation) ?? null;
  }

  public async listerParEleveEtAnnee(): Promise<ObligationFinanciereEleve[]> {
    return this.obligations;
  }
}

class DepotExonerationMemoire implements DepotExoneration {
  public readonly sauvegardes: Exoneration[] = [];

  constructor(private readonly exonerations: Exoneration[] = []) {}

  public async sauvegarder(exoneration: Exoneration): Promise<void> {
    const index = this.exonerations.findIndex((courante) => courante.obtenirId() === exoneration.obtenirId());
    if (index >= 0) {
      this.exonerations[index] = exoneration;
    } else {
      this.exonerations.push(exoneration);
    }
    this.sauvegardes.push(exoneration);
  }

  public async trouverParId(idExoneration: string): Promise<Exoneration | null> {
    return this.exonerations.find((exoneration) => exoneration.obtenirId() === idExoneration) ?? null;
  }

  public async listerParEleve(idEcole: string, idEleve: string): Promise<Exoneration[]> {
    return this.exonerations.filter((exoneration) =>
      exoneration.obtenirIdEcole() === idEcole && exoneration.obtenirIdEleve() === idEleve,
    );
  }
}

class AutorisationExonerationMemoire implements AutorisationExonerationPort {
  public readonly appels: Array<{
    idUtilisateur: string;
    idOrganisation: string;
    idEcole: string;
    idEleve: string;
  }> = [];

  constructor(private readonly doitRefuser = false) {}

  public async verifierGestionExoneration(params: {
    idUtilisateur: string;
    idOrganisation: string;
    idEcole: string;
    idEleve: string;
  }): Promise<void> {
    this.appels.push(params);
    if (this.doitRefuser) {
      throw new Error('ACCES_REFUSE');
    }
  }
}

function creerObligation(): ObligationFinanciereEleve {
  return ObligationFinanciereEleve.creer({
    idObligation: 'OBL-001',
    idEcole: 'ECOLE-001',
    idEleve: 'ELEVE-001',
    idAnneeScolaire: 'ANNEE-001',
    typeFrais: TypeFrais.FRAIS_SCOLAIRES,
    referenceFrais: new ReferenceFrais('FRAIS_SCOLAIRES_MAI'),
    libelle: 'Frais scolaires mai',
    montantDuHistorique: new Money(10_000, 'CDF'),
    origineCreation: OrigineObligation.GENERATION_INITIALE,
    creePar: 'UTIL-001',
  });
}

function creerExonerationAccordee(): Exoneration {
  return new Exoneration({
    idExoneration: 'EXO-001',
    idEcole: 'ECOLE-001',
    idEleve: 'ELEVE-001',
    idObligation: 'OBL-001',
    typeExoneration: TypeExoneration.AUTRE,
    montantExonere: new Money(4_000, 'CDF'),
    raison: 'Bourse',
    validePar: 'ADMIN-001',
    valideeLe: new Date('2026-06-11T10:00:00.000Z'),
    statut: StatutExoneration.ACCORDEE,
  });
}

test('AccorderExoneration applique une exonération autorisée sur l’obligation du bon périmètre', async () => {
  const depotObligation = new DepotObligationMemoire([creerObligation()]);
  const depotExoneration = new DepotExonerationMemoire();
  const autorisation = new AutorisationExonerationMemoire();
  const casUsage = new AccorderExonerationUseCase(
    depotExoneration,
    depotObligation,
    autorisation,
  );

  const sortie = await casUsage.executer({
    idOrganisation: 'ORG-001',
    idUtilisateur: 'UTIL-001',
    idEcole: 'ECOLE-001',
    idEleve: 'ELEVE-001',
    idObligation: 'OBL-001',
    typeExoneration: TypeExoneration.AUTRE,
    montantExonere: new Money(3_000, 'CDF'),
    raison: 'Appui social',
    validePar: 'UTIL-001',
  });

  assert.equal(sortie.montantExonere.obtenirMontant(), 3_000);
  assert.equal(depotObligation.sauvegardes[0]?.obtenirMontantExonere().obtenirMontant(), 3_000);
  assert.equal(depotObligation.sauvegardes[0]?.obtenirSolde().obtenirMontant(), 7_000);
  assert.equal(depotExoneration.sauvegardes.length, 1);
  assert.deepEqual(autorisation.appels[0], {
    idUtilisateur: 'UTIL-001',
    idOrganisation: 'ORG-001',
    idEcole: 'ECOLE-001',
    idEleve: 'ELEVE-001',
  });
});

test('AccorderExoneration refuse une obligation hors périmètre école/élève', async () => {
  const depotObligation = new DepotObligationMemoire([creerObligation()]);
  const depotExoneration = new DepotExonerationMemoire();
  const autorisation = new AutorisationExonerationMemoire();
  const casUsage = new AccorderExonerationUseCase(
    depotExoneration,
    depotObligation,
    autorisation,
  );

  await assert.rejects(() => casUsage.executer({
    idOrganisation: 'ORG-001',
    idUtilisateur: 'UTIL-001',
    idEcole: 'ECOLE-002',
    idEleve: 'ELEVE-001',
    idObligation: 'OBL-001',
    typeExoneration: TypeExoneration.AUTRE,
    montantExonere: new Money(3_000, 'CDF'),
    raison: 'Appui social',
    validePar: 'UTIL-001',
  }));
});

test('AccorderExoneration propage un refus de sécurité locale', async () => {
  const depotObligation = new DepotObligationMemoire([creerObligation()]);
  const depotExoneration = new DepotExonerationMemoire();
  const autorisation = new AutorisationExonerationMemoire(true);
  const casUsage = new AccorderExonerationUseCase(
    depotExoneration,
    depotObligation,
    autorisation,
  );

  await assert.rejects(() => casUsage.executer({
    idOrganisation: 'ORG-001',
    idUtilisateur: 'UTIL-001',
    idEcole: 'ECOLE-001',
    idEleve: 'ELEVE-001',
    idObligation: 'OBL-001',
    typeExoneration: TypeExoneration.AUTRE,
    montantExonere: new Money(3_000, 'CDF'),
    raison: 'Appui social',
    validePar: 'UTIL-001',
  }));
});

test('AnnulerExoneration restaure le montant exonéré de l’obligation', async () => {
  const obligation = creerObligation();
  obligation.appliquerExoneration(new Money(4_000, 'CDF'));
  const exoneration = creerExonerationAccordee();
  const depotObligation = new DepotObligationMemoire([obligation]);
  const depotExoneration = new DepotExonerationMemoire([exoneration]);
  const autorisation = new AutorisationExonerationMemoire();
  const casUsage = new AnnulerExonerationUseCase(
    depotExoneration,
    depotObligation,
    autorisation,
  );

  const sortie = await casUsage.executer({
    idOrganisation: 'ORG-001',
    idUtilisateur: 'UTIL-001',
    idEcole: 'ECOLE-001',
    idExoneration: 'EXO-001',
  });

  assert.equal(sortie.statut, StatutExoneration.ANNULEE);
  assert.equal(depotObligation.sauvegardes[0]?.obtenirMontantExonere().obtenirMontant(), 0);
  assert.equal(depotObligation.sauvegardes[0]?.obtenirSolde().obtenirMontant(), 10_000);
});
