import { UseCase } from '../../../../../shared/application/UseCase';
import { ResponsabiliteClassePedagogique } from '../../../domain/aggregates/ResponsabiliteClassePedagogique';
import { ErreurClasseAcademiqueInvalide } from '../../../domain/exceptions/ErreurClasseAcademiqueInvalide';
import { ErreurClassePedagogiqueInvalide } from '../../../domain/exceptions/ErreurClassePedagogiqueInvalide';
import { ErreurSectionScolaireInvalide } from '../../../domain/exceptions/ErreurSectionScolaireInvalide';
import { PolicyEligibiliteResponsableClassePedagogique } from '../../../domain/policies/PolicyEligibiliteResponsableClassePedagogique';
import { PolicyResponsabiliteClassePedagogique } from '../../../domain/policies/PolicyResponsabiliteClassePedagogique';
import { DepotAnneeScolaire } from '../../../domain/repositories/DepotAnneeScolaire';
import { DepotClasseAcademique } from '../../../domain/repositories/DepotClasseAcademique';
import { DepotClassePedagogique } from '../../../domain/repositories/DepotClassePedagogique';
import { DepotEcole } from '../../../domain/repositories/DepotEcole';
import { DepotResponsabiliteClassePedagogique } from '../../../domain/repositories/DepotResponsabiliteClassePedagogique';
import { DepotSectionScolaire } from '../../../domain/repositories/DepotSectionScolaire';
import { AnneeScolaireId } from '../../../domain/value-objects/AnneeScolaireId';
import { ClasseAcademiqueId } from '../../../domain/value-objects/ClasseAcademiqueId';
import { ClassePedagogiqueId } from '../../../domain/value-objects/ClassePedagogiqueId';
import { EcoleId } from '../../../domain/value-objects/EcoleId';
import { ResponsabiliteClassePedagogiqueId } from '../../../domain/value-objects/ResponsabiliteClassePedagogiqueId';
import { SectionScolaireId } from '../../../domain/value-objects/SectionScolaireId';
import { AttribuerResponsableClassePedagogiqueEntree } from '../../dto/input/AttribuerResponsableClassePedagogiqueEntree';
import { ResponsabiliteClassePedagogiqueSortie } from '../../dto/output/ResponsabiliteClassePedagogiqueSortie';
import { ResponsabiliteClassePedagogiqueApplicationMapper } from '../../mappers/ResponsabiliteClassePedagogiqueApplicationMapper';
import type { VerifierEligibiliteResponsableClassePedagogiquePort } from '../../ports/VerifierEligibiliteResponsableClassePedagogiquePort';

export interface SortieAttribuerResponsableClassePedagogique {
  responsabiliteClassePedagogique: ResponsabiliteClassePedagogiqueSortie;
}

// Ce cas d'usage attribue le responsable officiel d'une classe pedagogique.
export class AttribuerResponsableClassePedagogique
  implements UseCase<AttribuerResponsableClassePedagogiqueEntree, SortieAttribuerResponsableClassePedagogique>
{
  constructor(
    private readonly depotResponsabiliteClassePedagogique: DepotResponsabiliteClassePedagogique,
    private readonly depotClassePedagogique: DepotClassePedagogique,
    private readonly depotClasseAcademique: DepotClasseAcademique,
    private readonly depotSectionScolaire: DepotSectionScolaire,
    private readonly depotAnneeScolaire: DepotAnneeScolaire,
    private readonly depotEcole: DepotEcole,
    private readonly verifierEligibiliteResponsableClassePedagogiquePort: VerifierEligibiliteResponsableClassePedagogiquePort,
    private readonly policyResponsabiliteClassePedagogique: PolicyResponsabiliteClassePedagogique =
      new PolicyResponsabiliteClassePedagogique(),
    private readonly policyEligibiliteResponsableClassePedagogique: PolicyEligibiliteResponsableClassePedagogique =
      new PolicyEligibiliteResponsableClassePedagogique(),
  ) {}

  public async executer(
    entree: AttribuerResponsableClassePedagogiqueEntree,
  ): Promise<SortieAttribuerResponsableClassePedagogique> {
    const entreeValidee = this.validerEntree(entree);
    const classePedagogique = await this.obtenirClassePedagogique(entreeValidee.idClassePedagogique);
    const classeAcademique = await this.obtenirClasseAcademique(
      classePedagogique.obtenirClasseAcademiqueId().obtenirValeur(),
    );
    const sectionScolaire = await this.obtenirSectionScolaire(
      classeAcademique.obtenirSectionScolaireId().obtenirValeur(),
    );
    const anneeScolaire = await this.obtenirAnneeScolaire(
      classePedagogique.obtenirAnneeScolaireId().obtenirValeur(),
    );
    const ecole = await this.obtenirEcole(classePedagogique.obtenirEcoleId().obtenirValeur());
    const responsabiliteExistante = await this.depotResponsabiliteClassePedagogique.trouverActiveParClasseEtAnnee(
      classePedagogique.obtenirId(),
      classePedagogique.obtenirAnneeScolaireId(),
    );
    const eligibiliteResponsable =
      await this.verifierEligibiliteResponsableClassePedagogiquePort.verifier({
        idUtilisateur: entreeValidee.idUtilisateurEnseignant,
        idOrganisation: ecole.obtenirOrganisationId().obtenirValeur(),
        idEcole: ecole.obtenirId().obtenirValeur(),
      });

    this.policyResponsabiliteClassePedagogique.verifierAttribution({
      classePedagogiqueExisteDejaAvecResponsableActif: responsabiliteExistante !== null,
      memeEcole: anneeScolaire.obtenirEcoleId().estEgal(ecole.obtenirId())
        && classePedagogique.obtenirEcoleId().estEgal(ecole.obtenirId()),
      memeAnneeScolaire: classePedagogique.obtenirAnneeScolaireId().estEgal(anneeScolaire.obtenirId()),
      classeAcademiqueCoherente: classePedagogique.obtenirClasseAcademiqueId().estEgal(classeAcademique.obtenirId()),
      sectionScolaireCoherente: classeAcademique.obtenirSectionScolaireId().estEgal(sectionScolaire.obtenirId()),
    });
    this.policyEligibiliteResponsableClassePedagogique.verifier({
      utilisateurExiste: eligibiliteResponsable.utilisateurExiste,
      utilisateurActif: eligibiliteResponsable.utilisateurActif,
      codeRoleActif: eligibiliteResponsable.codeRoleActif,
      memeOrganisation: eligibiliteResponsable.idOrganisation === ecole.obtenirOrganisationId().obtenirValeur(),
      memeEcole: eligibiliteResponsable.idEcole === ecole.obtenirId().obtenirValeur(),
    });

    const responsabiliteClassePedagogique = new ResponsabiliteClassePedagogique({
      id: new ResponsabiliteClassePedagogiqueId(),
      idOrganisation: ecole.obtenirOrganisationId(),
      idEcole: ecole.obtenirId(),
      idClassePedagogique: classePedagogique.obtenirId(),
      idClasseAcademique: classeAcademique.obtenirId(),
      idSectionScolaire: sectionScolaire.obtenirId(),
      idAnneeScolaire: anneeScolaire.obtenirId(),
      idUtilisateurEnseignant: entreeValidee.idUtilisateurEnseignant,
      active: true,
      dateDebut: new Date(),
      creeLe: new Date(),
      creePar: entreeValidee.creePar,
      version: 1,
    });

    await this.depotResponsabiliteClassePedagogique.sauvegarder(responsabiliteClassePedagogique);

    return {
      responsabiliteClassePedagogique: ResponsabiliteClassePedagogiqueApplicationMapper.versSortie({
        responsabiliteClassePedagogique,
        sectionCode: sectionScolaire.obtenirCode(),
        sectionLibelle: sectionScolaire.obtenirLibelle(),
      }),
    };
  }

  private async obtenirClassePedagogique(idClassePedagogique: string) {
    const classePedagogique = await this.depotClassePedagogique.trouverParId(
      new ClassePedagogiqueId(idClassePedagogique),
    );

    if (classePedagogique === null) {
      throw new ErreurClassePedagogiqueInvalide(
        'La classe pedagogique de rattachement est introuvable.',
      );
    }

    return classePedagogique;
  }

  private async obtenirClasseAcademique(idClasseAcademique: string) {
    const classeAcademique = await this.depotClasseAcademique.trouverParId(
      new ClasseAcademiqueId(idClasseAcademique),
    );

    if (classeAcademique === null) {
      throw new ErreurClasseAcademiqueInvalide(
        'La classe academique de rattachement est introuvable.',
      );
    }

    return classeAcademique;
  }

  private async obtenirSectionScolaire(idSectionScolaire: string) {
    const sectionScolaire = await this.depotSectionScolaire.trouverParId(
      new SectionScolaireId(idSectionScolaire),
    );

    if (sectionScolaire === null) {
      throw new ErreurSectionScolaireInvalide(
        'La section scolaire de rattachement est introuvable.',
      );
    }

    return sectionScolaire;
  }

  private async obtenirAnneeScolaire(idAnneeScolaire: string) {
    const anneeScolaire = await this.depotAnneeScolaire.trouverParId(new AnneeScolaireId(idAnneeScolaire));

    if (anneeScolaire === null) {
      throw new ErreurClassePedagogiqueInvalide(
        "L'annee scolaire de rattachement est introuvable.",
      );
    }

    return anneeScolaire;
  }

  private async obtenirEcole(idEcole: string) {
    const ecole = await this.depotEcole.trouverParId(new EcoleId(idEcole));

    if (ecole === null) {
      throw new ErreurClassePedagogiqueInvalide(
        "L'ecole de rattachement est introuvable.",
      );
    }

    return ecole;
  }

  private validerEntree(
    entree: AttribuerResponsableClassePedagogiqueEntree,
  ): AttribuerResponsableClassePedagogiqueEntree {
    return {
      idClassePedagogique: this.validerTexteObligatoire(entree?.idClassePedagogique, 'idClassePedagogique'),
      idUtilisateurEnseignant: this.validerTexteObligatoire(entree?.idUtilisateurEnseignant, 'idUtilisateurEnseignant'),
      creePar: this.validerTexteObligatoire(entree?.creePar, 'creePar'),
    };
  }

  private validerTexteObligatoire(valeur: string | undefined, nomChamp: string): string {
    if (typeof valeur !== 'string' || valeur.trim().length === 0) {
      throw new ErreurClassePedagogiqueInvalide(`Le champ "${nomChamp}" est obligatoire.`);
    }

    return valeur.trim();
  }
}
