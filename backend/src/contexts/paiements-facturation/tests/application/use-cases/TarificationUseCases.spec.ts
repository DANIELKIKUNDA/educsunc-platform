import test from 'node:test';
import assert from 'node:assert/strict';
import { CreerGrilleTarificationUseCase } from '../../../application/use-cases/tarification/CreerGrilleTarificationUseCase';
import { DesactiverGrilleTarificationUseCase } from '../../../application/use-cases/tarification/DesactiverGrilleTarificationUseCase';
import { ListerGrillesTarificationUseCase } from '../../../application/use-cases/tarification/ListerGrillesTarificationUseCase';
import { ModifierGrilleTarificationUseCase } from '../../../application/use-cases/tarification/ModifierGrilleTarificationUseCase';
import { GrilleTarification } from '../../../domain/aggregates/GrilleTarification';
import { CategorieTechnique } from '../../../domain/value-objects/CategorieTechnique';
import { MoisScolaire } from '../../../domain/value-objects/MoisScolaire';
import { Money } from '../../../domain/value-objects/Money';
import { TypeFrais } from '../../../domain/value-objects/TypeFrais';

class DepotGrilleTarificationMemoire {
  public grilles: GrilleTarification[] = [];

  public async sauvegarder(grille: GrilleTarification): Promise<void> {
    const index = this.grilles.findIndex((element) => element.obtenirId() === grille.obtenirId());
    if (index >= 0) {
      this.grilles[index] = grille;
      return;
    }
    this.grilles.push(grille);
  }

  public async trouverParId(idGrilleTarification: string): Promise<GrilleTarification | null> {
    return this.grilles.find((grille) => grille.obtenirId() === idGrilleTarification) ?? null;
  }

  public async trouverParIdEtEcole(
    idGrilleTarification: string,
    idEcole: string,
  ): Promise<GrilleTarification | null> {
    return this.grilles.find((grille) =>
      grille.obtenirId() === idGrilleTarification
      && grille.obtenirIdEcole() === idEcole) ?? null;
  }

  public async listerActivesParEcoleEtAnnee(
    idEcole: string,
    idAnneeScolaire: string,
  ): Promise<GrilleTarification[]> {
    return this.grilles.filter((grille) =>
      grille.obtenirIdEcole() === idEcole
      && grille.obtenirIdAnneeScolaire() === idAnneeScolaire
      && grille.obtenirActif());
  }

  public async listerParEcoleEtAnnee(
    idEcole: string,
    idAnneeScolaire: string,
    actif?: boolean,
  ): Promise<GrilleTarification[]> {
    return this.grilles.filter((grille) =>
      grille.obtenirIdEcole() === idEcole
      && grille.obtenirIdAnneeScolaire() === idAnneeScolaire
      && (actif === undefined || grille.obtenirActif() === actif));
  }
}

test("Tarification reserve la gestion a ADMIN_SYSTEME_ECOLE", async () => {
  const depot = new DepotGrilleTarificationMemoire();
  const creer = new CreerGrilleTarificationUseCase(depot as never);
  const lister = new ListerGrillesTarificationUseCase(depot as never);

  await assert.rejects(() => creer.executer({
    idOrganisation: 'ORG-001',
    idEcole: 'ECOLE-001',
    idAnneeScolaire: 'AN-001',
    typeFrais: TypeFrais.FRAIS_SCOLAIRES,
    libelle: 'Frais scolaires Septembre',
    montant: new Money(50000, 'CDF'),
    obligatoire: true,
    creePar: 'UTIL-001',
    roleActif: 'ADMINISTRATEUR_ECOLE',
  }));

  const sortie = await creer.executer({
    idOrganisation: 'ORG-001',
    idEcole: 'ECOLE-001',
    idAnneeScolaire: 'AN-001',
    typeFrais: TypeFrais.FRAIS_SCOLAIRES,
    libelle: 'Frais scolaires Septembre',
    montant: new Money(50000, 'CDF'),
    moisScolaire: MoisScolaire.SEPTEMBRE,
    obligatoire: true,
    creePar: 'UTIL-002',
    roleActif: 'ADMIN_SYSTEME_ECOLE',
  });

  assert.equal(sortie.idEcole, 'ECOLE-001');
  assert.equal(sortie.moisScolaire, MoisScolaire.SEPTEMBRE);

  await assert.rejects(() => lister.executer({
    idOrganisation: 'ORG-001',
    idEcole: 'ECOLE-001',
    idAnneeScolaire: 'AN-001',
    idUtilisateur: 'UTIL-003',
    roleActif: 'CAISSIER',
  }));
});

test("Tarification reapplique le perimetre ecole pour modifier et desactiver", async () => {
  const depot = new DepotGrilleTarificationMemoire();
  const creer = new CreerGrilleTarificationUseCase(depot as never);
  const modifier = new ModifierGrilleTarificationUseCase(depot as never);
  const desactiver = new DesactiverGrilleTarificationUseCase(depot as never);
  const lister = new ListerGrillesTarificationUseCase(depot as never);

  const grille = await creer.executer({
    idOrganisation: 'ORG-001',
    idEcole: 'ECOLE-001',
    idAnneeScolaire: 'AN-001',
    typeFrais: TypeFrais.FRAIS_TECHNIQUES,
    libelle: 'Frais techniques G1',
    montant: new Money(75000, 'CDF'),
    categorieTechnique: CategorieTechnique.GROUPE_1,
    obligatoire: true,
    creePar: 'UTIL-ADMIN',
    roleActif: 'ADMIN_SYSTEME_ECOLE',
  });

  await assert.rejects(() => modifier.executer({
    idOrganisation: 'ORG-001',
    idEcole: 'ECOLE-999',
    idGrilleTarification: grille.idGrilleTarification,
    idAnneeScolaire: 'AN-001',
    libelle: 'Autre nom',
    modifiePar: 'UTIL-ADMIN',
    roleActif: 'ADMIN_SYSTEME_ECOLE',
  }));

  const modifiee = await modifier.executer({
    idOrganisation: 'ORG-001',
    idEcole: 'ECOLE-001',
    idGrilleTarification: grille.idGrilleTarification,
    idAnneeScolaire: 'AN-001',
    libelle: 'Frais techniques Groupe 1',
    montant: new Money(80000, 'CDF'),
    categorieTechnique: CategorieTechnique.GROUPE_1,
    obligatoire: false,
    modifiePar: 'UTIL-ADMIN',
    roleActif: 'ADMIN_SYSTEME_ECOLE',
  });

  assert.equal(modifiee.libelle, 'Frais techniques Groupe 1');
  assert.equal(modifiee.montant.obtenirMontant(), 80000);
  assert.equal(modifiee.obligatoire, false);

  await desactiver.executer({
    idOrganisation: 'ORG-001',
    idEcole: 'ECOLE-001',
    idGrilleTarification: grille.idGrilleTarification,
    idAnneeScolaire: 'AN-001',
    modifiePar: 'UTIL-ADMIN',
    roleActif: 'ADMIN_SYSTEME_ECOLE',
  });

  const grillesInactives = await lister.executer({
    idOrganisation: 'ORG-001',
    idEcole: 'ECOLE-001',
    idAnneeScolaire: 'AN-001',
    actif: false,
    idUtilisateur: 'UTIL-ADMIN',
    roleActif: 'ADMIN_SYSTEME_ECOLE',
  });

  assert.equal(grillesInactives.length, 1);
  assert.equal(grillesInactives[0]?.actif, false);
});
