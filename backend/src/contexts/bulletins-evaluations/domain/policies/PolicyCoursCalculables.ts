// Cette policy rappelle que seuls les cours calculables alimentent les totaux et maximums generaux.
export class PolicyCoursCalculables {
  // Cette methode indique si un cours peut entrer dans les calculs generaux.
  public peutCalculer(estCalculable: boolean): boolean {
    return estCalculable;
  }
}
