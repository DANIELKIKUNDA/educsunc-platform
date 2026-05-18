import { Entite } from '../../../../shared/domain/Entity';
import { ErreurValidationBulletinImpossible } from '../exceptions/ErreurValidationBulletinImpossible';
import { EtatValidationBulletin } from '../value-objects/EtatValidationBulletin';

// Cette entite represente la validation officielle d'un bulletin par une autorite.
export class ValidationBulletinOfficielle extends Entite<string> {
  private idBulletinEleve: string;
  private validePar: string;
  private roleValidateur: string;
  private dateValidation: Date;
  private etatValidation: EtatValidationBulletin;
  private commentaire?: string;
  private versionBulletin: number;

  // Ce constructeur fige une validation officielle de bulletin.
  constructor(params: {
    idValidationBulletinOfficielle: string;
    idBulletinEleve: string;
    validePar: string;
    roleValidateur: string;
    dateValidation: Date;
    etatValidation: EtatValidationBulletin;
    commentaire?: string;
    versionBulletin: number;
  }) {
    super(params.idValidationBulletinOfficielle);
    this.idBulletinEleve = params.idBulletinEleve;
    this.validePar = params.validePar;
    this.roleValidateur = params.roleValidateur;
    this.dateValidation = new Date(params.dateValidation.getTime());
    this.etatValidation = params.etatValidation;
    this.commentaire = params.commentaire;
    this.versionBulletin = params.versionBulletin;
    this.verifierCoherence();
  }

  public obtenirIdBulletinEleve(): string { return this.idBulletinEleve; }
  public obtenirValidePar(): string { return this.validePar; }
  public obtenirRoleValidateur(): string { return this.roleValidateur; }
  public obtenirDateValidation(): Date { return new Date(this.dateValidation.getTime()); }
  public obtenirEtatValidation(): EtatValidationBulletin { return this.etatValidation; }
  public obtenirCommentaire(): string | undefined { return this.commentaire; }
  public obtenirVersionBulletin(): number { return this.versionBulletin; }
  public estValidationAcceptee(): boolean { return this.etatValidation === EtatValidationBulletin.VALIDEE; }

  // Cette methode protege les regles de coherence de validation.
  private verifierCoherence(): void {
    const commentaireRenseigne = this.commentaire !== undefined && this.commentaire.trim().length > 0;

    if (this.etatValidation === EtatValidationBulletin.REFUSEE && !commentaireRenseigne) {
      throw new ErreurValidationBulletinImpossible('Un refus de validation exige un commentaire.');
    }

    if (this.etatValidation === EtatValidationBulletin.ANNULEE && !commentaireRenseigne) {
      throw new ErreurValidationBulletinImpossible("L'annulation d'une validation exige une justification.");
    }
  }
}
