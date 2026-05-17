import type { AuditEncodageReadModel } from 'contexts/bulletins-evaluations/application/queries/AuditEncodageQuery';
import type { FicheCotationReadModel } from 'contexts/bulletins-evaluations/application/read-models/FicheCotationReadModel';
import type { FicheCotationOutput } from 'contexts/bulletins-evaluations/application/dto/output/FicheCotationOutput';
import type { LigneFicheCotationOutput } from 'contexts/bulletins-evaluations/application/dto/output/LigneFicheCotationOutput';
import type { FicheCotationEleveCours } from 'contexts/bulletins-evaluations/domain/aggregates/FicheCotationEleveCours';
import type { CoteColonneBulletin } from 'contexts/bulletins-evaluations/domain/entities/CoteColonneBulletin';

// Ce fichier centralise le mapping PostgreSQL d'une fiche de cotation entre domaine et lecture.
export class FicheCotationPostgresMapper {
  // Cette methode transforme une colonne de cote domaine en ligne lisible par l'application.
  public static versLigneFiche(cote: CoteColonneBulletin): LigneFicheCotationOutput {
    return {
      codeColonne: cote.obtenirCodeColonne(),
      coteObtenue: cote.obtenirCoteObtenue(),
      maximumColonne: cote.obtenirMaximumColonne(),
      estEchec: cote.obtenirEstEchec(),
      styleAffichage: cote.obtenirStyleAffichage(),
    };
  }

  // Cette methode transforme une fiche domaine en read model de lecture.
  public static versReadModel(fiche: FicheCotationEleveCours): FicheCotationReadModel {
    return {
      idFicheCotationEleveCours: fiche.obtenirId(),
      idEleve: fiche.obtenirIdEleve(),
      idReferentielCours: fiche.obtenirIdReferentielCours(),
      idAnneeScolaire: fiche.obtenirIdAnneeScolaire(),
      typeStructureEvaluation: fiche.obtenirTypeStructureEvaluation(),
      estCalculable: fiche.obtenirEstCalculable(),
      aExamen: fiche.obtenirAExamen(),
      colonnes: fiche.obtenirCotesColonnes().map((cote) => this.versLigneFiche(cote)),
      version: fiche.obtenirVersion(),
    };
  }

  // Cette methode fournit le DTO de sortie applicatif sur la base du meme mapping.
  public static versOutput(fiche: FicheCotationEleveCours): FicheCotationOutput {
    return this.versReadModel(fiche);
  }

  // Cette methode reconstruit les traces d'audit observables depuis les colonnes de la fiche.
  public static versAuditsEncodage(fiche: FicheCotationEleveCours): AuditEncodageReadModel[] {
    return fiche.obtenirCotesColonnes().flatMap((cote) => {
      const entrees: AuditEncodageReadModel[] = [];

      if (cote.obtenirDateEncodage() !== undefined) {
        entrees.push({
          action: 'ENCODAGE',
          dateAction: cote.obtenirDateEncodage() ?? new Date(),
          idUtilisateur: cote.obtenirEncodeePar(),
          commentaire: `Colonne ${String(cote.obtenirCodeColonne())}`,
        });
      }

      if (cote.obtenirDateModification() !== undefined) {
        entrees.push({
          action: 'MODIFICATION',
          dateAction: cote.obtenirDateModification() ?? new Date(),
          idUtilisateur: cote.obtenirModifieePar(),
          commentaire: `Colonne ${String(cote.obtenirCodeColonne())}`,
        });
      }

      return entrees;
    });
  }
}
