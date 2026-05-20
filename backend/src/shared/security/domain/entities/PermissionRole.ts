import { randomUUID } from 'node:crypto';
import { Entite } from '../../../domain/Entity';
import { PermissionSecurite } from '../value-objects/PermissionSecurite';

export interface ProprietesPermissionRole {
  idPermissionRole: string;
  permission: PermissionSecurite;
  creeLe: Date;
  creePar?: string;
}

// Cette entite associe une permission unique a un role.
export class PermissionRole extends Entite<string> {
  private permission: PermissionSecurite;
  private creeLe: Date;
  private creePar?: string;

  constructor(proprietes: ProprietesPermissionRole) {
    super(PermissionRole.validerTexte(proprietes.idPermissionRole, 'idPermissionRole'));
    this.permission = proprietes.permission;
    this.creeLe = PermissionRole.validerDate(proprietes.creeLe);
    this.creePar = PermissionRole.nettoyerOptionnel(proprietes.creePar);
  }

  public static creer(permission: PermissionSecurite, creePar?: string): PermissionRole {
    return new PermissionRole({
      idPermissionRole: randomUUID(),
      permission,
      creeLe: new Date(),
      creePar,
    });
  }

  public obtenirPermission(): PermissionSecurite {
    return this.permission;
  }

  public obtenirCreeLe(): Date {
    return new Date(this.creeLe.getTime());
  }

  public obtenirCreePar(): string | undefined {
    return this.creePar;
  }

  private static validerTexte(valeur: string, nomChamp: string): string {
    if (typeof valeur !== 'string' || valeur.trim() === '') {
      throw new Error(`Le champ ${nomChamp} est obligatoire.`);
    }
    return valeur.trim();
  }

  private static nettoyerOptionnel(valeur?: string): string | undefined {
    const propre = String(valeur || '').trim();
    return propre === '' ? undefined : propre;
  }

  private static validerDate(valeur: Date): Date {
    if (!(valeur instanceof Date) || Number.isNaN(valeur.getTime())) {
      throw new Error('La date de creation est invalide.');
    }
    return new Date(valeur.getTime());
  }
}
