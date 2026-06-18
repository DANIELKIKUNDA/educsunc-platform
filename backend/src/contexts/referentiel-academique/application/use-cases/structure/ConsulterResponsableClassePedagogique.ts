import { UseCase } from '../../../../../shared/application/UseCase';
import { ErreurClasseAcademiqueInvalide } from '../../../domain/exceptions/ErreurClasseAcademiqueInvalide';
import { ErreurClassePedagogiqueInvalide } from '../../../domain/exceptions/ErreurClassePedagogiqueInvalide';
import { ErreurSectionScolaireInvalide } from '../../../domain/exceptions/ErreurSectionScolaireInvalide';
import { DepotClasseAcademique } from '../../../domain/repositories/DepotClasseAcademique';
import { AnneeScolaireId } from '../../../domain/value-objects/AnneeScolaireId';
import { ClasseAcademiqueId } from '../../../domain/value-objects/ClasseAcademiqueId';
import { ClassePedagogiqueId } from '../../../domain/value-objects/ClassePedagogiqueId';
import { DepotResponsabiliteClassePedagogique } from '../../../domain/repositories/DepotResponsabiliteClassePedagogique';
import { DepotSectionScolaire } from '../../../domain/repositories/DepotSectionScolaire';
import { ConsulterResponsableClassePedagogiqueEntree } from '../../dto/input/ConsulterResponsableClassePedagogiqueEntree';
import { ResponsabiliteClassePedagogiqueSortie } from '../../dto/output/ResponsabiliteClassePedagogiqueSortie';
import { ResponsabiliteClassePedagogiqueApplicationMapper } from '../../mappers/ResponsabiliteClassePedagogiqueApplicationMapper';
import { SectionScolaireId } from '../../../domain/value-objects/SectionScolaireId';

export interface SortieConsulterResponsableClassePedagogique {
  responsabiliteClassePedagogique: ResponsabiliteClassePedagogiqueSortie | null;
}

// Ce cas d'usage consulte le responsable actif d'une classe pedagogique pour une annee.
export class ConsulterResponsableClassePedagogique
  implements UseCase<ConsulterResponsableClassePedagogiqueEntree, SortieConsulterResponsableClassePedagogique>
{
  constructor(
    private readonly depotResponsabiliteClassePedagogique: DepotResponsabiliteClassePedagogique,
    private readonly depotClasseAcademique: DepotClasseAcademique,
    private readonly depotSectionScolaire: DepotSectionScolaire,
  ) {}

  public async executer(
    entree: ConsulterResponsableClassePedagogiqueEntree,
  ): Promise<SortieConsulterResponsableClassePedagogique> {
    const entreeValidee = this.validerEntree(entree);
    const responsabiliteClassePedagogique =
      await this.depotResponsabiliteClassePedagogique.trouverActiveParClasseEtAnnee(
        new ClassePedagogiqueId(entreeValidee.idClassePedagogique),
        new AnneeScolaireId(entreeValidee.idAnneeScolaire),
      );

    if (responsabiliteClassePedagogique === null) {
      return {
        responsabiliteClassePedagogique: null,
      };
    }

    const classeAcademique = await this.depotClasseAcademique.trouverParId(
      new ClasseAcademiqueId(
        responsabiliteClassePedagogique.obtenirIdClasseAcademique().obtenirValeur(),
      ),
    );

    if (classeAcademique === null) {
      throw new ErreurClasseAcademiqueInvalide(
        'La classe academique de la responsabilite consultee est introuvable.',
      );
    }

    const sectionScolaire = await this.depotSectionScolaire.trouverParId(
      new SectionScolaireId(classeAcademique.obtenirSectionScolaireId().obtenirValeur()),
    );

    if (sectionScolaire === null) {
      throw new ErreurSectionScolaireInvalide(
        'La section scolaire de la responsabilite consultee est introuvable.',
      );
    }

    return {
      responsabiliteClassePedagogique: ResponsabiliteClassePedagogiqueApplicationMapper.versSortie({
        responsabiliteClassePedagogique,
        sectionCode: sectionScolaire.obtenirCode(),
        sectionLibelle: sectionScolaire.obtenirLibelle(),
      }),
    };
  }

  private validerEntree(
    entree: ConsulterResponsableClassePedagogiqueEntree,
  ): ConsulterResponsableClassePedagogiqueEntree {
    return {
      idClassePedagogique: this.validerTexteObligatoire(entree?.idClassePedagogique, 'idClassePedagogique'),
      idAnneeScolaire: this.validerTexteObligatoire(entree?.idAnneeScolaire, 'idAnneeScolaire'),
    };
  }

  private validerTexteObligatoire(valeur: string | undefined, nomChamp: string): string {
    if (typeof valeur !== 'string' || valeur.trim().length === 0) {
      throw new ErreurClassePedagogiqueInvalide(`Le champ "${nomChamp}" est obligatoire.`);
    }

    return valeur.trim();
  }
}
