import { Entite } from '../../../../shared/domain/Entity';
import { ErreurResponsableFamilleDuplique } from '../exceptions/ErreurResponsableFamilleDuplique';
import { ErreurResponsablePrincipalInvalide } from '../exceptions/ErreurResponsablePrincipalInvalide';
import { LienParente } from '../value-objects/LienParente';
import { UUID } from '../value-objects/TypesPrimitifs';

// Ce fichier definit l'entite enfant qui represente un responsable dans une famille.
export interface ProprietesResponsableFamille {
  idResponsableFamille: UUID;
  nomComplet: string;
  telephone: string;
  telephoneSecondaire?: string;
  profession?: string;
  lienParente: LienParente;
  adresse?: string;
  estPrincipal: boolean;
}

/**
 * Cette entite represente un parent, tuteur ou responsable legal rattache a une famille.
 */
export class ResponsableFamille extends Entite<UUID> {
  constructor(
    idResponsableFamille: UUID,
    private nomComplet: string,
    private telephone: string,
    private telephoneSecondaire: string | undefined,
    private profession: string | undefined,
    private lienParente: LienParente,
    private adresse: string | undefined,
    private estPrincipal: boolean
  ) {
    super(idResponsableFamille);
    this.nomComplet = this.nettoyerTexteObligatoire(nomComplet, 'nomComplet');
    this.telephone = this.nettoyerTexteObligatoire(telephone, 'telephone');
    this.telephoneSecondaire = this.nettoyerTexteOptionnel(telephoneSecondaire);
    this.profession = this.nettoyerTexteOptionnel(profession);
    this.lienParente = this.validerLienParente(lienParente);
    this.adresse = this.nettoyerTexteOptionnel(adresse);
  }

  /** Cree un responsable familial a partir de proprietes nommees. */
  public static creer(proprietes: ProprietesResponsableFamille): ResponsableFamille {
    return new ResponsableFamille(
      proprietes.idResponsableFamille,
      proprietes.nomComplet,
      proprietes.telephone,
      proprietes.telephoneSecondaire,
      proprietes.profession,
      proprietes.lienParente,
      proprietes.adresse,
      proprietes.estPrincipal,
    );
  }

  /** Modifie les informations administratives du responsable familial. */
  public modifier(nomComplet: string, telephone: string, telephoneSecondaire: string | undefined, profession: string | undefined, lienParente: LienParente, adresse: string | undefined): void {
    this.nomComplet = this.nettoyerTexteObligatoire(nomComplet, 'nomComplet');
    this.telephone = this.nettoyerTexteObligatoire(telephone, 'telephone');
    this.telephoneSecondaire = this.nettoyerTexteOptionnel(telephoneSecondaire);
    this.profession = this.nettoyerTexteOptionnel(profession);
    this.lienParente = this.validerLienParente(lienParente);
    this.adresse = this.nettoyerTexteOptionnel(adresse);
  }

  /** Rend ce responsable principal pour la famille. */
  public devenirPrincipal(): void {
    this.estPrincipal = true;
  }

  /** Retire le statut de responsable principal. */
  public retirerPrincipalite(): void {
    this.estPrincipal = false;
  }

  /** Retourne le nom complet du responsable. */
  public obtenirNomComplet(): string {
    return this.nomComplet;
  }

  /** Retourne le telephone principal du responsable. */
  public obtenirTelephone(): string {
    return this.telephone;
  }

  /** Retourne le telephone secondaire quand il est renseigne. */
  public obtenirTelephoneSecondaire(): string | undefined {
    return this.telephoneSecondaire;
  }

  /** Retourne la profession quand elle est renseignee. */
  public obtenirProfession(): string | undefined {
    return this.profession;
  }

  /** Retourne le lien de parente du responsable avec les eleves de la famille. */
  public obtenirLienParente(): LienParente {
    return this.lienParente;
  }

  /** Retourne l'adresse du responsable quand elle est renseignee. */
  public obtenirAdresse(): string | undefined {
    return this.adresse;
  }

  /** Indique si ce responsable est le contact principal de la famille. */
  public estResponsablePrincipal(): boolean {
    return this.estPrincipal;
  }

  /** Retourne une copie simple des proprietes pour persistance ou presentation future. */
  public versProprietes(): ProprietesResponsableFamille {
    return {
      idResponsableFamille: this.obtenirId(),
      nomComplet: this.nomComplet,
      telephone: this.telephone,
      telephoneSecondaire: this.telephoneSecondaire,
      profession: this.profession,
      lienParente: this.lienParente,
      adresse: this.adresse,
      estPrincipal: this.estPrincipal,
    };
  }

  /** Verifie qu'un nouveau responsable n'est pas la meme personne administrative. */
  public verifierNonDupliqueAvec(autreResponsable: ResponsableFamille): void {
    const memeIdentiteAdministrative = this.nomComplet.toLocaleLowerCase('fr-FR') === autreResponsable.obtenirNomComplet().toLocaleLowerCase('fr-FR')
      && this.telephone === autreResponsable.obtenirTelephone();

    if (memeIdentiteAdministrative && this.obtenirId() !== autreResponsable.obtenirId()) {
      throw new ErreurResponsableFamilleDuplique('Un responsable avec le meme nom et le meme telephone existe deja dans la famille.');
    }
  }

  private nettoyerTexteObligatoire(valeur: string, nomChamp: string): string {
    if (typeof valeur !== 'string' || valeur.trim().length === 0) {
      throw new ErreurResponsablePrincipalInvalide(`Le champ ${nomChamp} du responsable est obligatoire.`);
    }

    return valeur.trim();
  }

  private nettoyerTexteOptionnel(valeur?: string): string | undefined {
    if (valeur === undefined) {
      return undefined;
    }

    const valeurNettoyee = valeur.trim();

    return valeurNettoyee.length === 0 ? undefined : valeurNettoyee;
  }

  private validerLienParente(lienParente: LienParente): LienParente {
    if (!Object.values(LienParente).includes(lienParente)) {
      throw new ErreurResponsablePrincipalInvalide('Le lien de parente du responsable est invalide.');
    }

    return lienParente;
  }
}
