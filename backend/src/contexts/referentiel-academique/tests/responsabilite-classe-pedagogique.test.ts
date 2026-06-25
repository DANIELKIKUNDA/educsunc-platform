import test from 'node:test';
import assert from 'node:assert/strict';
import { Pagination, ResultatPagine } from '../../../shared/application/Pagination';
import { AttribuerResponsableClassePedagogique } from '../application/use-cases/structure/AttribuerResponsableClassePedagogique';
import { AnneeScolaire } from '../domain/aggregates/AnneeScolaire';
import { ClasseAcademique } from '../domain/aggregates/ClasseAcademique';
import { ClassePedagogique } from '../domain/aggregates/ClassePedagogique';
import { Ecole } from '../domain/aggregates/Ecole';
import { ResponsabiliteClassePedagogique } from '../domain/aggregates/ResponsabiliteClassePedagogique';
import { SectionScolaire } from '../domain/aggregates/SectionScolaire';
import { ErreurResponsabiliteClassePedagogiqueDupliquee } from '../domain/exceptions/ErreurResponsabiliteClassePedagogiqueDupliquee';
import { DepotAnneeScolaire } from '../domain/repositories/DepotAnneeScolaire';
import { DepotClasseAcademique } from '../domain/repositories/DepotClasseAcademique';
import { DepotClassePedagogique } from '../domain/repositories/DepotClassePedagogique';
import { DepotEcole } from '../domain/repositories/DepotEcole';
import { DepotResponsabiliteClassePedagogique } from '../domain/repositories/DepotResponsabiliteClassePedagogique';
import { DepotSectionScolaire } from '../domain/repositories/DepotSectionScolaire';
import { AnneeScolaireId } from '../domain/value-objects/AnneeScolaireId';
import { ClasseAcademiqueId } from '../domain/value-objects/ClasseAcademiqueId';
import { ClassePedagogiqueId } from '../domain/value-objects/ClassePedagogiqueId';
import { EcoleId } from '../domain/value-objects/EcoleId';
import { ModeExploitation } from '../domain/value-objects/ModeExploitation';
import { OrdreClasse } from '../domain/value-objects/OrdreClasse';
import { OrganisationId } from '../domain/value-objects/OrganisationId';
import { SectionScolaireId } from '../domain/value-objects/SectionScolaireId';
import { StatutAnneeScolaire } from '../domain/value-objects/StatutAnneeScolaire';
import { TypeStructureEvaluation } from '../domain/value-objects/TypeStructureEvaluation';
import type { VerifierEligibiliteResponsableClassePedagogiquePort } from '../application/ports/VerifierEligibiliteResponsableClassePedagogiquePort';

class VerifierEligibiliteResponsableClassePedagogiquePortMemoire
  implements VerifierEligibiliteResponsableClassePedagogiquePort
{
  constructor(
    private readonly resultat: {
      utilisateurExiste: boolean;
      utilisateurActif: boolean;
      codeRoleActif?: string;
      idOrganisation?: string;
      idEcole?: string;
    } = {
      utilisateurExiste: true,
      utilisateurActif: true,
      codeRoleActif: 'ENSEIGNANT',
      idOrganisation: 'org-1',
      idEcole: 'ecole-1',
    },
  ) {}

  public async verifier() {
    return this.resultat;
  }
}

class DepotResponsabiliteClassePedagogiqueMemoire implements DepotResponsabiliteClassePedagogique {
  private readonly responsabilites = new Map<string, ResponsabiliteClassePedagogique>();

  public async trouverActiveParClasseEtAnnee(
    idClassePedagogique: ClassePedagogiqueId,
    idAnneeScolaire: AnneeScolaireId,
  ): Promise<ResponsabiliteClassePedagogique | null> {
    return [...this.responsabilites.values()].find((responsabilite) =>
      responsabilite.estActive()
      && responsabilite.correspondAClasseEtAnnee(idClassePedagogique, idAnneeScolaire)) ?? null;
  }

  public async sauvegarder(responsabiliteClassePedagogique: ResponsabiliteClassePedagogique): Promise<void> {
    this.responsabilites.set(
      responsabiliteClassePedagogique.obtenirId().obtenirValeur(),
      responsabiliteClassePedagogique,
    );
  }
}

class DepotClassePedagogiqueMemoire implements DepotClassePedagogique {
  constructor(private readonly classes = new Map<string, ClassePedagogique>()) {}

  public ajouter(classePedagogique: ClassePedagogique): void {
    this.classes.set(classePedagogique.obtenirId().obtenirValeur(), classePedagogique);
  }

  public async trouverParId(idClassePedagogique: ClassePedagogiqueId): Promise<ClassePedagogique | null> {
    return this.classes.get(idClassePedagogique.obtenirValeur()) ?? null;
  }

  public async trouverParCodeDansContexte(): Promise<ClassePedagogique | null> {
    return null;
  }

  public async listerParEcoleEtAnnee(): Promise<ResultatPagine<ClassePedagogique>> {
    return { donnees: [], total: 0, page: 1, taillePage: 10 };
  }

  public async sauvegarder(classePedagogique: ClassePedagogique): Promise<void> {
    this.ajouter(classePedagogique);
  }
}

class DepotClasseAcademiqueMemoire implements DepotClasseAcademique {
  constructor(private readonly classes = new Map<string, ClasseAcademique>()) {}

  public ajouter(classeAcademique: ClasseAcademique): void {
    this.classes.set(classeAcademique.obtenirId().obtenirValeur(), classeAcademique);
  }

  public async trouverParId(idClasseAcademique: ClasseAcademiqueId): Promise<ClasseAcademique | null> {
    return this.classes.get(idClasseAcademique.obtenirValeur()) ?? null;
  }

  public async trouverParCode(code: string): Promise<ClasseAcademique | null> {
    return [...this.classes.values()].find((classe) => classe.obtenirCode() === code) ?? null;
  }

  public async listerParSection(): Promise<ResultatPagine<ClasseAcademique>> {
    return { donnees: [], total: 0, page: 1, taillePage: 10 };
  }

  public async lister(): Promise<ResultatPagine<ClasseAcademique>> {
    return { donnees: [], total: 0, page: 1, taillePage: 10 };
  }

  public async sauvegarder(classeAcademique: ClasseAcademique): Promise<void> {
    this.ajouter(classeAcademique);
  }
}

class DepotSectionScolaireMemoire implements DepotSectionScolaire {
  constructor(private readonly sections = new Map<string, SectionScolaire>()) {}

  public ajouter(sectionScolaire: SectionScolaire): void {
    this.sections.set(sectionScolaire.obtenirId().obtenirValeur(), sectionScolaire);
  }

  public async trouverParId(idSectionScolaire: SectionScolaireId): Promise<SectionScolaire | null> {
    return this.sections.get(idSectionScolaire.obtenirValeur()) ?? null;
  }

  public async trouverParCode(code: string): Promise<SectionScolaire | null> {
    return [...this.sections.values()].find((section) => section.obtenirCode() === code) ?? null;
  }

  public async listerActives(): Promise<SectionScolaire[]> {
    return [...this.sections.values()].filter((section) => section.estActive());
  }

  public async lister(): Promise<ResultatPagine<SectionScolaire>> {
    return { donnees: [], total: 0, page: 1, taillePage: 10 };
  }

  public async sauvegarder(sectionScolaire: SectionScolaire): Promise<void> {
    this.ajouter(sectionScolaire);
  }
}

class DepotEcoleMemoire implements DepotEcole {
  constructor(private readonly ecoles = new Map<string, Ecole>()) {}

  public ajouter(ecole: Ecole): void {
    this.ecoles.set(ecole.obtenirId().obtenirValeur(), ecole);
  }

  public async trouverParId(idEcole: EcoleId): Promise<Ecole | null> {
    return this.ecoles.get(idEcole.obtenirValeur()) ?? null;
  }

  public async trouverParCode(code: string): Promise<Ecole | null> {
    return [...this.ecoles.values()].find((ecole) => ecole.obtenirCode() === code) ?? null;
  }

  public async listerParOrganisation(): Promise<ResultatPagine<Ecole>> {
    return { donnees: [], total: 0, page: 1, taillePage: 10 };
  }

  public async lister(): Promise<ResultatPagine<Ecole>> {
    return { donnees: [], total: 0, page: 1, taillePage: 10 };
  }

  public async sauvegarder(ecole: Ecole): Promise<void> {
    this.ajouter(ecole);
  }
}

class DepotAnneeScolaireMemoire implements DepotAnneeScolaire {
  constructor(private readonly annees = new Map<string, AnneeScolaire>()) {}

  public ajouter(anneeScolaire: AnneeScolaire): void {
    this.annees.set(anneeScolaire.obtenirId().obtenirValeur(), anneeScolaire);
  }

  public async trouverParId(idAnneeScolaire: AnneeScolaireId): Promise<AnneeScolaire | null> {
    return this.annees.get(idAnneeScolaire.obtenirValeur()) ?? null;
  }

  public async trouverActiveParEcole(): Promise<AnneeScolaire | null> {
    return null;
  }

  public async trouverParCodeEtEcole(): Promise<AnneeScolaire | null> {
    return null;
  }

  public async trouverDerniereParEcole(): Promise<AnneeScolaire | null> {
    return null;
  }

  public async listerPlanifieesParEcole(): Promise<readonly AnneeScolaire[]> {
    return [];
  }

  public async verrouillerActiveParEcole(): Promise<AnneeScolaire | null> {
    return null;
  }

  public async listerParEcole(
    _idEcole: EcoleId,
    pagination: Pagination,
  ): Promise<ResultatPagine<AnneeScolaire>> {
    return { donnees: [], total: 0, page: pagination.page, taillePage: pagination.taillePage };
  }

  public async sauvegarder(anneeScolaire: AnneeScolaire): Promise<void> {
    this.ajouter(anneeScolaire);
  }
}

test("attribue le responsable officiel d'une classe pedagogique primaire", async () => {
  const section = new SectionScolaire(new SectionScolaireId('PRIMAIRE'), 'PRIMAIRE', 'Primaire', 1);
  const classeAcademique = new ClasseAcademique(
    new ClasseAcademiqueId('classe-acad-1'),
    section.obtenirId(),
    '1P',
    'Premiere primaire',
    new OrdreClasse(1),
    'PRIMAIRE',
    false,
    false,
    TypeStructureEvaluation.TRIMESTRIEL,
  );
  const ecole = new Ecole(
    new EcoleId('ecole-1'),
    new OrganisationId('org-1'),
    'ECOLE-1',
    'Ecole Test',
    ModeExploitation.SYNC,
    'ET',
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
  );
  const annee = new AnneeScolaire(
    new AnneeScolaireId('annee-1'),
    ecole.obtenirId(),
    '2026-2027',
    'Annee 2026-2027',
    new Date('2026-09-01T00:00:00.000Z'),
    new Date('2027-07-01T00:00:00.000Z'),
    'tests',
    StatutAnneeScolaire.PLANIFIEE,
    false,
  );
  const classePedagogique = new ClassePedagogique(
    new ClassePedagogiqueId('classe-ped-1'),
    ecole.obtenirId(),
    annee.obtenirId(),
    classeAcademique.obtenirId(),
    '1P-A',
    '1ere primaire A',
  );

  const depotResponsabilite = new DepotResponsabiliteClassePedagogiqueMemoire();
  const depotClassePedagogique = new DepotClassePedagogiqueMemoire(new Map([
    [classePedagogique.obtenirId().obtenirValeur(), classePedagogique],
  ]));
  const depotClasseAcademique = new DepotClasseAcademiqueMemoire(new Map([
    [classeAcademique.obtenirId().obtenirValeur(), classeAcademique],
  ]));
  const depotSection = new DepotSectionScolaireMemoire(new Map([
    [section.obtenirId().obtenirValeur(), section],
  ]));
  const depotAnnee = new DepotAnneeScolaireMemoire(new Map([
    [annee.obtenirId().obtenirValeur(), annee],
  ]));
  const depotEcole = new DepotEcoleMemoire(new Map([
    [ecole.obtenirId().obtenirValeur(), ecole],
  ]));

  const useCase = new AttribuerResponsableClassePedagogique(
    depotResponsabilite,
    depotClassePedagogique,
    depotClasseAcademique,
    depotSection,
    depotAnnee,
    depotEcole,
    new VerifierEligibiliteResponsableClassePedagogiquePortMemoire(),
  );

  const sortie = await useCase.executer({
    idClassePedagogique: 'classe-ped-1',
    idUtilisateurEnseignant: 'enseignant-1',
    creePar: 'admin',
  });

  assert.equal(sortie.responsabiliteClassePedagogique.idEcole, 'ecole-1');
  assert.equal(sortie.responsabiliteClassePedagogique.idOrganisation, 'org-1');
  assert.equal(sortie.responsabiliteClassePedagogique.idUtilisateurEnseignant, 'enseignant-1');
  assert.equal(sortie.responsabiliteClassePedagogique.sectionCode, 'PRIMAIRE');
  assert.equal(sortie.responsabiliteClassePedagogique.active, true);

  const responsabilite = await depotResponsabilite.trouverActiveParClasseEtAnnee(
    classePedagogique.obtenirId(),
    annee.obtenirId(),
  );
  assert.ok(responsabilite !== null);
  assert.equal(responsabilite.obtenirIdUtilisateurEnseignant(), 'enseignant-1');
});

test('refuse un second responsable actif sur la meme classe pedagogique et la meme annee', async () => {
  const section = new SectionScolaire(new SectionScolaireId('PRIMAIRE'), 'PRIMAIRE', 'Primaire', 1);
  const classeAcademique = new ClasseAcademique(
    new ClasseAcademiqueId('classe-acad-1'),
    section.obtenirId(),
    '1P',
    'Premiere primaire',
    new OrdreClasse(1),
    'PRIMAIRE',
    false,
    false,
    TypeStructureEvaluation.TRIMESTRIEL,
  );
  const ecole = new Ecole(
    new EcoleId('ecole-1'),
    new OrganisationId('org-1'),
    'ECOLE-1',
    'Ecole Test',
    ModeExploitation.SYNC,
    'ET',
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
  );
  const annee = new AnneeScolaire(
    new AnneeScolaireId('annee-1'),
    ecole.obtenirId(),
    '2026-2027',
    'Annee 2026-2027',
    new Date('2026-09-01T00:00:00.000Z'),
    new Date('2027-07-01T00:00:00.000Z'),
    'tests',
  );
  const classePedagogique = new ClassePedagogique(
    new ClassePedagogiqueId('classe-ped-1'),
    ecole.obtenirId(),
    annee.obtenirId(),
    classeAcademique.obtenirId(),
    '1P-A',
    '1ere primaire A',
  );

  const depotResponsabilite = new DepotResponsabiliteClassePedagogiqueMemoire();
  const depotClassePedagogique = new DepotClassePedagogiqueMemoire(new Map([
    [classePedagogique.obtenirId().obtenirValeur(), classePedagogique],
  ]));
  const depotClasseAcademique = new DepotClasseAcademiqueMemoire(new Map([
    [classeAcademique.obtenirId().obtenirValeur(), classeAcademique],
  ]));
  const depotSection = new DepotSectionScolaireMemoire(new Map([
    [section.obtenirId().obtenirValeur(), section],
  ]));
  const depotAnnee = new DepotAnneeScolaireMemoire(new Map([
    [annee.obtenirId().obtenirValeur(), annee],
  ]));
  const depotEcole = new DepotEcoleMemoire(new Map([
    [ecole.obtenirId().obtenirValeur(), ecole],
  ]));

  const useCase = new AttribuerResponsableClassePedagogique(
    depotResponsabilite,
    depotClassePedagogique,
    depotClasseAcademique,
    depotSection,
    depotAnnee,
    depotEcole,
    new VerifierEligibiliteResponsableClassePedagogiquePortMemoire(),
  );

  await useCase.executer({
    idClassePedagogique: 'classe-ped-1',
    idUtilisateurEnseignant: 'enseignant-1',
    creePar: 'admin',
  });

  await assert.rejects(
    () =>
      useCase.executer({
        idClassePedagogique: 'classe-ped-1',
        idUtilisateurEnseignant: 'enseignant-2',
        creePar: 'admin',
      }),
    ErreurResponsabiliteClassePedagogiqueDupliquee,
  );
});

test("refuse d'attribuer un responsable de classe a un utilisateur non enseignant", async () => {
  const section = new SectionScolaire(new SectionScolaireId('PRIMAIRE'), 'PRIMAIRE', 'Primaire', 1);
  const classeAcademique = new ClasseAcademique(
    new ClasseAcademiqueId('classe-acad-1'),
    section.obtenirId(),
    '1P',
    'Premiere primaire',
    new OrdreClasse(1),
    'PRIMAIRE',
    false,
    false,
    TypeStructureEvaluation.TRIMESTRIEL,
  );
  const ecole = new Ecole(
    new EcoleId('ecole-1'),
    new OrganisationId('org-1'),
    'ECOLE-1',
    'Ecole Test',
    ModeExploitation.SYNC,
    'ET',
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
  );
  const annee = new AnneeScolaire(
    new AnneeScolaireId('annee-1'),
    ecole.obtenirId(),
    '2026-2027',
    'Annee 2026-2027',
    new Date('2026-09-01T00:00:00.000Z'),
    new Date('2027-07-01T00:00:00.000Z'),
    'tests',
  );
  const classePedagogique = new ClassePedagogique(
    new ClassePedagogiqueId('classe-ped-1'),
    ecole.obtenirId(),
    annee.obtenirId(),
    classeAcademique.obtenirId(),
    '1P-A',
    '1ere primaire A',
  );

  const useCase = new AttribuerResponsableClassePedagogique(
    new DepotResponsabiliteClassePedagogiqueMemoire(),
    new DepotClassePedagogiqueMemoire(new Map([
      [classePedagogique.obtenirId().obtenirValeur(), classePedagogique],
    ])),
    new DepotClasseAcademiqueMemoire(new Map([
      [classeAcademique.obtenirId().obtenirValeur(), classeAcademique],
    ])),
    new DepotSectionScolaireMemoire(new Map([
      [section.obtenirId().obtenirValeur(), section],
    ])),
    new DepotAnneeScolaireMemoire(new Map([
      [annee.obtenirId().obtenirValeur(), annee],
    ])),
    new DepotEcoleMemoire(new Map([
      [ecole.obtenirId().obtenirValeur(), ecole],
    ])),
    new VerifierEligibiliteResponsableClassePedagogiquePortMemoire({
      utilisateurExiste: true,
      utilisateurActif: true,
      codeRoleActif: 'CAISSIER',
      idOrganisation: 'org-1',
      idEcole: 'ecole-1',
    }),
  );

  await assert.rejects(
    () =>
      useCase.executer({
        idClassePedagogique: 'classe-ped-1',
        idUtilisateurEnseignant: 'utilisateur-non-enseignant',
        creePar: 'admin',
      }),
    /ENSEIGNANT/,
  );
});
