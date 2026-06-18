import assert from 'node:assert/strict';
import test from 'node:test';
import { CreerEleve } from '../../../application/use-cases/eleves/CreerEleve';
import { ModifierEleve } from '../../../application/use-cases/eleves/ModifierEleve';
import { ConsulterEleve } from '../../../application/use-cases/eleves/ConsulterEleve';
import { ListerEleves } from '../../../application/use-cases/eleves/ListerEleves';
import { RechercherEleves } from '../../../application/use-cases/eleves/RechercherEleves';
import { RattacherEleveAFamille } from '../../../application/use-cases/eleves/RattacherEleveAFamille';
import { DetacherEleveDeFamille } from '../../../application/use-cases/eleves/DetacherEleveDeFamille';
import type { AutorisationElevePort } from '../../../application/ports';
import { Famille } from '../../../domain/aggregates/Famille';
import type { DepotFamille } from '../../../domain/repositories/DepotFamille';
import { SexeEleve } from '../../../domain/value-objects/SexeEleve';
import { TypeProvenanceEcole } from '../../../domain/value-objects/TypeProvenanceEcole';
import { DepotEleveMemoire } from '../../utils/mockRepositories';

class DepotFamilleMemoire implements DepotFamille {
  public readonly familles = new Map<string, Famille>();

  public async sauvegarder(famille: Famille): Promise<void> {
    this.familles.set(famille.obtenirId(), famille);
  }
  public async trouverParId(idFamille: string): Promise<Famille | null> {
    return this.familles.get(idFamille) ?? null;
  }
  public async trouverParCode(idEcole: string, codeFamille: string): Promise<Famille | null> {
    return [...this.familles.values()].find((famille) =>
      famille.obtenirIdEcole() === idEcole && famille.obtenirCodeFamille() === codeFamille) ?? null;
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
    return 0;
  }
}

class AutorisationEleveMemoire implements AutorisationElevePort {
  public appels: Array<{ type: 'lecture' | 'mutation'; idUtilisateur: string }> = [];

  public async verifierLectureEleve(params: { idUtilisateur: string; idOrganisation: string; idEcole: string; }): Promise<void> {
    this.appels.push({ type: 'lecture', idUtilisateur: params.idUtilisateur });
  }

  public async verifierMutationEleve(params: { idUtilisateur: string; idOrganisation: string; idEcole: string; }): Promise<void> {
    this.appels.push({ type: 'mutation', idUtilisateur: params.idUtilisateur });
  }
}

test('Eleves reapplique l autorisation locale sur creation et lectures', async () => {
  const depotEleve = new DepotEleveMemoire();
  const autorisation = new AutorisationEleveMemoire();
  const creer = new CreerEleve(depotEleve, autorisation);
  const consulter = new ConsulterEleve(depotEleve, autorisation);
  const lister = new ListerEleves(depotEleve, autorisation);
  const rechercher = new RechercherEleves(depotEleve, autorisation);

  await creer.executer({
    idOrganisation: 'org-1',
    idEcole: 'ecole-1',
    idUtilisateur: 'user-1',
    idEleve: 'eleve-1',
    matricule: 'EL-001',
    nom: 'Mbuyi',
    postNom: 'Kalala',
    sexe: SexeEleve.F,
    dateNaissance: '2015-09-12',
    typeProvenance: TypeProvenanceEcole.EXTERNE,
    nomEcoleProvenance: 'Institut Mapendo',
  });

  const eleve = await consulter.executer({
    idEleve: 'eleve-1',
    idOrganisation: 'org-1',
    idEcole: 'ecole-1',
    idUtilisateur: 'user-1',
  });
  const liste = await lister.executer({
    idOrganisation: 'org-1',
    idEcole: 'ecole-1',
    idUtilisateur: 'user-1',
    page: 1,
    taillePage: 25,
  });
  const recherche = await rechercher.executer({
    idOrganisation: 'org-1',
    idEcole: 'ecole-1',
    idUtilisateur: 'user-1',
    nom: 'Mbuyi',
    page: 1,
    taillePage: 25,
  });

  assert.equal(eleve.eleve.idEleve, 'eleve-1');
  assert.equal(liste.total, 1);
  assert.equal(recherche.total, 1);
  assert.deepEqual(
    autorisation.appels.map((appel) => appel.type),
    ['mutation', 'lecture', 'lecture', 'lecture'],
  );
});

test('Eleves reapplique l autorisation locale sur modification et lien familial', async () => {
  const depotEleve = new DepotEleveMemoire();
  const depotFamille = new DepotFamilleMemoire();
  const autorisation = new AutorisationEleveMemoire();
  const creer = new CreerEleve(depotEleve, autorisation);

  await creer.executer({
    idOrganisation: 'org-1',
    idEcole: 'ecole-1',
    idUtilisateur: 'user-1',
    idEleve: 'eleve-1',
    matricule: 'EL-001',
    nom: 'Mbuyi',
    postNom: 'Kalala',
    sexe: SexeEleve.F,
    dateNaissance: '2015-09-12',
    typeProvenance: TypeProvenanceEcole.EXTERNE,
    nomEcoleProvenance: 'Institut Mapendo',
  });

  await depotFamille.sauvegarder(Famille.creer({
    idFamille: 'famille-1',
    idOrganisation: 'org-1',
    idEcole: 'ecole-1',
    codeFamille: 'FAM-001',
    nomFamille: 'Famille Mbuyi',
    telephonePrincipal: '0990000000',
    responsables: [],
    creePar: 'user-1',
  }));

  const modifier = new ModifierEleve(depotEleve, autorisation);
  const rattacher = new RattacherEleveAFamille(depotEleve, depotFamille, autorisation);
  const detacher = new DetacherEleveDeFamille(depotEleve, autorisation);

  const modifie = await modifier.executer({
    idOrganisation: 'org-1',
    idEcole: 'ecole-1',
    idUtilisateur: 'user-1',
    idEleve: 'eleve-1',
    nom: 'Mbuyi Modifie',
    versionAttendue: 1,
  });

  const rattache = await rattacher.executer({
    idOrganisation: 'org-1',
    idEcole: 'ecole-1',
    idUtilisateur: 'user-1',
    idEleve: 'eleve-1',
    idFamille: 'famille-1',
    versionAttendue: 2,
  });

  const detache = await detacher.executer({
    idOrganisation: 'org-1',
    idEcole: 'ecole-1',
    idUtilisateur: 'user-1',
    idEleve: 'eleve-1',
    versionAttendue: 3,
  });

  assert.equal(modifie.eleve.nom, 'Mbuyi Modifie');
  assert.equal(rattache.eleve.idFamille, 'famille-1');
  assert.equal(detache.eleve.idFamille, undefined);
  assert.deepEqual(
    autorisation.appels.map((appel) => appel.type),
    ['mutation', 'mutation', 'mutation', 'mutation'],
  );
});
