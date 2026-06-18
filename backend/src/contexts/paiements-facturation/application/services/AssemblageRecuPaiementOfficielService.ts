import type {
  RecuPaiementOfficielPersistable,
} from '../ports/DepotRecuPaiementOfficielPort';
import type {
  RecuPaiementOfficielLigneOutput,
  RecuPaiementOfficielOutput,
} from '../dto/output/PaiementsSortieDTO';
import type { DepotRecuPaiementOfficielPort } from '../ports/DepotRecuPaiementOfficielPort';
import type { ProjectionRecuPaiementPort } from '../ports/ProjectionRecuPaiementPort';
import type { DepotRecuPaiement } from '../../domain/repositories/DepotRecuPaiement';
import { ErreurGenerationRecuImpossible } from '../exceptions/ErreurGenerationRecuImpossible';
import { ErreurDroitsInsuffisants } from '../exceptions/ErreurDroitsInsuffisants';
import { convertirMontantEnLettres } from 'shared/utils/montantEnLettres';
import { Money } from '../../domain/value-objects/Money';

// Ce service reconstruit un recu officiel d'operation a partir des lignes internes de repartition.
export class AssemblageRecuPaiementOfficielService {
  constructor(
    private readonly depotRecuPaiement: DepotRecuPaiement,
    private readonly projectionRecuPaiementPort: ProjectionRecuPaiementPort,
    private readonly depotRecuPaiementOfficiel?: DepotRecuPaiementOfficielPort,
  ) {}

  public async assembler(idRecu: string, idEcoleCourante: string): Promise<RecuPaiementOfficielOutput> {
    const recuOfficiel = await this.depotRecuPaiementOfficiel?.trouverParIdRecu(idRecu);
    if (recuOfficiel !== undefined && recuOfficiel !== null) {
      if (recuOfficiel.idEcole !== idEcoleCourante) {
        throw new ErreurDroitsInsuffisants(
          "Le recu cible n'appartient pas a l'ecole courante.",
        );
      }

      return this.enrichirDepuisProjection(recuOfficiel);
    }

    const recuReference = await this.depotRecuPaiement.trouverParId(idRecu);
    if (recuReference === null) {
      throw new ErreurGenerationRecuImpossible('Le recu a reimprimer est introuvable.');
    }

    if (recuReference.obtenirIdEcole() !== idEcoleCourante) {
      throw new ErreurDroitsInsuffisants(
        "Le recu cible n'appartient pas a l'ecole courante.",
      );
    }

    const lignesRecus = await this.depotRecuPaiement.listerParPaiement(
      recuReference.obtenirIdPaiement(),
    );
    const lignesMemePaiement = lignesRecus.filter(
      (ligne) => ligne.obtenirIdEcole() === idEcoleCourante,
    );

    if (lignesMemePaiement.length === 0) {
      throw new ErreurGenerationRecuImpossible(
        "Aucune ligne de recu n'est disponible pour ce paiement.",
      );
    }

    const lignePrincipale = lignesMemePaiement
      .slice()
      .sort((gauche, droite) => {
        const ecartDate =
          gauche.obtenirDateEmission().getTime() - droite.obtenirDateEmission().getTime();
        if (ecartDate !== 0) {
          return ecartDate;
        }
        return gauche.obtenirNumeroRecu().localeCompare(droite.obtenirNumeroRecu());
      })[0]!;

    const totalMontant = lignesMemePaiement.reduce(
      (somme, ligne) => somme + ligne.obtenirMontant().obtenirMontant(),
      0,
    );
    const devise = lignePrincipale.obtenirMontant().obtenirDevise();
    const totalPaye = new Money(totalMontant, devise);
    const montantEnLettres = convertirMontantEnLettres(totalMontant, {
      devise,
      majusculeInitiale: true,
    });
    return this.enrichirDepuisProjection({
      idRecu: lignePrincipale.obtenirId(),
      numeroRecu: lignePrincipale.obtenirNumeroRecu(),
      idPaiement: lignePrincipale.obtenirIdPaiement(),
      idEcole: lignePrincipale.obtenirIdEcole(),
      idEleve: lignePrincipale.obtenirIdEleve(),
      totalPaye: totalPaye.obtenirMontant(),
      devise: totalPaye.obtenirDevise(),
      montantEnLettres,
      modePaiement: lignePrincipale.obtenirModePaiement(),
      idCaissier: lignePrincipale.obtenirIdCaissier(),
      dateEmission: lignePrincipale.obtenirDateEmission(),
      statutRecu: String(lignePrincipale.obtenirStatutRecu()),
      lignes: lignesMemePaiement.map((ligne, index) => ({
        idLigne: `${ligne.obtenirId()}-OFFICIEL`,
        numeroLigne: index + 1,
        idRecuLigne: ligne.obtenirId(),
        idObligation: ligne.obtenirIdObligation(),
        typeFrais: String(ligne.obtenirTypeFrais()),
        referenceFrais: ligne.obtenirReferenceFrais().toString(),
        libelle: ligne.obtenirLibelle(),
        montant: ligne.obtenirMontant().obtenirMontant(),
        devise: ligne.obtenirMontant().obtenirDevise(),
      })),
    });
  }

  private async enrichirDepuisProjection(
    recuOfficiel: RecuPaiementOfficielPersistable,
  ): Promise<RecuPaiementOfficielOutput> {
    const [ecole, eleve, contexteScolaire, caissier] = await Promise.all([
      this.projectionRecuPaiementPort.consulterEcole(recuOfficiel.idEcole),
      this.projectionRecuPaiementPort.consulterEleve(recuOfficiel.idEleve),
      this.projectionRecuPaiementPort.consulterContexteScolaire(
        recuOfficiel.idEleve,
      ),
      this.projectionRecuPaiementPort.consulterCaissier(
        recuOfficiel.idCaissier,
      ),
    ]);

    return {
      idRecu: recuOfficiel.idRecu,
      numeroRecu: recuOfficiel.numeroRecu,
      idPaiement: recuOfficiel.idPaiement,
      dateEmission: recuOfficiel.dateEmission,
      statutRecu: recuOfficiel.statutRecu,
      modePaiement: recuOfficiel.modePaiement,
      totalPaye: new Money(recuOfficiel.totalPaye, recuOfficiel.devise as 'CDF' | 'USD'),
      montantEnLettres: recuOfficiel.montantEnLettres,
      ecole,
      contexteScolaire,
      eleve,
      caissier,
      lignes: recuOfficiel.lignes.map<RecuPaiementOfficielLigneOutput>((ligne) => ({
        numeroLigne: ligne.numeroLigne,
        typeFrais: ligne.typeFrais,
        libelle: ligne.libelle,
        montant: new Money(ligne.montant, ligne.devise as 'CDF' | 'USD'),
      })),
    };
  }
}
