import { UseCase } from '../../../../../shared/application/UseCase';
import { ErreurClasseAcademiqueInvalide } from '../../../domain/exceptions/ErreurClasseAcademiqueInvalide';
import { ErreurClassePedagogiqueInvalide } from '../../../domain/exceptions/ErreurClassePedagogiqueInvalide';
import { ErreurSectionScolaireInvalide } from '../../../domain/exceptions/ErreurSectionScolaireInvalide';
import { DepotClasseAcademique } from '../../../domain/repositories/DepotClasseAcademique';
import { AnneeScolaireId } from '../../../domain/value-objects/AnneeScolaireId';
import { ClassePedagogiqueId } from '../../../domain/value-objects/ClassePedagogiqueId';
import { DepotResponsabiliteClassePedagogique } from '../../../domain/repositories/DepotResponsabiliteClassePedagogique';
import { DepotSectionScolaire } from '../../../domain/repositories/DepotSectionScolaire';
import { SectionScolaireId } from '../../../domain/value-objects/SectionScolaireId';
import { RetirerResponsableClassePedagogiqueEntree } from '../../dto/input/RetirerResponsableClassePedagogiqueEntree';
import { ResponsabiliteClassePedagogiqueSortie } from '../../dto/output/ResponsabiliteClassePedagogiqueSortie';
import { ResponsabiliteClassePedagogiqueApplicationMapper } from '../../mappers/ResponsabiliteClassePedagogiqueApplicationMapper';

export interface SortieRetirerResponsableClassePedagogique {
  responsabiliteClassePedagogique: ResponsabiliteClassePedagogiqueSortie;
}

// Ce cas d'usage retire le responsable actif d'une classe pedagogique.
export class RetirerResponsableClassePedagogique
  implements UseCase<RetirerResponsableClassePedagogiqueEntree, SortieRetirerResponsableClassePedagogique>
{
  constructor(
    private readonly depotResponsabiliteClassePedagogique: DepotResponsabiliteClassePedagogique,
    private readonly depotClasseAcademique: DepotClasseAcademique,
    private readonly depotSectionScolaire: DepotSectionScolaire,
  ) {}

  public async executer(
    entree: RetirerResponsableClassePedagogiqueEntree,
  ): Promise<SortieRetirerResponsableClassePedagogique> {
    const entreeValidee = this.validerEntree(entree);
    const responsabiliteClassePedagogique =
      await this.depotResponsabiliteClassePedagogique.trouverActiveParClasseEtAnnee(
        new ClassePedagogiqueId(entreeValidee.idClassePedagogique),
        new AnneeScolaireId(entreeValidee.idAnneeScolaire),
      );

    if (responsabiliteClassePedagogique === null) {
      throw new ErreurClassePedagogiqueInvalide(
        'Aucune responsabilite active de classe pedagogique n a ete trouvee.',
      );
    }

    responsabiliteClassePedagogique.desactiver();
    await this.depotResponsabiliteClassePedagogique.sauvegarder(responsabiliteClassePedagogique);
    const classeAcademique = await this.depotClasseAcademique.trouverParId(
      responsabiliteClassePedagogique.obtenirIdClasseAcademique(),
    );

    if (classeAcademique === null) {
      throw new ErreurClasseAcademiqueInvalide(
        'La classe academique de la responsabilite retiree est introuvable.',
      );
    }

    const sectionScolaire = await this.depotSectionScolaire.trouverParId(
      new SectionScolaireId(classeAcademique.obtenirSectionScolaireId().obtenirValeur()),
    );

    if (sectionScolaire === null) {
      throw new ErreurSectionScolaireInvalide(
        'La section scolaire de la responsabilite retiree est introuvable.',
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
    entree: RetirerResponsableClassePedagogiqueEntree,
  ): RetirerResponsableClassePedagogiqueEntree {
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
