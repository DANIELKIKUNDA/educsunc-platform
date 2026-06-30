import assert from 'node:assert/strict';
import test from 'node:test';
import { Eleve } from '../../../domain/aggregates/Eleve';
import { Famille } from '../../../domain/aggregates/Famille';
import type { DepotFamille } from '../../../domain/repositories/DepotFamille';
import type { DepotEleve } from '../../../domain/repositories/DepotEleve';
import { EcoleProvenance } from '../../../domain/value-objects/EcoleProvenance';
import { LienParente } from '../../../domain/value-objects/LienParente';
import { AjouterResponsableFamille } from '../../../application/use-cases/familles/AjouterResponsableFamille';
import { ConsulterFamille } from '../../../application/use-cases/familles/ConsulterFamille';
import { CreerFamille } from '../../../application/use-cases/familles/CreerFamille';
import { DefinirResponsablePrincipal } from '../../../application/use-cases/familles/DefinirResponsablePrincipal';
import { EvaluerFamilleNombreuse } from '../../../application/use-cases/familles/EvaluerFamilleNombreuse';
import { ListerFamilles } from '../../../application/use-cases/familles/ListerFamilles';
import { ModifierFamille } from '../../../application/use-cases/familles/ModifierFamille';
import { ModifierResponsableFamille } from '../../../application/use-cases/familles/ModifierResponsableFamille';
import { RetirerResponsableFamille } from '../../../application/use-cases/familles/RetirerResponsableFamille';
import type { AutorisationFamillePort } from '../../../application/ports';
import { ResponsableFamille } from '../../../domain/entities/ResponsableFamille';

class DepotFamilleMemoire implements DepotFamille {
  public readonly familles = new Map<string, Famille>();
  public nombreElevesActifs = 3;

  public async sauvegarder(famille: Famille): Promise<void> {
    this.familles.set(famille.obtenirId(), famille);
  }

  public async trouverParId(idFamille: string): Promise<Famille | null> {
    return this.familles.get(idFamille) ?? null;
  }

  public async trouverParCode(idEcole: string, codeFamille: string): Promise<Famille | null> {
    return [...this.familles.values()].find((famille) =>
      famille.obtenirIdEcole() === idEcole
      && famille.obtenirCodeFamille() === codeFamille) ?? null;
  }

  public async listerParEcole(idEcole: string): Promise<Famille[]> {
    return [...this.familles.values()].filter((famille) => famille.obtenirIdEcole() === idEcole);
  }

  public async listerParOrganisation(idOrganisation: string): Promise<Famille[]> {
    return [...this.familles.values()].filter((famille) => famille.obtenirIdOrganisation() === idOrganisation);
  }

  public async existeCodeFamilleDansEcole(idEcole: string, codeFamille: string, idFamilleIgnore?: string): Promise<boolean> {
    return [...this.familles.values()].some((famille) =>
      famille.obtenirIdEcole() === idEcole
      && famille.obtenirCodeFamille() === codeFamille
      && famille.obtenirId() !== idFamilleIgnore);
  }

  public async compterElevesActifsDeFamille(): Promise<number> {
    return this.nombreElevesActifs;
  }
}

class AutorisationFamilleMemoire implements AutorisationFamillePort {
  public appels: Array<{ type: 'lecture' | 'mutation'; idUtilisateur: string }> = [];

  public async verifierLectureFamille(params: { idUtilisateur: string; idOrganisation: string; idEcole: string; }): Promise<void> {
    this.appels.push({ type: 'lecture', idUtilisateur: params.idUtilisateur });
  }

  public async verifierMutationFamille(params: { idUtilisateur: string; idOrganisation: string; idEcole: string; }): Promise<void> {
    this.appels.push({ type: 'mutation', idUtilisateur: params.idUtilisateur });
  }
}

class DepotEleveMemoire implements DepotEleve {
  public readonly eleves = new Map<string, Eleve>();

  public async sauvegarder(eleve: Eleve): Promise<void> {
    this.eleves.set(eleve.obtenirId(), eleve);
  }

  public async trouverParId(idEleve: string): Promise<Eleve | null> { return this.eleves.get(idEleve) ?? null; }
  public async trouverParMatricule(idEcole: string, matricule: string): Promise<Eleve | null> {
    return [...this.eleves.values()].find((eleve) => eleve.obtenirIdEcole() === idEcole && eleve.obtenirMatricule() === matricule) ?? null;
  }
  public async listerParEcole(idEcole: string): Promise<Eleve[]> {
    return [...this.eleves.values()].filter((eleve) => eleve.obtenirIdEcole() === idEcole);
  }
  public async listerParOrganisation(idOrganisation: string): Promise<Eleve[]> {
    return [...this.eleves.values()].filter((eleve) => eleve.obtenirIdOrganisation() === idOrganisation);
  }
  public async rechercherParIdentite(): Promise<Eleve[]> { return [...this.eleves.values()]; }
  public async existeMatriculeDansEcole(): Promise<boolean> { return false; }
  public async existeDoublonProbable(): Promise<boolean> { return false; }
  public async trouverParFamille(idFamille: string): Promise<Eleve[]> {
    return [...this.eleves.values()].filter((eleve) => eleve.obtenirIdFamille() === idFamille);
  }
}

function creerEleveMemoire(params: {
  idEleve: string;
  idFamille?: string;
  nom?: string;
  postNom?: string;
  prenom?: string;
}): Eleve {
  return Eleve.creer({
    idEleve: params.idEleve,
    idOrganisation: 'org-1',
    idEcole: 'ecole-1',
    matricule: `MAT-${params.idEleve}`,
    nom: params.nom ?? 'Eleve',
    postNom: params.postNom ?? 'Test',
    prenom: params.prenom,
    sexe: 'F' as any,
    dateNaissance: '2012-01-01',
    ecoleProvenance: EcoleProvenance.externe('Institut Source'),
    idFamille: params.idFamille,
    creePar: 'user-1',
  });
}

test('Familles reapplique l autorisation locale sur creation et lectures', async () => {
  const depot = new DepotFamilleMemoire();
  const depotEleve = new DepotEleveMemoire();
  const autorisation = new AutorisationFamilleMemoire();

  const creer = new CreerFamille(depot, autorisation);
  const consulter = new ConsulterFamille(depot, depotEleve, autorisation);
  const lister = new ListerFamilles(depot, depotEleve, autorisation);
  const evaluer = new EvaluerFamilleNombreuse(depot, autorisation);

  await creer.executer({
    idOrganisation: 'org-1',
    idEcole: 'ecole-1',
    idUtilisateur: 'user-1',
    idFamille: 'famille-1',
    codeFamille: 'FAM-001',
    nomFamille: 'Famille Mbuyi',
    telephonePrincipal: '0990000000',
  });
  await depotEleve.sauvegarder(creerEleveMemoire({
    idEleve: 'eleve-1',
    idFamille: 'famille-1',
    nom: 'Josias',
    postNom: 'Mukuta',
  }));

  const famille = await consulter.executer({
    idFamille: 'famille-1',
    idOrganisation: 'org-1',
    idEcole: 'ecole-1',
    idUtilisateur: 'user-1',
  });
  const familles = await lister.executer({
    idOrganisation: 'org-1',
    idEcole: 'ecole-1',
    idUtilisateur: 'user-1',
    page: 1,
    taillePage: 25,
  });
  const eligibilite = await evaluer.executer({
    idFamille: 'famille-1',
    idOrganisation: 'org-1',
    idEcole: 'ecole-1',
    idUtilisateur: 'user-1',
  });

  assert.equal(famille.famille.idFamille, 'famille-1');
  assert.equal(famille.famille.elevesLies?.length, 1);
  assert.equal(famille.famille.nombreElevesActifs, 3);
  assert.equal(familles.total, 1);
  assert.equal(eligibilite.eligible, true);
  assert.deepEqual(
    autorisation.appels.map((appel) => appel.type),
    ['mutation', 'lecture', 'lecture', 'lecture'],
  );
});

test('Familles reapplique l autorisation locale sur responsables et mutation', async () => {
  const depot = new DepotFamilleMemoire();
  const autorisation = new AutorisationFamilleMemoire();
  const famille = Famille.creer({
    idFamille: 'famille-1',
    idOrganisation: 'org-1',
    idEcole: 'ecole-1',
    codeFamille: 'FAM-001',
    nomFamille: 'Famille Mbuyi',
    telephonePrincipal: '0990000000',
    responsables: [],
    creePar: 'user-1',
  });
  await depot.sauvegarder(famille);

  const ajouter = new AjouterResponsableFamille(depot, autorisation);
  const modifierFamille = new ModifierFamille(depot, autorisation);
  const modifierResponsable = new ModifierResponsableFamille(depot, autorisation);
  const definirPrincipal = new DefinirResponsablePrincipal(depot, autorisation);
  const retirer = new RetirerResponsableFamille(depot, autorisation);

  const apresAjout = await ajouter.executer({
    idOrganisation: 'org-1',
    idEcole: 'ecole-1',
    idUtilisateur: 'user-1',
    idFamille: 'famille-1',
    idResponsableFamille: 'responsable-1',
    nomComplet: 'Parent A',
    telephone: '0811111111',
    lienParente: LienParente.PERE,
    estPrincipal: false,
    idUtilisateurAuth: 'parent-auth-1',
    versionAttendue: 1,
  });

  const apresModification = await modifierFamille.executer({
    idOrganisation: 'org-1',
    idEcole: 'ecole-1',
    idUtilisateur: 'user-1',
    idFamille: 'famille-1',
    nomFamille: 'Famille Mbuyi Modifiee',
    versionAttendue: 2,
  });

  const apresResponsable = await modifierResponsable.executer({
    idOrganisation: 'org-1',
    idEcole: 'ecole-1',
    idUtilisateur: 'user-1',
    idFamille: 'famille-1',
    idResponsableFamille: 'responsable-1',
    nomComplet: 'Parent A Modifie',
    telephone: '0822222222',
    lienParente: LienParente.MERE,
    estPrincipal: false,
    idUtilisateurAuth: 'parent-auth-2',
    versionAttendue: 3,
  });

  const apresPrincipal = await definirPrincipal.executer({
    idOrganisation: 'org-1',
    idEcole: 'ecole-1',
    idUtilisateur: 'user-1',
    idFamille: 'famille-1',
    idResponsableFamille: 'responsable-1',
    versionAttendue: 4,
  });

  const apresRetrait = await retirer.executer({
    idOrganisation: 'org-1',
    idEcole: 'ecole-1',
    idUtilisateur: 'user-1',
    idFamille: 'famille-1',
    idResponsableFamille: 'responsable-1',
    versionAttendue: 5,
  });

  assert.equal(apresAjout.famille.responsables.length, 1);
  assert.equal(apresAjout.famille.responsables[0]?.idUtilisateurAuth, 'parent-auth-1');
  assert.equal(apresModification.famille.nomFamille, 'Famille Mbuyi Modifiee');
  assert.equal(apresResponsable.famille.responsables[0]?.nomComplet, 'Parent A Modifie');
  assert.equal(apresResponsable.famille.responsables[0]?.idUtilisateurAuth, 'parent-auth-2');
  assert.equal(apresPrincipal.famille.responsables[0]?.estPrincipal, true);
  assert.equal(apresRetrait.famille.responsables.length, 0);
  assert.deepEqual(
    autorisation.appels.map((appel) => appel.type),
    ['mutation', 'mutation', 'mutation', 'mutation', 'mutation'],
  );
});

test('ListerFamilles filtre par nom de famille, responsable et eleve rattache', async () => {
  const depot = new DepotFamilleMemoire();
  const depotEleve = new DepotEleveMemoire();
  const autorisation = new AutorisationFamilleMemoire();
  const lister = new ListerFamilles(depot, depotEleve, autorisation);

  const familleA = Famille.creer({
    idFamille: 'famille-a',
    idOrganisation: 'org-1',
    idEcole: 'ecole-1',
    codeFamille: 'FAM-001',
    nomFamille: 'Famille Mukuta',
    telephonePrincipal: '0990000000',
    responsables: [],
    creePar: 'user-1',
  });
  familleA.ajouterResponsable(
    ResponsableFamille.creer({
      idResponsableFamille: 'resp-a',
      nomComplet: 'Parent Alpha',
      telephone: '0811111111',
      lienParente: LienParente.PERE,
      estPrincipal: true,
    }),
    'user-1',
  );

  const familleB = Famille.creer({
    idFamille: 'famille-b',
    idOrganisation: 'org-1',
    idEcole: 'ecole-1',
    codeFamille: 'FAM-002',
    nomFamille: 'Famille Kalala',
    telephonePrincipal: '0880000000',
    responsables: [],
    creePar: 'user-1',
  });

  await depot.sauvegarder(familleA);
  await depot.sauvegarder(familleB);
  await depotEleve.sauvegarder(creerEleveMemoire({
    idEleve: 'eleve-a',
    idFamille: 'famille-a',
    nom: 'Josias',
    postNom: 'Mukuta',
  }));
  await depotEleve.sauvegarder(creerEleveMemoire({
    idEleve: 'eleve-b',
    idFamille: 'famille-b',
    nom: 'Sarah',
    postNom: 'Kalala',
  }));

  const parNomFamille = await lister.executer({
    idOrganisation: 'org-1',
    idEcole: 'ecole-1',
    idUtilisateur: 'user-1',
    page: 1,
    taillePage: 25,
    nomFamille: 'mukuta',
  });
  const parResponsable = await lister.executer({
    idOrganisation: 'org-1',
    idEcole: 'ecole-1',
    idUtilisateur: 'user-1',
    page: 1,
    taillePage: 25,
    nomResponsable: 'alpha',
  });
  const parEleve = await lister.executer({
    idOrganisation: 'org-1',
    idEcole: 'ecole-1',
    idUtilisateur: 'user-1',
    page: 1,
    taillePage: 25,
    nomEleve: 'josias',
  });

  assert.equal(parNomFamille.total, 1);
  assert.equal(parNomFamille.donnees[0]?.idFamille, 'famille-a');
  assert.equal(parResponsable.total, 1);
  assert.equal(parResponsable.donnees[0]?.idFamille, 'famille-a');
  assert.equal(parEleve.total, 1);
  assert.equal(parEleve.donnees[0]?.idFamille, 'famille-a');
});
