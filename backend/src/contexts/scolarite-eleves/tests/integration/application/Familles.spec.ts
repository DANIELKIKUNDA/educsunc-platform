import assert from 'node:assert/strict';
import test from 'node:test';
import { Famille } from '../../../domain/aggregates/Famille';
import type { DepotFamille } from '../../../domain/repositories/DepotFamille';
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

test('Familles reapplique l autorisation locale sur creation et lectures', async () => {
  const depot = new DepotFamilleMemoire();
  const autorisation = new AutorisationFamilleMemoire();

  const creer = new CreerFamille(depot, autorisation);
  const consulter = new ConsulterFamille(depot, autorisation);
  const lister = new ListerFamilles(depot, autorisation);
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
