interface ResponsabiliteClassePedagogiqueProjection {
  idOrganisation: string;
  idEcole: string;
  idClassePedagogique: string;
  idAnneeScolaire: string;
  idUtilisateurEnseignant: string;
  sectionCode: string;
  sectionLibelle: string;
  active: boolean;
}

// Cette policy determine si une responsabilite de classe ouvre le titulariat effectif selon la section.
export class PolicyTitulariatEffectifParSection {
  public static estSectionAutoTitulariat(sectionCode: string, sectionLibelle: string): boolean {
    const code = sectionCode.trim().toUpperCase();
    const libelle = sectionLibelle.trim().toUpperCase();

    return code.includes('MATERNEL') || code.includes('PRIMAIRE')
      || libelle.includes('MATERNELLE') || libelle.includes('PRIMAIRE');
  }

  public static estTitulariatEffectif(params: {
    responsabiliteClassePedagogique: ResponsabiliteClassePedagogiqueProjection | null;
    idUtilisateur: string;
    idOrganisation?: string;
    idEcole?: string;
    idClasse: string;
    idAnneeScolaire: string;
  }): boolean {
    const responsabilite = params.responsabiliteClassePedagogique;

    if (responsabilite === null || !responsabilite.active) {
      return false;
    }

    if (responsabilite.idUtilisateurEnseignant !== params.idUtilisateur) {
      return false;
    }

    if (responsabilite.idClassePedagogique !== params.idClasse) {
      return false;
    }

    if (responsabilite.idAnneeScolaire !== params.idAnneeScolaire) {
      return false;
    }

    if (params.idOrganisation && responsabilite.idOrganisation !== params.idOrganisation) {
      return false;
    }

    if (params.idEcole && responsabilite.idEcole !== params.idEcole) {
      return false;
    }

    return this.estSectionAutoTitulariat(
      responsabilite.sectionCode,
      responsabilite.sectionLibelle,
    );
  }
}
