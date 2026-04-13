import { AnneeScolaire } from '../../domain/aggregates/AnneeScolaire';
import { ErreurAnneeScolaireInvalide } from '../../domain/exceptions/ErreurAnneeScolaireInvalide';

export interface PropositionAnneeScolaireAdministrative {
  code: string;
  libelle: string;
  dateDebut: Date;
  dateFin: Date;
}

export interface SurchargeDatesAnneeScolaireAdministrative {
  dateDebut?: Date;
  dateFin?: Date;
}

// Ce service applicatif calcule les annees administratives selon le rythme scolaire RDC.
export class ServiceCycleAnneeScolaireRdc {
  private readonly moisDebutAdministratif = 6;
  private readonly jourDebutAdministratif = 1;
  private readonly moisFinAdministrative = 5;
  private readonly jourFinAdministrative = 30;

  // Cette methode propose l'annee administrative courante a partir d'une date de reference.
  public proposerAnneeCourante(
    dateReference: Date = new Date(),
    datesForcees: SurchargeDatesAnneeScolaireAdministrative = {},
  ): PropositionAnneeScolaireAdministrative {
    const dateValidee = this.validerDate(dateReference, 'dateReference');
    const anneeDebut = dateValidee.getMonth() >= this.moisDebutAdministratif
      ? dateValidee.getFullYear()
      : dateValidee.getFullYear() - 1;

    return this.creerPropositionDepuisAnneeDebut(anneeDebut, datesForcees);
  }

  // Cette methode propose l'annee administrative suivante en conservant le cycle de l'annee source.
  public proposerAnneeSuivante(
    anneeSource: AnneeScolaire,
    datesForcees: SurchargeDatesAnneeScolaireAdministrative = {},
  ): PropositionAnneeScolaireAdministrative {
    const anneeDebut = this.extraireAnneeDebut(anneeSource) + 1;
    const dateDebut = datesForcees.dateDebut === undefined
      ? this.ajouterAnnees(anneeSource.obtenirDateDebut(), 1)
      : this.validerDate(datesForcees.dateDebut, 'dateDebut');
    const dateFin = datesForcees.dateFin === undefined
      ? this.ajouterAnnees(anneeSource.obtenirDateFin(), 1)
      : this.validerDate(datesForcees.dateFin, 'dateFin');

    return this.creerProposition(anneeDebut, dateDebut, dateFin);
  }

  private creerPropositionDepuisAnneeDebut(
    anneeDebut: number,
    datesForcees: SurchargeDatesAnneeScolaireAdministrative,
  ): PropositionAnneeScolaireAdministrative {
    const dateDebut = datesForcees.dateDebut === undefined
      ? new Date(Date.UTC(anneeDebut, this.moisDebutAdministratif, this.jourDebutAdministratif))
      : this.validerDate(datesForcees.dateDebut, 'dateDebut');
    const dateFin = datesForcees.dateFin === undefined
      ? new Date(Date.UTC(anneeDebut + 1, this.moisFinAdministrative, this.jourFinAdministrative))
      : this.validerDate(datesForcees.dateFin, 'dateFin');

    return this.creerProposition(anneeDebut, dateDebut, dateFin);
  }

  private creerProposition(
    anneeDebut: number,
    dateDebut: Date,
    dateFin: Date,
  ): PropositionAnneeScolaireAdministrative {
    if (!Number.isInteger(anneeDebut) || anneeDebut < 1900) {
      throw new ErreurAnneeScolaireInvalide(
        "L'annee de debut administrative est invalide.",
      );
    }

    if (dateDebut.getTime() >= dateFin.getTime()) {
      throw new ErreurAnneeScolaireInvalide(
        "La date de debut administrative doit preceder la date de cloture administrative.",
      );
    }

    const code = `${anneeDebut}-${anneeDebut + 1}`;

    return {
      code,
      libelle: `Annee scolaire ${code}`,
      dateDebut,
      dateFin,
    };
  }

  private extraireAnneeDebut(anneeSource: AnneeScolaire): number {
    const correspondanceCode = /^(\d{4})-(\d{4})$/u.exec(anneeSource.obtenirCode());

    if (correspondanceCode !== null) {
      const anneeDebut = Number.parseInt(correspondanceCode[1], 10);
      const anneeFin = Number.parseInt(correspondanceCode[2], 10);

      if (anneeFin === anneeDebut + 1) {
        return anneeDebut;
      }
    }

    return anneeSource.obtenirDateDebut().getFullYear();
  }

  private ajouterAnnees(date: Date, nombreAnnees: number): Date {
    const copie = new Date(date.getTime());

    copie.setFullYear(copie.getFullYear() + nombreAnnees);

    return copie;
  }

  private validerDate(date: Date, nomChamp: string): Date {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
      throw new ErreurAnneeScolaireInvalide(
        `Le champ "${nomChamp}" doit etre une date valide.`,
      );
    }

    return new Date(date.getTime());
  }
}
