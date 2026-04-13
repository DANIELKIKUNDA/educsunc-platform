import test from 'node:test';
import assert from 'node:assert/strict';
import { Pagination, ResultatPagine } from '../../../shared/application/Pagination';
import { AnneeScolaire } from '../domain/aggregates/AnneeScolaire';
import { Ecole } from '../domain/aggregates/Ecole';
import { ErreurAnneeScolaireInvalide } from '../domain/exceptions/ErreurAnneeScolaireInvalide';
import { DepotAnneeScolaire } from '../domain/repositories/DepotAnneeScolaire';
import { DepotEcole } from '../domain/repositories/DepotEcole';
import { AnneeScolaireId } from '../domain/value-objects/AnneeScolaireId';
import { EcoleId } from '../domain/value-objects/EcoleId';
import { ModeExploitation } from '../domain/value-objects/ModeExploitation';
import { OrganisationId } from '../domain/value-objects/OrganisationId';
import { StatutAnneeScolaire } from '../domain/value-objects/StatutAnneeScolaire';
import { BasculerAnneeScolaire } from '../application/use-cases/annees/BasculerAnneeScolaire';
import {
  GarantirAnneeScolaireActiveParEcole,
} from '../application/use-cases/annees/GarantirAnneeScolaireActiveParEcole';
import {
  PreparerAnneeScolaireSuivante,
} from '../application/use-cases/annees/PreparerAnneeScolaireSuivante';

class DepotAnneeScolaireMemoire implements DepotAnneeScolaire {
  private readonly annees = new Map<string, AnneeScolaire>();

  public ajouter(anneeScolaire: AnneeScolaire): void {
    this.annees.set(anneeScolaire.obtenirId().obtenirValeur(), anneeScolaire);
  }

  public async trouverParId(idAnneeScolaire: AnneeScolaireId): Promise<AnneeScolaire | null> {
    return this.annees.get(idAnneeScolaire.obtenirValeur()) ?? null;
  }

  public async trouverActiveParEcole(idEcole: EcoleId): Promise<AnneeScolaire | null> {
    return this.trouverAnneeActive(idEcole);
  }

  public async trouverParCodeEtEcole(
    idEcole: EcoleId,
    code: string,
  ): Promise<AnneeScolaire | null> {
    const codeRecherche = code.trim();

    return this.listerAnneesParEcole(idEcole)
      .find((anneeScolaire) => anneeScolaire.obtenirCode() === codeRecherche) ?? null;
  }

  public async trouverDerniereParEcole(idEcole: EcoleId): Promise<AnneeScolaire | null> {
    const annees = this.listerAnneesParEcole(idEcole)
      .sort((anneeA, anneeB) =>
        anneeB.obtenirDateDebut().getTime() - anneeA.obtenirDateDebut().getTime()
      );

    return annees[0] ?? null;
  }

  public async listerPlanifieesParEcole(idEcole: EcoleId): Promise<readonly AnneeScolaire[]> {
    return this.listerAnneesParEcole(idEcole)
      .filter((anneeScolaire) =>
        anneeScolaire.obtenirStatut() === StatutAnneeScolaire.PLANIFIEE
      )
      .sort((anneeA, anneeB) =>
        anneeA.obtenirDateDebut().getTime() - anneeB.obtenirDateDebut().getTime()
      );
  }

  public async verrouillerActiveParEcole(idEcole: EcoleId): Promise<AnneeScolaire | null> {
    return this.trouverAnneeActive(idEcole);
  }

  public async listerParEcole(
    idEcole: EcoleId,
    pagination: Pagination,
  ): Promise<ResultatPagine<AnneeScolaire>> {
    const annees = this.listerAnneesParEcole(idEcole);
    const debut = (pagination.page - 1) * pagination.taillePage;
    const fin = debut + pagination.taillePage;

    return {
      donnees: annees.slice(debut, fin),
      total: annees.length,
      page: pagination.page,
      taillePage: pagination.taillePage,
    };
  }

  public async sauvegarder(anneeScolaire: AnneeScolaire): Promise<void> {
    this.ajouter(anneeScolaire);
  }

  private trouverAnneeActive(idEcole: EcoleId): AnneeScolaire | null {
    return this.listerAnneesParEcole(idEcole)
      .find((anneeScolaire) => anneeScolaire.estActive()) ?? null;
  }

  private listerAnneesParEcole(idEcole: EcoleId): AnneeScolaire[] {
    return [...this.annees.values()]
      .filter((anneeScolaire) =>
        anneeScolaire.obtenirEcoleId().estEgal(idEcole)
      );
  }
}

class DepotEcoleMemoire implements DepotEcole {
  private readonly ecoles = new Map<string, Ecole>();

  public ajouter(ecole: Ecole): void {
    this.ecoles.set(ecole.obtenirId().obtenirValeur(), ecole);
  }

  public async trouverParId(idEcole: EcoleId): Promise<Ecole | null> {
    return this.ecoles.get(idEcole.obtenirValeur()) ?? null;
  }

  public async trouverParCode(code: string): Promise<Ecole | null> {
    const codeRecherche = code.trim();

    return [...this.ecoles.values()]
      .find((ecole) => ecole.obtenirCode() === codeRecherche) ?? null;
  }

  public async listerParOrganisation(
    idOrganisation: OrganisationId,
    pagination: Pagination,
  ): Promise<ResultatPagine<Ecole>> {
    const ecoles = [...this.ecoles.values()]
      .filter((ecole) => ecole.obtenirOrganisationId().estEgal(idOrganisation));

    return this.paginerEcoles(ecoles, pagination);
  }

  public async lister(pagination: Pagination): Promise<ResultatPagine<Ecole>> {
    return this.paginerEcoles([...this.ecoles.values()], pagination);
  }

  public async sauvegarder(ecole: Ecole): Promise<void> {
    this.ajouter(ecole);
  }

  private paginerEcoles(ecoles: Ecole[], pagination: Pagination): ResultatPagine<Ecole> {
    const debut = (pagination.page - 1) * pagination.taillePage;
    const fin = debut + pagination.taillePage;

    return {
      donnees: ecoles.slice(debut, fin),
      total: ecoles.length,
      page: pagination.page,
      taillePage: pagination.taillePage,
    };
  }
}

test("la preparation annuelle cree une annee suivante planifiee sans toucher l'active", async () => {
  const { depotAnneeScolaire, depotEcole, idEcole } = creerContexteMemoire();
  const anneeActive = creerAnneeScolaire(idEcole, 'annee-2025', '2025-2026');

  anneeActive.activer('admin');
  depotAnneeScolaire.ajouter(anneeActive);

  const casUsage = new PreparerAnneeScolaireSuivante(depotAnneeScolaire, depotEcole);
  const sortie = await casUsage.executer({
    idEcole: idEcole.obtenirValeur(),
    creePar: 'admin',
  });

  assert.equal(sortie.anneeScolaire.code, '2026-2027');
  assert.equal(sortie.anneeScolaire.statut, StatutAnneeScolaire.PLANIFIEE);
  assert.equal(sortie.anneeScolaire.active, false);
  assert.equal(sortie.dejaExistante, false);
  assert.equal(anneeActive.obtenirStatut(), StatutAnneeScolaire.ACTIVE);
});

test('la garantie cree et active une annee courante pour une ecole neuve', async () => {
  const { depotAnneeScolaire, depotEcole, idEcole } = creerContexteMemoire();
  const casUsage = new GarantirAnneeScolaireActiveParEcole(
    depotAnneeScolaire,
    depotEcole,
  );
  const sortie = await casUsage.executer({
    idEcole: idEcole.obtenirValeur(),
    modifiePar: 'admin',
    dateReference: new Date(Date.UTC(2026, 7, 10)),
  });

  assert.equal(sortie.action, 'CREEE_ET_ACTIVEE');
  assert.equal(sortie.anneeScolaire.code, '2026-2027');
  assert.equal(sortie.anneeScolaire.statut, StatutAnneeScolaire.ACTIVE);
  assert.equal(sortie.anneeScolaire.active, true);
});

test("la garantie active l'unique annee planifiee quand aucune annee active n'existe", async () => {
  const { depotAnneeScolaire, depotEcole, idEcole } = creerContexteMemoire();
  const anneePlanifiee = creerAnneeScolaire(idEcole, 'annee-2026', '2026-2027');

  depotAnneeScolaire.ajouter(anneePlanifiee);

  const casUsage = new GarantirAnneeScolaireActiveParEcole(
    depotAnneeScolaire,
    depotEcole,
  );
  const sortie = await casUsage.executer({
    idEcole: idEcole.obtenirValeur(),
    modifiePar: 'admin',
  });

  assert.equal(sortie.action, 'PLANIFIEE_ACTIVEE');
  assert.equal(sortie.anneeScolaire.id, anneePlanifiee.obtenirId().obtenirValeur());
  assert.equal(anneePlanifiee.obtenirStatut(), StatutAnneeScolaire.ACTIVE);
});

test('la garantie refuse de choisir automatiquement entre plusieurs annees planifiees', async () => {
  const { depotAnneeScolaire, depotEcole, idEcole } = creerContexteMemoire();

  depotAnneeScolaire.ajouter(creerAnneeScolaire(idEcole, 'annee-2026', '2026-2027'));
  depotAnneeScolaire.ajouter(creerAnneeScolaire(idEcole, 'annee-2027', '2027-2028'));

  const casUsage = new GarantirAnneeScolaireActiveParEcole(
    depotAnneeScolaire,
    depotEcole,
  );

  await assert.rejects(
    () => casUsage.executer({
      idEcole: idEcole.obtenirValeur(),
      modifiePar: 'admin',
    }),
    ErreurAnneeScolaireInvalide,
  );
});

test("la bascule cloture l'active et active immediatement l'annee suivante", async () => {
  const { depotAnneeScolaire, depotEcole, idEcole } = creerContexteMemoire();
  const anneeActive = creerAnneeScolaire(idEcole, 'annee-2025', '2025-2026');
  const anneeSuivante = creerAnneeScolaire(idEcole, 'annee-2026', '2026-2027');

  anneeActive.activer('admin');
  depotAnneeScolaire.ajouter(anneeActive);
  depotAnneeScolaire.ajouter(anneeSuivante);

  const casUsage = new BasculerAnneeScolaire(depotAnneeScolaire, depotEcole);
  const sortie = await casUsage.executer({
    idEcole: idEcole.obtenirValeur(),
    modifiePar: 'admin',
    creerSuivanteSiAbsente: false,
  });

  assert.equal(sortie.anneeCloturee.id, anneeActive.obtenirId().obtenirValeur());
  assert.equal(sortie.anneeCloturee.statut, StatutAnneeScolaire.CLOTUREE);
  assert.equal(sortie.anneeActive.id, anneeSuivante.obtenirId().obtenirValeur());
  assert.equal(sortie.anneeActive.statut, StatutAnneeScolaire.ACTIVE);
  assert.equal(sortie.anneeSuivanteCreee, false);
  assert.equal(anneeActive.estActive(), false);
  assert.equal(anneeSuivante.estActive(), true);
});

function creerContexteMemoire(): {
  depotAnneeScolaire: DepotAnneeScolaireMemoire;
  depotEcole: DepotEcoleMemoire;
  idEcole: EcoleId;
} {
  const depotAnneeScolaire = new DepotAnneeScolaireMemoire();
  const depotEcole = new DepotEcoleMemoire();
  const idEcole = new EcoleId('ecole-test');

  depotEcole.ajouter(
    new Ecole(
      idEcole,
      new OrganisationId('organisation-test'),
      'ECOLE-TEST',
      'Ecole Test',
      ModeExploitation.SYNC,
      'ET',
      undefined,
      undefined,
      undefined,
      'admin',
    ),
  );

  return {
    depotAnneeScolaire,
    depotEcole,
    idEcole,
  };
}

function creerAnneeScolaire(
  idEcole: EcoleId,
  idAnnee: string,
  code: string,
): AnneeScolaire {
  const anneeDebut = Number.parseInt(code.slice(0, 4), 10);

  return new AnneeScolaire(
    new AnneeScolaireId(idAnnee),
    idEcole,
    code,
    `Annee scolaire ${code}`,
    new Date(Date.UTC(anneeDebut, 6, 1)),
    new Date(Date.UTC(anneeDebut + 1, 5, 30)),
    'admin',
  );
}
