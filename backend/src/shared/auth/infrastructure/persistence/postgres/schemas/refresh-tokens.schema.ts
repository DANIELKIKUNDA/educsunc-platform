// Ce schema decrit la table technique des refresh tokens persistants.
export const refreshTokensSchema = {
  table: 'auth_refresh_tokens',
  colonnes: ['id_refresh_token', 'id_utilisateur', 'token_hash', 'token_version_emise', 'revoque', 'revoque_le', 'cree_le', 'version'],
};
