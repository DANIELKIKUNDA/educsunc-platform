// Ce schema decrit la table technique des appareils connus utilisateur.
export const appareilsConnusSchema = {
  table: 'auth_appareils_connus',
  colonnes: ['id_appareil_connu', 'id_utilisateur', 'device_id', 'nom_appareil', 'dernier_acces_le', 'est_actif'],
};
