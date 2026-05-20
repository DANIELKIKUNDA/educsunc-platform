// Ce schema decrit la table technique des utilisateurs auth.
export const utilisateursAuthSchema = {
  table: 'auth_utilisateurs',
  colonnes: ['id_utilisateur', 'nom_complet', 'email', 'telephone', 'mot_de_passe_hash', 'etat_compte', 'token_version', 'dernier_acces_le', 'dernier_login_le', 'nombre_tentatives_connexion', 'compte_verrouille_jusqua', 'auth_offline_autorisee', 'cree_le', 'modifie_le', 'version', 'supprime_logiquement'],
};
