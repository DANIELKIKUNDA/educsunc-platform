// Ce DTO represente les donnees attendues pour renommer une classe pedagogique.
export interface RenommerClassePedagogiqueEntree {
  idClassePedagogique: string;
  nouveauLibelle: string;
  modifiePar: string;
}
