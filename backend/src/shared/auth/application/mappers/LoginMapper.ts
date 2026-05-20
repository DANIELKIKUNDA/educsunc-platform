import { LoginInput } from '../dto/input';

// Ce mapper normalise le payload applicatif de login avant orchestration.
export class LoginMapper {
  public static versCommande(input: LoginInput): LoginInput {
    return {
      ...input,
      email: String(input.email || '').trim().toLowerCase(),
      motDePasse: String(input.motDePasse || ''),
      organisationActiveId: LoginMapper.nettoyerOptionnel(input.organisationActiveId),
      ecoleActiveId: LoginMapper.nettoyerOptionnel(input.ecoleActiveId),
      deviceId: LoginMapper.nettoyerOptionnel(input.deviceId),
      userAgent: LoginMapper.nettoyerOptionnel(input.userAgent),
      adresseIp: LoginMapper.nettoyerOptionnel(input.adresseIp),
      modeOffline: Boolean(input.modeOffline),
    };
  }

  private static nettoyerOptionnel(valeur?: string): string | undefined {
    const propre = String(valeur || '').trim();
    return propre.length > 0 ? propre : undefined;
  }
}
