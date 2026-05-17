import type { RecuPaiement } from '../../domain/aggregates/RecuPaiement';
import type { ServiceStockageFichier } from '../../../../shared/infrastructure/storage/FileStorageService';

// Ce fichier prepare un contenu PDF minimal de recu et peut l'envoyer vers un stockage shared.
export class ServicePdfRecuPaiement {
  // Ce constructeur accepte un stockage shared optionnel afin de garder la generation PDF decouplee.
  constructor(
    private readonly stockage?: ServiceStockageFichier,
  ) {}

  // Cette methode construit un contenu texte/PDF simple a partir d'un recu deja valide.
  public async genererEtStocker(
    recu: RecuPaiement,
    cheminCible?: string,
  ): Promise<{ chemin?: string; contenu: Buffer }> {
    const contenuTexte = [
      'RECU DE PAIEMENT',
      `Numero : ${recu.obtenirNumeroRecu()}`,
      `Ecole : ${recu.obtenirIdEcole()}`,
      `Eleve : ${recu.obtenirIdEleve()}`,
      `Frais : ${recu.obtenirLibelle()}`,
      `Montant : ${recu.obtenirMontant().obtenirMontant()} ${recu.obtenirMontant().obtenirDevise()}`,
      `Montant en lettres : ${recu.obtenirMontantEnLettres()}`,
      `Mode : ${recu.obtenirModePaiement()}`,
      `Caissier : ${recu.obtenirIdCaissier()}`,
      `Date : ${recu.obtenirDateEmission().toISOString()}`,
    ].join('\n');
    const contenu = Buffer.from(contenuTexte, 'utf8');

    if (this.stockage === undefined || cheminCible === undefined) {
      return { contenu };
    }

    const chemin = await this.stockage.televerser(cheminCible, contenu);

    return { chemin, contenu };
  }
}
