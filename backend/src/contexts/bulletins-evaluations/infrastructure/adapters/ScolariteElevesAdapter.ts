import type {
  AbandonEleveDTO,
  ClassePedagogiqueBulletinDTO,
  EleveBulletinDTO,
  InscriptionBulletinDTO,
  ScolariteElevesPort,
} from 'contexts/bulletins-evaluations/application/ports/out/ScolariteElevesPort';
import { SexeEleve } from 'contexts/bulletins-evaluations/domain/value-objects/SexeEleve';
import { StatutEleve } from 'contexts/scolarite-eleves/domain/value-objects/StatutEleve';
import { TypeEvenementParcours } from 'contexts/scolarite-eleves/domain/value-objects/TypeEvenementParcours';
import { ConsulterEleve } from 'contexts/scolarite-eleves/application/use-cases/eleves/ConsulterEleve';
import { ConsulterInscriptionScolaire } from 'contexts/scolarite-eleves/application/use-cases/inscriptions/ConsulterInscriptionScolaire';
import { ConsulterAffectationActive } from 'contexts/scolarite-eleves/application/use-cases/affectations/ConsulterAffectationActive';
import { ConsulterParcoursEleve } from 'contexts/scolarite-eleves/application/use-cases/parcours/ConsulterParcoursEleve';
import { PostgresAffectationDepot } from 'contexts/scolarite-eleves/infrastructure/persistence/postgres/depots/PostgresAffectationDepot';
import type { ClientPostgresScolariteEleves } from 'contexts/scolarite-eleves/infrastructure/persistence/postgres/depots/ClientPostgresScolariteEleves';
import { PostgresEleveDepot } from 'contexts/scolarite-eleves/infrastructure/persistence/postgres/depots/PostgresEleveDepot';
import { PostgresInscriptionDepot } from 'contexts/scolarite-eleves/infrastructure/persistence/postgres/depots/PostgresInscriptionDepot';
import { PostgresParcoursDepot } from 'contexts/scolarite-eleves/infrastructure/persistence/postgres/depots/PostgresParcoursDepot';
import type { ClientPostgresReferentielAcademique } from 'contexts/referentiel-academique/infrastructure/persistence/postgres/depots/ClientPostgresReferentielAcademique';
import { DepotClassePedagogiquePostgres } from 'contexts/referentiel-academique/infrastructure/persistence/postgres';
import { ClassePedagogiqueId } from 'contexts/referentiel-academique/domain/value-objects/ClassePedagogiqueId';

interface DependancesScolariteElevesAdapter {
  consulterEleve: ConsulterEleve;
  consulterInscription: ConsulterInscriptionScolaire;
  consulterAffectationActive: ConsulterAffectationActive;
  consulterParcours: ConsulterParcoursEleve;
  consulterClassePedagogique?: (idClassePedagogique: string) => Promise<ClassePedagogiqueBulletinDTO | null>;
}

// Cet adaptateur lit les donnees reelles du BC Scolarite des Eleves pour les workflows bulletins.
export class ScolariteElevesAdapter implements ScolariteElevesPort {
  private readonly dependances: DependancesScolariteElevesAdapter;
  private readonly clientLectureReferentiel?: ClientPostgresReferentielAcademique;
  private readonly depotEleveLecture?: PostgresEleveDepot;
  private readonly depotParcoursLecture?: PostgresParcoursDepot;

  constructor(
    clientLecture?: ClientPostgresScolariteEleves,
    clientLectureReferentiel?: ClientPostgresReferentielAcademique,
    dependances?: Partial<DependancesScolariteElevesAdapter>,
  ) {
    const dependancesReelles = clientLecture === undefined
      ? undefined
      : {
        consulterEleve: new ConsulterEleve(new PostgresEleveDepot(clientLecture)),
        consulterInscription: new ConsulterInscriptionScolaire(new PostgresInscriptionDepot(clientLecture)),
        consulterAffectationActive: new ConsulterAffectationActive(new PostgresAffectationDepot(clientLecture)),
        consulterParcours: new ConsulterParcoursEleve(new PostgresParcoursDepot(clientLecture)),
      };

    const dependancesFinales = {
      ...dependancesReelles,
      ...dependances,
    };

    if (
      dependancesFinales.consulterEleve === undefined
      || dependancesFinales.consulterInscription === undefined
      || dependancesFinales.consulterAffectationActive === undefined
      || dependancesFinales.consulterParcours === undefined
    ) {
      throw new Error('ScolariteElevesAdapter requiert des dependances de lecture scolarite completes.');
    }

    this.dependances = dependancesFinales as DependancesScolariteElevesAdapter;
    this.clientLectureReferentiel = clientLectureReferentiel;
    this.depotEleveLecture = clientLecture === undefined
      ? undefined
      : new PostgresEleveDepot(clientLecture);
    this.depotParcoursLecture = clientLecture === undefined
      ? undefined
      : new PostgresParcoursDepot(clientLecture);
  }

  public async consulterEleve(idEleve: string): Promise<EleveBulletinDTO | null> {
    try {
      const eleve = this.depotEleveLecture !== undefined
        ? await this.depotEleveLecture.trouverParId(idEleve)
        : (await this.dependances.consulterEleve.executer({
          idEleve,
          idOrganisation: '',
          idEcole: '',
          idUtilisateur: 'systeme-technique',
        })).eleve;
      if (eleve === null) {
        return null;
      }
      const projection = 'idEleve' in eleve
        ? eleve
        : {
          idEleve: eleve.obtenirId(),
          nom: eleve.obtenirNom(),
          postNom: eleve.obtenirPostNom(),
          prenom: eleve.obtenirPrenom(),
          sexe: eleve.obtenirSexe(),
          idEcole: eleve.obtenirIdEcole(),
        };
      return {
        idEleve: projection.idEleve,
        nomComplet: [projection.nom, projection.postNom, projection.prenom].filter(Boolean).join(' '),
        sexe: projection.sexe as SexeEleve,
        idEcole: projection.idEcole,
      };
    } catch {
      return null;
    }
  }

  public async consulterInscription(idInscriptionScolaire: string): Promise<InscriptionBulletinDTO | null> {
    try {
      const { inscription } = await this.dependances.consulterInscription.executer({ idInscriptionScolaire });
      const { affectation } = await this.dependances.consulterAffectationActive.executer({
        idInscriptionScolaire,
        idOrganisation: inscription.idOrganisation,
        idEcole: inscription.idEcole,
        idUtilisateur: 'systeme-technique',
      });

      return {
        idInscriptionScolaire: inscription.idInscriptionScolaire,
        idEleve: inscription.idEleve,
        idClassePedagogique: affectation.idClassePedagogique,
        idAnneeScolaire: inscription.idAnneeScolaire,
      };
    } catch {
      return null;
    }
  }

  public async consulterClassePedagogique(idClassePedagogique: string): Promise<ClassePedagogiqueBulletinDTO | null> {
    if (this.dependances.consulterClassePedagogique !== undefined) {
      return this.dependances.consulterClassePedagogique(idClassePedagogique);
    }

    if (this.clientLectureReferentiel === undefined) {
      return null;
    }

    try {
      const depotClassePedagogique = new DepotClassePedagogiquePostgres(this.clientLectureReferentiel);
      const classePedagogique = await depotClassePedagogique.trouverParId(
        new ClassePedagogiqueId(idClassePedagogique),
      );

      if (classePedagogique === null) {
        return null;
      }

      return {
        idClassePedagogique: classePedagogique.obtenirId().obtenirValeur(),
        libelleClasse: classePedagogique.obtenirLibelle(),
        idEcole: classePedagogique.obtenirEcoleId().obtenirValeur(),
      };
    } catch {
      return null;
    }
  }

  public async verifierAbandon(idEleve: string, idAnneeScolaire: string): Promise<AbandonEleveDTO | null> {
    try {
      const historique = this.depotParcoursLecture !== undefined
        ? (await this.depotParcoursLecture.trouverParEleve(idEleve))?.listerHistorique().map((evenement) => ({
          typeEvenement: evenement.obtenirTypeEvenement(),
          idAnneeScolaire: evenement.obtenirIdAnneeScolaire(),
          dateEvenement: evenement.obtenirDateEvenement().toISOString(),
          description: evenement.obtenirDescription(),
        })) ?? []
        : (await this.dependances.consulterParcours.executer({
          idEleve,
          idOrganisation: '',
          idEcole: '',
          idUtilisateur: 'systeme',
        })).parcours.historique;
      const dernierAbandon = [...historique]
        .filter((evenement) =>
          evenement.typeEvenement === TypeEvenementParcours.ABANDON
          && evenement.idAnneeScolaire === idAnneeScolaire)
        .sort((a, b) => Date.parse(a.dateEvenement) - Date.parse(b.dateEvenement))
        .at(-1);

      if (dernierAbandon === undefined) {
        return null;
      }

      const eleve = this.depotEleveLecture !== undefined
        ? await this.depotEleveLecture.trouverParId(idEleve)
        : (await this.dependances.consulterEleve.executer({
          idEleve,
          idOrganisation: '',
          idEcole: '',
          idUtilisateur: 'systeme-technique',
        })).eleve;
      if (eleve === null) {
        return null;
      }
      const statutGlobal = typeof Reflect.get(eleve as object, 'obtenirStatutGlobal') === 'function'
        ? Reflect.apply(Reflect.get(eleve as object, 'obtenirStatutGlobal') as (...args: unknown[]) => unknown, eleve, [])
        : Reflect.get(eleve as object, 'statutGlobal');

      if (statutGlobal !== StatutEleve.ABANDONNE) {
        return null;
      }

      return {
        idEleve,
        dateAbandon: new Date(dernierAbandon.dateEvenement),
        motifAbandon: dernierAbandon.description,
      };
    } catch {
      return null;
    }
  }
}
