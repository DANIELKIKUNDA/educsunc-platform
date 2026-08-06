import { randomUUID } from 'node:crypto';
import { RacineAgregat } from '../../../domain/AggregateRoot';
import { ContexteActifChange } from '../events/ContexteActifChange';
import { EcoleActiveSelectionnee } from '../events/EcoleActiveSelectionnee';
import { OrganisationActiveSelectionnee } from '../events/OrganisationActiveSelectionnee';
import { PolicyContexteActif } from '../policies/PolicyContexteActif';

export interface ProprietesContexteActifAuth {
  idContexteActifAuth: string;
  idUtilisateur: string;
  organisationActiveId?: string;
  ecoleActiveId?: string;
  dernierChangementLe?: Date;
  version: number;
}

// Cet agregat porte le contexte actif courant independamment de la session.
export class ContexteActifAuth extends RacineAgregat<string> {
  private idUtilisateur: string;
  private organisationActiveId?: string;
  private ecoleActiveId?: string;
  private dernierChangementLe?: Date;
  private version: number;

  constructor(proprietes: ProprietesContexteActifAuth) {
    super(ContexteActifAuth.validerTexte(proprietes.idContexteActifAuth, 'idContexteActifAuth'));
    this.idUtilisateur = ContexteActifAuth.validerTexte(proprietes.idUtilisateur, 'idUtilisateur');
    this.organisationActiveId = ContexteActifAuth.nettoyerOptionnel(proprietes.organisationActiveId);
    this.ecoleActiveId = ContexteActifAuth.nettoyerOptionnel(proprietes.ecoleActiveId);
    this.dernierChangementLe = ContexteActifAuth.clonerDateOptionnelle(proprietes.dernierChangementLe);
    this.version = ContexteActifAuth.validerVersion(proprietes.version);
    PolicyContexteActif.verifier({
      organisationActiveId: this.organisationActiveId,
      ecoleActiveId: this.ecoleActiveId,
    });
  }

  // Cette methode cree un contexte actif vide pour un utilisateur.
  public static creer(idUtilisateur: string): ContexteActifAuth {
    return new ContexteActifAuth({
      idContexteActifAuth: randomUUID(),
      idUtilisateur,
      version: 1,
    });
  }

  public obtenirIdUtilisateur(): string { return this.idUtilisateur; }
  public obtenirOrganisationActiveId(): string | undefined { return this.organisationActiveId; }
  public obtenirEcoleActiveId(): string | undefined { return this.ecoleActiveId; }
  public obtenirDernierChangementLe(): Date | undefined { return ContexteActifAuth.clonerDateOptionnelle(this.dernierChangementLe); }
  public obtenirVersion(): number { return this.version; }

  // Cette methode change l'organisation active portee par le contexte.
  public changerOrganisationActive(organisationActiveId?: string): void {
    const organisationPrecedente = this.organisationActiveId;
    this.organisationActiveId = ContexteActifAuth.nettoyerOptionnel(organisationActiveId);
    if (organisationPrecedente !== this.organisationActiveId) {
      this.ecoleActiveId = undefined;
    }
    this.marquerChangement();
    this.ajouterEvenement(new OrganisationActiveSelectionnee(this.obtenirId(), this.organisationActiveId));
    this.ajouterEvenement(new ContexteActifChange(this.obtenirId(), this.idUtilisateur));
  }

  // Cette methode change l'ecole active portee par le contexte.
  public changerEcoleActive(ecoleActiveId?: string, ecoleAppartientOrganisation = true): void {
    this.ecoleActiveId = ContexteActifAuth.nettoyerOptionnel(ecoleActiveId);
    PolicyContexteActif.verifier({
      organisationActiveId: this.organisationActiveId,
      ecoleActiveId: this.ecoleActiveId,
      ecoleAppartientOrganisation,
    });
    this.marquerChangement();
    this.ajouterEvenement(new EcoleActiveSelectionnee(this.obtenirId(), this.ecoleActiveId));
    this.ajouterEvenement(new ContexteActifChange(this.obtenirId(), this.idUtilisateur));
  }

  // Cette methode vide completement le contexte actif courant.
  public viderContexte(): void {
    this.organisationActiveId = undefined;
    this.ecoleActiveId = undefined;
    this.marquerChangement();
    this.ajouterEvenement(new ContexteActifChange(this.obtenirId(), this.idUtilisateur));
  }

  private marquerChangement(): void {
    this.dernierChangementLe = new Date();
    this.version += 1;
  }

  private static validerTexte(valeur: string, nomChamp: string): string {
    if (typeof valeur !== 'string' || valeur.trim().length === 0) {
      throw new Error(`Le champ ${nomChamp} est obligatoire.`);
    }
    return valeur.trim();
  }

  private static nettoyerOptionnel(valeur?: string): string | undefined {
    const propre = String(valeur || '').trim();
    return propre.length > 0 ? propre : undefined;
  }

  private static clonerDateOptionnelle(valeur?: Date): Date | undefined {
    return valeur ? new Date(valeur.getTime()) : undefined;
  }

  private static validerVersion(valeur: number): number {
    if (!Number.isInteger(valeur) || valeur <= 0) {
      throw new Error('La version du contexte actif doit etre un entier strictement positif.');
    }
    return valeur;
  }
}
