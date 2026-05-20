import type {
  PaiementEnregistreOutput,
  RecuPaiementOutput,
  RepartitionPaiementOutput,
} from '../../../application/dto/output/PaiementsSortieDTO';
import { PresentationHttpPaiementsFacturation } from './PresentationHttpPaiementsFacturation';

// Ce fichier presente les paiements et recus sous une forme JSON stable pour le client HTTP.
export interface RepartitionPaiementHttp {
  idRepartition: string;
  idObligation: string;
  montantAffecte: { montant: number; devise: string };
  ordreAffectation: number;
  origineAffectation: string;
}

export interface RecuPaiementHttp {
  idRecu: string;
  numeroRecu: string;
  idPaiement: string;
  idObligation: string;
  libelle: string;
  montant: { montant: number; devise: string };
  montantEnLettres: string;
  dateEmission: string;
  statutRecu: string;
}

export interface PaiementEnregistreHttp {
  idPaiement: string;
  montantTotal: { montant: number; devise: string };
  modePaiement: string;
  typeFraisDeclare: string;
  statutPaiement: string;
  repartitions: RepartitionPaiementHttp[];
  recus: RecuPaiementHttp[];
  restitution?: {
    idRestitution: string;
    montant: { montant: number; devise: string };
    raison: string;
  };
}

// Ce presenter isole les details de serialisation des paiements et recus.
export class PaiementPresenter {
  // Cette methode presente un paiement enregistre.
  public static presenterPaiementEnregistre(
    paiement: PaiementEnregistreOutput,
  ): { donnee: PaiementEnregistreHttp } {
    return PresentationHttpPaiementsFacturation.detail({
      idPaiement: paiement.idPaiement,
      montantTotal: PresentationHttpPaiementsFacturation.presenterMontant(
        paiement.montantTotal,
      ),
      modePaiement: String(paiement.modePaiement),
      typeFraisDeclare: String(paiement.typeFraisDeclare),
      statutPaiement: String(paiement.statutPaiement),
      repartitions: paiement.repartitions.map((repartition) =>
        this.presenterRepartition(repartition)),
      recus: paiement.recus.map((recu) => this.presenterRecu(recu)),
      restitution:
        paiement.restitution === undefined
          ? undefined
          : {
            idRestitution: paiement.restitution.idRestitution,
            montant: PresentationHttpPaiementsFacturation.presenterMontant(
              paiement.restitution.montant,
            ),
            raison: paiement.restitution.raison,
          },
    });
  }

  // Cette methode presente un recu unique.
  public static presenterRecuPaiement(
    recu: RecuPaiementOutput,
  ): { donnee: RecuPaiementHttp } {
    return PresentationHttpPaiementsFacturation.detail(this.presenterRecu(recu));
  }

  // Cette methode presente une liste de recus.
  public static presenterRecusPaiement(
    recus: RecuPaiementOutput[],
  ): { donnees: RecuPaiementHttp[] } {
    return {
      donnees: recus.map((recu) => this.presenterRecu(recu)),
    };
  }

  // Cette methode transforme une repartition applicative en reponse HTTP.
  private static presenterRepartition(
    repartition: RepartitionPaiementOutput,
  ): RepartitionPaiementHttp {
    return {
      idRepartition: repartition.idRepartition,
      idObligation: repartition.idObligation,
      montantAffecte: PresentationHttpPaiementsFacturation.presenterMontant(
        repartition.montantAffecte,
      ),
      ordreAffectation: repartition.ordreAffectation,
      origineAffectation: repartition.origineAffectation,
    };
  }

  // Cette methode transforme un recu applicatif en reponse HTTP.
  private static presenterRecu(recu: RecuPaiementOutput): RecuPaiementHttp {
    return {
      idRecu: recu.idRecu,
      numeroRecu: recu.numeroRecu,
      idPaiement: recu.idPaiement,
      idObligation: recu.idObligation,
      libelle: recu.libelle,
      montant: PresentationHttpPaiementsFacturation.presenterMontant(recu.montant),
      montantEnLettres: recu.montantEnLettres,
      dateEmission: PresentationHttpPaiementsFacturation.presenterDate(recu.dateEmission),
      statutRecu: recu.statutRecu,
    };
  }
}
