// Ce port relit la section scolaire effective d'une classe pedagogique pour les workflows analytiques.
export interface SectionClassePedagogiquePort {
  consulterSectionClasse(params: {
    idOrganisation?: string;
    idEcole: string;
    idClassePedagogique: string;
    idAnneeScolaire: string;
  }): Promise<{
    idSectionScolaire: string;
    sectionCode: string;
    sectionLibelle: string;
  } | null>;
}
