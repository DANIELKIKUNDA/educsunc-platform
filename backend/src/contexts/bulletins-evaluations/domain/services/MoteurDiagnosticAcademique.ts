import { DiagnosticTechniqueAcademique } from '../entities/DiagnosticTechniqueAcademique';
import { NiveauGraviteAnomalie } from '../value-objects/NiveauGraviteAnomalie';
import { TypeAnomalieAcademique } from '../value-objects/TypeAnomalieAcademique';

// Ce moteur produit des diagnostics academiques lisibles a partir d'anomalies detectees.
export class MoteurDiagnosticAcademique {
  // Cette methode cree un diagnostic academique standardise.
  public creerDiagnostic(params: {
    idDiagnosticTechniqueAcademique: string;
    idEcole: string;
    idClassePedagogique: string;
    idEleve?: string;
    idReferentielCours?: string;
    codeColonne?: string;
    typeAnomalie: TypeAnomalieAcademique;
    niveauGravite: NiveauGraviteAnomalie;
    message: string;
    details?: string;
    detecteParMoteur: string;
  }): DiagnosticTechniqueAcademique {
    return new DiagnosticTechniqueAcademique({
      ...params,
      detecteLe: new Date(),
    });
  }

  // Cette methode detecte les anomalies les plus frequentes d'un calcul.
  public detecter(params: {
    idEcole: string;
    idClassePedagogique: string;
    idEleve?: string;
    idReferentielCours?: string;
    codeColonne?: string;
    coteManquante?: boolean;
    maximumIncoherent?: boolean;
    colonneInterditeEncodee?: boolean;
    totalEncodeManuellement?: boolean;
    examenEncodeSansExamen?: boolean;
    classementIncoherent?: boolean;
    bulletinIncomplet?: boolean;
  }): DiagnosticTechniqueAcademique[] {
    const diagnostics: DiagnosticTechniqueAcademique[] = [];
    const creer = (
      typeAnomalie: TypeAnomalieAcademique,
      niveauGravite: NiveauGraviteAnomalie,
      message: string,
    ) => diagnostics.push(
      this.creerDiagnostic({
        idDiagnosticTechniqueAcademique: `${typeAnomalie}-${params.idClassePedagogique}-${params.idEleve ?? 'global'}`,
        idEcole: params.idEcole,
        idClassePedagogique: params.idClassePedagogique,
        idEleve: params.idEleve,
        idReferentielCours: params.idReferentielCours,
        codeColonne: params.codeColonne,
        typeAnomalie,
        niveauGravite,
        message,
        detecteParMoteur: 'MoteurDiagnosticAcademique',
      }),
    );

    if (params.coteManquante) {
      creer(TypeAnomalieAcademique.COTE_MANQUANTE, NiveauGraviteAnomalie.BLOQUANT, 'Une cote obligatoire est manquante.');
    }
    if (params.maximumIncoherent) {
      creer(TypeAnomalieAcademique.MAXIMUM_INCOHERENT, NiveauGraviteAnomalie.CRITIQUE, 'Le maximum general est incoherent.');
    }
    if (params.colonneInterditeEncodee) {
      creer(TypeAnomalieAcademique.COLONNE_INTERDITE_ENCODEE, NiveauGraviteAnomalie.CRITIQUE, 'Une colonne interdite a ete encodee.');
    }
    if (params.totalEncodeManuellement) {
      creer(TypeAnomalieAcademique.TOTAL_ENCODE_MANUELLEMENT, NiveauGraviteAnomalie.BLOQUANT, 'Un total a ete encode manuellement.');
    }
    if (params.examenEncodeSansExamen) {
      creer(TypeAnomalieAcademique.EXAMEN_ENCODE_COURS_SANS_EXAMEN, NiveauGraviteAnomalie.BLOQUANT, 'Un examen a ete encode sur un cours sans examen.');
    }
    if (params.classementIncoherent) {
      creer(TypeAnomalieAcademique.CLASSEMENT_INCOHERENT, NiveauGraviteAnomalie.BLOQUANT, 'Le classement calcule est incoherent.');
    }
    if (params.bulletinIncomplet) {
      creer(TypeAnomalieAcademique.BULLETIN_INCOMPLET, NiveauGraviteAnomalie.AVERTISSEMENT, 'Le bulletin reste incomplet.');
    }

    return diagnostics;
  }
}
