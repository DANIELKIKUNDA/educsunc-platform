// Ce schema decrit la table technique des tentatives de connexion.
export const tentativesConnexionSchema = {
  table: 'auth_tentatives_connexion',
  colonnes: ['id_tentative_connexion', 'email', 'adresse_ip', 'user_agent', 'reussie', 'raison_echec', 'date_tentative'],
};
