import { ResponsabiliteClassePedagogique } from '../../../../domain/aggregates/ResponsabiliteClassePedagogique';
import { AnneeScolaireId } from '../../../../domain/value-objects/AnneeScolaireId';
import { ClasseAcademiqueId } from '../../../../domain/value-objects/ClasseAcademiqueId';
import { ClassePedagogiqueId } from '../../../../domain/value-objects/ClassePedagogiqueId';
import { EcoleId } from '../../../../domain/value-objects/EcoleId';
import { OrganisationId } from '../../../../domain/value-objects/OrganisationId';
import { ResponsabiliteClassePedagogiqueId } from '../../../../domain/value-objects/ResponsabiliteClassePedagogiqueId';
import { SectionScolaireId } from '../../../../domain/value-objects/SectionScolaireId';
import {
  BaseMapperPostgresReferentielAcademique,
  ValeurDatePostgres,
} from './BaseMapperPostgresReferentielAcademique';

export interface PersistanceResponsabiliteClassePedagogiquePostgres {
  id: string;
  id_organisation: string;
  id_ecole: string;
  id_classe_pedagogique: string;
  id_classe_academique: string;
  id_section_scolaire: string;
  id_annee_scolaire: string;
  id_utilisateur_enseignant: string;
  active: boolean;
  date_debut: ValeurDatePostgres;
  date_fin?: ValeurDatePostgres | null;
  cree_le: ValeurDatePostgres;
  cree_par?: string | null;
  version: number;
}

// Ce mapper traduit la responsabilite de classe pedagogique entre domaine et persistance PostgreSQL.
export class ResponsabiliteClassePedagogiquePostgresMapper
  extends BaseMapperPostgresReferentielAcademique
{
  public static depuisPersistance(
    ligne: PersistanceResponsabiliteClassePedagogiquePostgres,
  ): ResponsabiliteClassePedagogique {
    return new ResponsabiliteClassePedagogique({
      id: new ResponsabiliteClassePedagogiqueId(ligne.id),
      idOrganisation: new OrganisationId(ligne.id_organisation),
      idEcole: new EcoleId(ligne.id_ecole),
      idClassePedagogique: new ClassePedagogiqueId(ligne.id_classe_pedagogique),
      idClasseAcademique: new ClasseAcademiqueId(ligne.id_classe_academique),
      idSectionScolaire: new SectionScolaireId(ligne.id_section_scolaire),
      idAnneeScolaire: new AnneeScolaireId(ligne.id_annee_scolaire),
      idUtilisateurEnseignant: ligne.id_utilisateur_enseignant,
      active: ligne.active,
      dateDebut: this.versDate(ligne.date_debut, 'date_debut'),
      dateFin: this.versDateOptionnelle(ligne.date_fin, 'date_fin'),
      creeLe: this.versDate(ligne.cree_le, 'cree_le'),
      creePar: ligne.cree_par ?? undefined,
      version: ligne.version,
    });
  }

  public static versPersistance(
    responsabiliteClassePedagogique: ResponsabiliteClassePedagogique,
  ): PersistanceResponsabiliteClassePedagogiquePostgres {
    return {
      id: responsabiliteClassePedagogique.obtenirId().obtenirValeur(),
      id_organisation: responsabiliteClassePedagogique.obtenirIdOrganisation().obtenirValeur(),
      id_ecole: responsabiliteClassePedagogique.obtenirIdEcole().obtenirValeur(),
      id_classe_pedagogique:
        responsabiliteClassePedagogique.obtenirIdClassePedagogique().obtenirValeur(),
      id_classe_academique:
        responsabiliteClassePedagogique.obtenirIdClasseAcademique().obtenirValeur(),
      id_section_scolaire:
        responsabiliteClassePedagogique.obtenirIdSectionScolaire().obtenirValeur(),
      id_annee_scolaire:
        responsabiliteClassePedagogique.obtenirIdAnneeScolaire().obtenirValeur(),
      id_utilisateur_enseignant:
        responsabiliteClassePedagogique.obtenirIdUtilisateurEnseignant(),
      active: responsabiliteClassePedagogique.estActive(),
      date_debut: this.versDatePersistance(responsabiliteClassePedagogique.obtenirDateDebut()),
      date_fin:
        this.versDatePersistanceOptionnelle(responsabiliteClassePedagogique.obtenirDateFin())
        ?? null,
      cree_le: this.versDatePersistance(responsabiliteClassePedagogique.obtenirCreeLe()),
      cree_par: responsabiliteClassePedagogique.obtenirCreePar() ?? null,
      version: responsabiliteClassePedagogique.obtenirVersion(),
    };
  }
}
