import { Entite } from '../../../../shared/domain/Entity';
import { ErreurResultatBulletinIncoherent } from '../exceptions/ErreurResultatBulletinIncoherent';

// Cette entite porte les seuils et limites configurables de l'analyse pedagogique.
export class CriteresAnalysePedagogique extends Entite<string> {
  private seuilReussite: number;
  private seuilEchec: number;
  private seuilEchecLeger: number;
  private seuilEchecProfond: number;
  private seuilPerequation: number;
  private seuilRepechage: number;

  constructor(params: {
    idCriteresAnalysePedagogique: string;
    seuilReussite: number;
    seuilEchec: number;
    seuilEchecLeger: number;
    seuilEchecProfond: number;
    seuilPerequation: number;
    seuilRepechage: number;
  }) {
    super(params.idCriteresAnalysePedagogique);
    this.seuilReussite = params.seuilReussite;
    this.seuilEchec = params.seuilEchec;
    this.seuilEchecLeger = params.seuilEchecLeger;
    this.seuilEchecProfond = params.seuilEchecProfond;
    this.seuilPerequation = params.seuilPerequation;
    this.seuilRepechage = params.seuilRepechage;
    this.verifierCoherence();
  }

  public static parDefaut(): CriteresAnalysePedagogique {
    return new CriteresAnalysePedagogique({
      idCriteresAnalysePedagogique: 'criteres-pedagogiques-defaut',
      seuilReussite: 50,
      seuilEchec: 50,
      seuilEchecLeger: 25,
      seuilEchecProfond: 25,
      seuilPerequation: 2,
      seuilRepechage: 2,
    });
  }

  public obtenirSeuilReussite(): number { return this.seuilReussite; }
  public obtenirSeuilEchec(): number { return this.seuilEchec; }
  public obtenirSeuilEchecLeger(): number { return this.seuilEchecLeger; }
  public obtenirSeuilEchecProfond(): number { return this.seuilEchecProfond; }
  public obtenirSeuilPerequation(): number { return this.seuilPerequation; }
  public obtenirSeuilRepechage(): number { return this.seuilRepechage; }

  private verifierCoherence(): void {
    const seuilsPourcentage = [
      this.seuilReussite,
      this.seuilEchec,
      this.seuilEchecLeger,
      this.seuilEchecProfond,
    ];

    if (seuilsPourcentage.some((seuil) => !Number.isFinite(seuil) || seuil < 0 || seuil > 100)) {
      throw new ErreurResultatBulletinIncoherent('Les seuils pedagogiques de pourcentage doivent rester compris entre 0 et 100.');
    }

    if (!Number.isInteger(this.seuilPerequation) || this.seuilPerequation < 0) {
      throw new ErreurResultatBulletinIncoherent('Le seuil de perequation doit etre un entier naturel.');
    }

    if (!Number.isInteger(this.seuilRepechage) || this.seuilRepechage < 0) {
      throw new ErreurResultatBulletinIncoherent('Le seuil de repechage doit etre un entier naturel.');
    }

    if (this.seuilEchecProfond > this.seuilEchecLeger || this.seuilEchecLeger > this.seuilEchec) {
      throw new ErreurResultatBulletinIncoherent('Les seuils d echec pedagogique sont incoherents.');
    }
  }
}
