import assert from 'node:assert/strict';
import test from 'node:test';
import { AffectationClasse } from '../../../domain/aggregates/AffectationClasse';
import { InscriptionScolaire } from '../../../domain/aggregates/InscriptionScolaire';
import type { DepotAffectationClasse } from '../../../domain/repositories/DepotAffectationClasse';
import type { DepotEleve } from '../../../domain/repositories/DepotEleve';
import type { DepotInscriptionScolaire } from '../../../domain/repositories/DepotInscriptionScolaire';
import { OrigineInscription } from '../../../domain/value-objects/OrigineInscription';
import { AffecterEleveAClasse } from '../../../application/use-cases/affectations/AffecterEleveAClasse';
import { ChangerEleveDeClasse } from '../../../application/use-cases/affectations/ChangerEleveDeClasse';
import { ConsulterAffectationClasse } from '../../../application/use-cases/affectations/ConsulterAffectationClasse';
import { ConsulterAffectationActive } from '../../../application/use-cases/affectations/ConsulterAffectationActive';
import { DesactiverAffectationClasse } from '../../../application/use-cases/affectations/DesactiverAffectationClasse';
import { ListerElevesParClasse } from '../../../application/use-cases/affectations/ListerElevesParClasse';
import type { AutorisationAffectationClassePort } from '../../../application/ports';
import type { DomainEventBusPort } from '../../../../../shared/application/DomainEventBusPort';
import { Eleve } from '../../../domain/aggregates/Eleve';
import { EcoleProvenance } from '../../../domain/value-objects/EcoleProvenance';
import { SexeEleve } from '../../../domain/value-objects/SexeEleve';

class EventBusMemoire implements DomainEventBusPort {
  public readonly publications: string[][] = [];

  public async publier(evenements: { typeEvenement: string }[]): Promise<void> {
    this.publications.push(evenements.map((evenement) => evenement.typeEvenement));
  }
}

class DepotInscriptionMemoire implements DepotInscriptionScolaire {
  constructor(private readonly inscriptions = new Map<string, InscriptionScolaire>()) {}

  public async sauvegarder(inscription: InscriptionScolaire): Promise<void> {
    this.inscriptions.set(inscription.obtenirId(), inscription);
  }

  public async trouverParId(idInscriptionScolaire: string): Promise<InscriptionScolaire | null> {
    return this.inscriptions.get(idInscriptionScolaire) ?? null;
  }

  public async trouverInscriptionActiveParEleveEtAnnee(idEleve: string, idAnneeScolaire: string): Promise<InscriptionScolaire | null> {
    return [...this.inscriptions.values()].find((inscription) =>
      inscription.obtenirIdEleve() === idEleve
      && inscription.obtenirIdAnneeScolaire() === idAnneeScolaire
      && inscription.estActive()) ?? null;
  }

  public async trouverDerniereInscriptionActiveParEleve(idEleve: string): Promise<InscriptionScolaire | null> {
    return [...this.inscriptions.values()].find((inscription) =>
      inscription.obtenirIdEleve() === idEleve
      && inscription.estActive()) ?? null;
  }

  public async listerParAnnee(idAnneeScolaire: string): Promise<InscriptionScolaire[]> {
    return [...this.inscriptions.values()].filter((inscription) =>
      inscription.obtenirIdAnneeScolaire() === idAnneeScolaire);
  }

  public async listerParClasse(): Promise<InscriptionScolaire[]> {
    return [];
  }

  public async listerParEcoleEtAnnee(idEcole: string, idAnneeScolaire: string): Promise<InscriptionScolaire[]> {
    return [...this.inscriptions.values()].filter((inscription) =>
      inscription.obtenirIdEcole() === idEcole
      && inscription.obtenirIdAnneeScolaire() === idAnneeScolaire);
  }

  public async listerParOrganisationEtAnnee(idOrganisation: string, idAnneeScolaire: string): Promise<InscriptionScolaire[]> {
    return [...this.inscriptions.values()].filter((inscription) =>
      inscription.obtenirIdOrganisation() === idOrganisation
      && inscription.obtenirIdAnneeScolaire() === idAnneeScolaire);
  }

  public async existeInscriptionActiveParEleveEtAnnee(idEleve: string, idAnneeScolaire: string): Promise<boolean> {
    return (await this.trouverInscriptionActiveParEleveEtAnnee(idEleve, idAnneeScolaire)) !== null;
  }
}

class DepotEleveMemoire implements DepotEleve {
  constructor(private readonly eleves = new Map<string, Eleve>()) {}

  public async sauvegarder(eleve: Eleve): Promise<void> {
    this.eleves.set(eleve.obtenirId(), eleve);
  }

  public async trouverParId(idEleve: string): Promise<Eleve | null> {
    return this.eleves.get(idEleve) ?? null;
  }

  public async trouverParMatricule(): Promise<Eleve | null> {
    return null;
  }

  public async listerParEcole(): Promise<Eleve[]> {
    return [...this.eleves.values()];
  }

  public async listerParOrganisation(): Promise<Eleve[]> {
    return [...this.eleves.values()];
  }

  public async rechercherParIdentite(): Promise<Eleve[]> {
    return [...this.eleves.values()];
  }

  public async existeMatriculeDansEcole(): Promise<boolean> {
    return false;
  }

  public async existeDoublonProbable(): Promise<boolean> {
    return false;
  }

  public async trouverParFamille(idFamille: string): Promise<Eleve[]> {
    return [...this.eleves.values()].filter((eleve) => eleve.versProprietes().idFamille === idFamille);
  }
}

class DepotAffectationMemoire implements DepotAffectationClasse {
  public readonly affectations = new Map<string, AffectationClasse>();

  public async sauvegarder(affectation: AffectationClasse): Promise<void> {
    this.affectations.set(affectation.obtenirId(), affectation);
  }

  public async trouverParId(idAffectationClasse: string): Promise<AffectationClasse | null> {
    return this.affectations.get(idAffectationClasse) ?? null;
  }

  public async trouverAffectationActiveParInscription(idInscriptionScolaire: string): Promise<AffectationClasse | null> {
    return [...this.affectations.values()].find((affectation) =>
      affectation.obtenirIdInscriptionScolaire() === idInscriptionScolaire
      && affectation.estActive()) ?? null;
  }

  public async listerActivesParClasse(idClassePedagogique: string): Promise<AffectationClasse[]> {
    return [...this.affectations.values()].filter((affectation) =>
      affectation.obtenirIdClassePedagogique() === idClassePedagogique
      && affectation.estActive());
  }

  public async listerActivesParEcole(idEcole: string): Promise<AffectationClasse[]> {
    return [...this.affectations.values()].filter((affectation) =>
      affectation.obtenirIdEcole() === idEcole
      && affectation.estActive());
  }

  public async desactiverAffectationActiveParInscription(idInscriptionScolaire: string, modifiePar: string): Promise<void> {
    const affectation = await this.trouverAffectationActiveParInscription(idInscriptionScolaire);
    affectation?.desactiver(modifiePar);
  }
}

class AutorisationAffectationMemoire implements AutorisationAffectationClassePort {
  public appels: Array<{ type: string; charge: Record<string, string> }> = [];

  public async verifierCreationAffectationClasse(params: { idUtilisateur: string; idOrganisation: string; idEcole: string; idInscriptionScolaire: string; idClassePedagogique: string; }): Promise<void> {
    this.appels.push({ type: 'creation', charge: params });
  }

  public async verifierChangementClasse(params: { idUtilisateur: string; idOrganisation: string; idEcole: string; idInscriptionScolaire: string; idNouvelleClassePedagogique: string; }): Promise<void> {
    this.appels.push({ type: 'changement', charge: params });
  }

  public async verifierDesactivationAffectationClasse(params: { idUtilisateur: string; idOrganisation: string; idEcole: string; idInscriptionScolaire: string; }): Promise<void> {
    this.appels.push({ type: 'desactivation', charge: params });
  }

  public async verifierConsultationAffectationClasse(params: { idUtilisateur: string; idOrganisation: string; idEcole: string; idInscriptionScolaire: string; }): Promise<void> {
    this.appels.push({ type: 'consultation', charge: params });
  }

  public async verifierConsultationClassePedagogique(params: { idUtilisateur: string; idOrganisation: string; idEcole: string; idClassePedagogique: string; }): Promise<void> {
    this.appels.push({ type: 'liste-classe', charge: params });
  }
}

test('AffecterEleveAClasse reapplique l autorisation locale avant de sauver', async () => {
  const depotInscription = new DepotInscriptionMemoire(new Map([
    ['inscription-1', creerInscriptionValidee('inscription-1', 'eleve-1')],
  ]));
  const depotAffectation = new DepotAffectationMemoire();
  const autorisation = new AutorisationAffectationMemoire();
  const eventBus = new EventBusMemoire();
  const useCase = new AffecterEleveAClasse(
    depotAffectation,
    depotInscription,
    autorisation,
    undefined,
    undefined,
    eventBus,
  );

  const sortie = await useCase.executer({
    idOrganisation: 'org-1',
    idEcole: 'ecole-1',
    idUtilisateur: 'user-1',
    idAffectationClasse: 'affectation-1',
    idInscriptionScolaire: 'inscription-1',
    idClassePedagogique: 'classe-sec-a',
    dateAffectation: '2026-09-02',
  });

  assert.equal(sortie.affectation.idAffectationClasse, 'affectation-1');
  assert.equal(autorisation.appels[0]?.type, 'creation');
  assert.equal(depotAffectation.affectations.size, 1);
  assert.deepEqual(eventBus.publications, [['EleveAffecteAClasse']]);
});

test('ChangerEleveDeClasse reapplique l autorisation locale avant mutation', async () => {
  const depotInscription = new DepotInscriptionMemoire(new Map([
    ['inscription-1', creerInscriptionValidee('inscription-1', 'eleve-1')],
  ]));
  const depotAffectation = new DepotAffectationMemoire();
  await depotAffectation.sauvegarder(creerAffectation('affectation-1', 'inscription-1', 'classe-sec-a'));
  const autorisation = new AutorisationAffectationMemoire();
  const useCase = new ChangerEleveDeClasse(depotAffectation, depotInscription, autorisation);

  const sortie = await useCase.executer({
    idOrganisation: 'org-1',
    idEcole: 'ecole-1',
    idUtilisateur: 'user-1',
    idInscriptionScolaire: 'inscription-1',
    idNouvelleClassePedagogique: 'classe-sec-b',
    versionAttendue: 1,
  });

  assert.equal(sortie.affectation.idClassePedagogique, 'classe-sec-b');
  assert.equal(autorisation.appels[0]?.type, 'changement');
});

test('ConsulterAffectationActive et ListerElevesParClasse reappliquent la lecture locale', async () => {
  const depotInscription = new DepotInscriptionMemoire(new Map([
    ['inscription-1', creerInscriptionValidee('inscription-1', 'eleve-1')],
  ]));
  const depotEleve = new DepotEleveMemoire(new Map([
    ['eleve-1', creerEleve('eleve-1', 'MAT-001', 'Kasongo')],
  ]));
  const depotAffectation = new DepotAffectationMemoire();
  await depotAffectation.sauvegarder(creerAffectation('affectation-1', 'inscription-1', 'classe-sec-a'));
  const autorisation = new AutorisationAffectationMemoire();

  const consultation = new ConsulterAffectationActive(depotAffectation, autorisation);
  const consultationParId = new ConsulterAffectationClasse(depotAffectation, autorisation);
  const liste = new ListerElevesParClasse(depotAffectation, depotInscription, depotEleve, autorisation);

  const sortie = await consultation.executer({
    idInscriptionScolaire: 'inscription-1',
    idOrganisation: 'org-1',
    idEcole: 'ecole-1',
    idUtilisateur: 'user-1',
  });
  const sortieParId = await consultationParId.executer({
    idAffectationClasse: 'affectation-1',
    idOrganisation: 'org-1',
    idEcole: 'ecole-1',
    idUtilisateur: 'user-1',
  });
  const eleves = await liste.executer({
    idClassePedagogique: 'classe-sec-a',
    idOrganisation: 'org-1',
    idEcole: 'ecole-1',
    idUtilisateur: 'user-1',
  });

  assert.equal(sortie.affectation.idAffectationClasse, 'affectation-1');
  assert.equal(sortieParId.affectation.idAffectationClasse, 'affectation-1');
  assert.equal(eleves.length, 1);
  assert.equal(eleves[0]?.idEleve, 'eleve-1');
  assert.equal(eleves[0]?.idInscriptionScolaire, 'inscription-1');
  assert.deepEqual(
    autorisation.appels.map((appel) => appel.type),
    ['consultation', 'consultation', 'liste-classe'],
  );
});

test('DesactiverAffectationClasse reapplique l autorisation locale avant desactivation', async () => {
  const depotAffectation = new DepotAffectationMemoire();
  await depotAffectation.sauvegarder(creerAffectation('affectation-1', 'inscription-1', 'classe-sec-a'));
  const autorisation = new AutorisationAffectationMemoire();
  const useCase = new DesactiverAffectationClasse(depotAffectation, autorisation);

  await useCase.executer({
    idOrganisation: 'org-1',
    idEcole: 'ecole-1',
    idUtilisateur: 'user-1',
    idInscriptionScolaire: 'inscription-1',
  });

  assert.equal(autorisation.appels[0]?.type, 'desactivation');
  assert.equal((await depotAffectation.trouverAffectationActiveParInscription('inscription-1')), null);
});

function creerInscriptionValidee(idInscriptionScolaire: string, idEleve: string): InscriptionScolaire {
  const inscription = InscriptionScolaire.creer({
    idInscriptionScolaire,
    idOrganisation: 'org-1',
    idEcole: 'ecole-1',
    idEleve,
    idAnneeScolaire: 'annee-2026',
    dateInscription: '2026-09-01',
    origineInscription: OrigineInscription.NOUVEAU,
    creePar: 'user-1',
  });
  inscription.valider('user-1');
  return inscription;
}

function creerAffectation(
  idAffectationClasse: string,
  idInscriptionScolaire: string,
  idClassePedagogique: string,
): AffectationClasse {
  return AffectationClasse.creer({
    idAffectationClasse,
    idOrganisation: 'org-1',
    idEcole: 'ecole-1',
    idInscriptionScolaire,
    idClassePedagogique,
    dateAffectation: '2026-09-02',
    creePar: 'user-1',
  });
}

function creerEleve(idEleve: string, matricule: string, nom: string): Eleve {
  return Eleve.creer({
    idEleve,
    idOrganisation: 'org-1',
    idEcole: 'ecole-1',
    matricule,
    nom,
    postNom: 'Mbuyi',
    prenom: 'Junior',
    sexe: SexeEleve.M,
    dateNaissance: '2012-05-12',
    ecoleProvenance: EcoleProvenance.externe('Ecole Source'),
    creePar: 'user-1',
  });
}
