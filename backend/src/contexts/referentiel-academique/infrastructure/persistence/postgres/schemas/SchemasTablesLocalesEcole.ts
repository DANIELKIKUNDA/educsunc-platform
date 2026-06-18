import {
  DefinitionColonnePostgres,
  SchemaTablePostgres,
  creerSchemaTablePostgres,
} from './SchemaPostgres';

// Cette fonction cree la colonne d'identifiant primaire standard.
function creerColonneIdentifiant(commentaire: string): DefinitionColonnePostgres {
  return {
    nom: 'id',
    type: 'uuid',
    obligatoire: true,
    commentaire,
  };
}

// Cette fonction cree la colonne de version metier commune aux aggregates locaux.
function creerColonneVersionMetier(commentaire: string): DefinitionColonnePostgres {
  return {
    nom: 'version',
    type: 'integer',
    obligatoire: true,
    valeurParDefautSql: '1',
    commentaire,
  };
}

// Cette fonction cree les colonnes communes de creation.
function creerColonnesCreation(avecActeur = false): DefinitionColonnePostgres[] {
  const colonnes: DefinitionColonnePostgres[] = [
    {
      nom: 'cree_le',
      type: 'timestamptz',
      obligatoire: true,
      valeurParDefautSql: 'CURRENT_TIMESTAMP',
      commentaire: 'Date technique de creation.',
    },
  ];

  if (avecActeur) {
    colonnes.push({
      nom: 'cree_par',
      type: 'varchar',
      taille: 120,
      obligatoire: false,
      commentaire: "Acteur applicatif ayant cree l'enregistrement.",
    });
  }

  return colonnes;
}

// Cette fonction cree les colonnes communes de derniere modification.
function creerColonnesModification(avecActeur = false): DefinitionColonnePostgres[] {
  const colonnes: DefinitionColonnePostgres[] = [
    {
      nom: 'modifie_le',
      type: 'timestamptz',
      obligatoire: false,
      commentaire: 'Date technique de derniere modification.',
    },
  ];

  if (avecActeur) {
    colonnes.push({
      nom: 'modifie_par',
      type: 'varchar',
      taille: 120,
      obligatoire: false,
      commentaire: "Acteur applicatif ayant modifie l'enregistrement.",
    });
  }

  return colonnes;
}

// Ce schema decrit la table locale des annees scolaires d'une ecole.
export const schemaTableAnneesScolaires: SchemaTablePostgres = creerSchemaTablePostgres({
  nomTable: 'annees_scolaires',
  categorie: 'locale_ecole',
  description: 'Table locale des annees scolaires exploitees par une ecole.',
  strategieIsolationTenant: 'directe',
  colonneTenant: 'id_ecole',
  clePrimaire: ['id'],
  colonnes: [
    creerColonneIdentifiant("Identifiant technique de l'annee scolaire."),
    {
      nom: 'id_ecole',
      type: 'uuid',
      obligatoire: true,
      commentaire: "Ecole proprietaire de l'annee scolaire.",
    },
    {
      nom: 'code',
      type: 'varchar',
      taille: 80,
      obligatoire: true,
      commentaire: "Code fonctionnel stable de l'annee scolaire.",
    },
    {
      nom: 'libelle',
      type: 'varchar',
      taille: 255,
      obligatoire: true,
      commentaire: "Libelle de l'annee scolaire.",
    },
    {
      nom: 'date_debut',
      type: 'date',
      obligatoire: true,
      commentaire: "Date de debut de l'annee.",
    },
    {
      nom: 'date_fin',
      type: 'date',
      obligatoire: true,
      commentaire: "Date de fin de l'annee.",
    },
    {
      nom: 'statut',
      type: 'varchar',
      taille: 40,
      obligatoire: true,
      commentaire: "Statut courant de l'annee scolaire.",
    },
    {
      nom: 'active',
      type: 'boolean',
      obligatoire: true,
      valeurParDefautSql: 'false',
      commentaire: "Indique si l'annee scolaire est active.",
    },
    {
      nom: 'date_activation',
      type: 'timestamptz',
      obligatoire: false,
      commentaire: "Date d'activation de l'annee.",
    },
    {
      nom: 'date_cloture',
      type: 'timestamptz',
      obligatoire: false,
      commentaire: 'Date de cloture de l annee.',
    },
    {
      nom: 'date_archivage',
      type: 'timestamptz',
      obligatoire: false,
      commentaire: "Date d'archivage de l'annee.",
    },
    ...creerColonnesCreation(true),
    ...creerColonnesModification(true),
    creerColonneVersionMetier("Version metier de l'annee scolaire."),
  ],
  references: [
    {
      colonneLocale: 'id_ecole',
      tableReferencee: 'ecoles',
      colonneReferencee: 'id',
      actionSuppression: 'restrict',
      actionMiseAJour: 'cascade',
      commentaire: "Reference vers l'ecole proprietaire.",
    },
  ],
  index: [
    {
      nom: 'ux_annees_scolaires_ecole_code',
      colonnes: ['id_ecole', 'code'],
      unique: true,
      commentaire: "Garantit un code d'annee unique par ecole.",
    },
    {
      nom: 'ux_annees_scolaires_ecole_active',
      colonnes: ['id_ecole'],
      unique: true,
      conditionSql: 'active = true',
      commentaire: 'Garantit une seule annee active par ecole.',
    },
    {
      nom: 'ix_annees_scolaires_ecole_statut',
      colonnes: ['id_ecole', 'statut'],
      unique: false,
      commentaire: 'Accelere les lectures par ecole et statut.',
    },
  ],
});

// Ce schema decrit la table locale des classes pedagogiques d'une ecole.
export const schemaTableClassesPedagogiques: SchemaTablePostgres = creerSchemaTablePostgres({
  nomTable: 'classes_pedagogiques',
  categorie: 'locale_ecole',
  description: 'Table locale des classes pedagogiques ouvertes dans une ecole.',
  strategieIsolationTenant: 'directe',
  colonneTenant: 'id_ecole',
  clePrimaire: ['id'],
  colonnes: [
    creerColonneIdentifiant('Identifiant technique de la classe pedagogique.'),
    {
      nom: 'id_ecole',
      type: 'uuid',
      obligatoire: true,
      commentaire: 'Ecole proprietaire de la classe pedagogique.',
    },
    {
      nom: 'id_annee_scolaire',
      type: 'uuid',
      obligatoire: true,
      commentaire: 'Annee scolaire de rattachement.',
    },
    {
      nom: 'id_classe_academique',
      type: 'uuid',
      obligatoire: true,
      commentaire: 'Classe academique support.',
    },
    {
      nom: 'suffixe_parallele',
      type: 'varchar',
      taille: 20,
      obligatoire: false,
      commentaire: 'Suffixe de parallele si il existe.',
    },
    {
      nom: 'code',
      type: 'varchar',
      taille: 80,
      obligatoire: true,
      commentaire: 'Code local stable de la classe pedagogique.',
    },
    {
      nom: 'libelle',
      type: 'varchar',
      taille: 255,
      obligatoire: true,
      commentaire: 'Libelle exploitable de la classe pedagogique.',
    },
    {
      nom: 'capacite_accueil',
      type: 'integer',
      obligatoire: false,
      commentaire: "Capacite d'accueil declarative.",
    },
    {
      nom: 'active',
      type: 'boolean',
      obligatoire: true,
      valeurParDefautSql: 'true',
      commentaire: 'Indique si la classe pedagogique est active.',
    },
    {
      nom: 'archive_le',
      type: 'timestamptz',
      obligatoire: false,
      commentaire: "Date d'archivage de la classe pedagogique.",
    },
    ...creerColonnesCreation(),
    ...creerColonnesModification(),
    creerColonneVersionMetier('Version metier de la classe pedagogique.'),
  ],
  references: [
    {
      colonneLocale: 'id_ecole',
      tableReferencee: 'ecoles',
      colonneReferencee: 'id',
      actionSuppression: 'restrict',
      actionMiseAJour: 'cascade',
      commentaire: "Reference vers l'ecole proprietaire.",
    },
    {
      colonneLocale: 'id_annee_scolaire',
      tableReferencee: 'annees_scolaires',
      colonneReferencee: 'id',
      actionSuppression: 'restrict',
      actionMiseAJour: 'cascade',
      commentaire: "Reference vers l'annee scolaire.",
    },
    {
      colonneLocale: 'id_classe_academique',
      tableReferencee: 'classes_academiques',
      colonneReferencee: 'id',
      actionSuppression: 'restrict',
      actionMiseAJour: 'cascade',
      commentaire: 'Reference vers la classe academique source.',
    },
  ],
  index: [
    {
      nom: 'ux_classes_pedagogiques_contexte_code',
      colonnes: ['id_ecole', 'id_annee_scolaire', 'code'],
      unique: true,
      commentaire: 'Garantit un code unique par ecole et annee.',
    },
    {
      nom: 'ix_classes_pedagogiques_contexte',
      colonnes: ['id_ecole', 'id_annee_scolaire'],
      unique: false,
      commentaire: 'Accelere les lectures de classes pedagogiques par contexte.',
    },
    {
      nom: 'ix_classes_pedagogiques_archive_le',
      colonnes: ['archive_le'],
      unique: false,
      commentaire: 'Accelere les filtres sur les classes archivees.',
    },
  ],
});

// Ce schema decrit la table locale des responsabilites de classes pedagogiques.
export const schemaTableResponsabilitesClassesPedagogiques: SchemaTablePostgres =
  creerSchemaTablePostgres({
    nomTable: 'responsabilites_classes_pedagogiques',
    categorie: 'locale_ecole',
    description: 'Table locale des responsabilites officielles de classes pedagogiques.',
    strategieIsolationTenant: 'directe',
    colonneTenant: 'id_ecole',
    clePrimaire: ['id'],
    colonnes: [
      creerColonneIdentifiant('Identifiant technique de la responsabilite de classe pedagogique.'),
      {
        nom: 'id_organisation',
        type: 'uuid',
        obligatoire: true,
        commentaire: "Organisation de rattachement de l'ecole.",
      },
      {
        nom: 'id_ecole',
        type: 'uuid',
        obligatoire: true,
        commentaire: "Ecole proprietaire de la responsabilite.",
      },
      {
        nom: 'id_classe_pedagogique',
        type: 'uuid',
        obligatoire: true,
        commentaire: 'Classe pedagogique ciblee.',
      },
      {
        nom: 'id_classe_academique',
        type: 'uuid',
        obligatoire: true,
        commentaire: 'Classe academique support.',
      },
      {
        nom: 'id_section_scolaire',
        type: 'uuid',
        obligatoire: true,
        commentaire: 'Section scolaire support.',
      },
      {
        nom: 'id_annee_scolaire',
        type: 'uuid',
        obligatoire: true,
        commentaire: "Annee scolaire de rattachement.",
      },
      {
        nom: 'id_utilisateur_enseignant',
        type: 'varchar',
        taille: 120,
        obligatoire: true,
        commentaire: 'Utilisateur enseignant responsable de la classe.',
      },
      {
        nom: 'active',
        type: 'boolean',
        obligatoire: true,
        valeurParDefautSql: 'true',
        commentaire: 'Indique si la responsabilite est active.',
      },
      {
        nom: 'date_debut',
        type: 'timestamptz',
        obligatoire: true,
        commentaire: 'Date de debut de la responsabilite.',
      },
      {
        nom: 'date_fin',
        type: 'timestamptz',
        obligatoire: false,
        commentaire: 'Date de fin de la responsabilite si elle existe.',
      },
      ...creerColonnesCreation(true),
      creerColonneVersionMetier('Version metier de la responsabilite de classe pedagogique.'),
    ],
    references: [
      {
        colonneLocale: 'id_organisation',
        tableReferencee: 'organisations',
        colonneReferencee: 'id',
        actionSuppression: 'restrict',
        actionMiseAJour: 'cascade',
        commentaire: "Reference vers l'organisation porteuse.",
      },
      {
        colonneLocale: 'id_ecole',
        tableReferencee: 'ecoles',
        colonneReferencee: 'id',
        actionSuppression: 'restrict',
        actionMiseAJour: 'cascade',
        commentaire: "Reference vers l'ecole proprietaire.",
      },
      {
        colonneLocale: 'id_classe_pedagogique',
        tableReferencee: 'classes_pedagogiques',
        colonneReferencee: 'id',
        actionSuppression: 'restrict',
        actionMiseAJour: 'cascade',
        commentaire: 'Reference vers la classe pedagogique ciblee.',
      },
      {
        colonneLocale: 'id_classe_academique',
        tableReferencee: 'classes_academiques',
        colonneReferencee: 'id',
        actionSuppression: 'restrict',
        actionMiseAJour: 'cascade',
        commentaire: 'Reference vers la classe academique support.',
      },
      {
        colonneLocale: 'id_section_scolaire',
        tableReferencee: 'sections_scolaires',
        colonneReferencee: 'id',
        actionSuppression: 'restrict',
        actionMiseAJour: 'cascade',
        commentaire: 'Reference vers la section scolaire support.',
      },
      {
        colonneLocale: 'id_annee_scolaire',
        tableReferencee: 'annees_scolaires',
        colonneReferencee: 'id',
        actionSuppression: 'restrict',
        actionMiseAJour: 'cascade',
        commentaire: "Reference vers l'annee scolaire.",
      },
    ],
    index: [
      {
        nom: 'ux_responsabilites_classes_pedagogiques_active',
        colonnes: ['id_classe_pedagogique', 'id_annee_scolaire'],
        unique: true,
        conditionSql: 'active = true',
        commentaire: 'Garantit un seul responsable actif par classe pedagogique et annee.',
      },
      {
        nom: 'ix_responsabilites_classes_pedagogiques_enseignant',
        colonnes: ['id_utilisateur_enseignant'],
        unique: false,
        commentaire: 'Accelere les lectures par enseignant responsable.',
      },
      {
        nom: 'ix_responsabilites_classes_pedagogiques_ecole_annee',
        colonnes: ['id_ecole', 'id_annee_scolaire'],
        unique: false,
        commentaire: 'Accelere les lectures par ecole et annee.',
      },
    ],
  });

// Ce schema decrit la table locale des programmes de niveau exploites dans une ecole.
export const schemaTableProgrammesNiveau: SchemaTablePostgres = creerSchemaTablePostgres({
  nomTable: 'programmes_niveau',
  categorie: 'locale_ecole',
  description: 'Table locale des programmes de niveau appliques par ecole.',
  strategieIsolationTenant: 'directe',
  colonneTenant: 'id_ecole',
  clePrimaire: ['id'],
  colonnes: [
    creerColonneIdentifiant('Identifiant technique du programme niveau.'),
    {
      nom: 'id_ecole',
      type: 'uuid',
      obligatoire: true,
      commentaire: 'Ecole proprietaire du programme niveau.',
    },
    {
      nom: 'id_annee_scolaire',
      type: 'uuid',
      obligatoire: true,
      commentaire: 'Annee scolaire de rattachement.',
    },
    {
      nom: 'id_classe_academique',
      type: 'uuid',
      obligatoire: true,
      commentaire: 'Classe academique ciblee par le programme.',
    },
    {
      nom: 'id_referentiel_programme',
      type: 'uuid',
      obligatoire: true,
      commentaire: 'Referentiel programme source.',
    },
    {
      nom: 'id_version_referentiel_programme',
      type: 'uuid',
      obligatoire: true,
      commentaire: 'Version officielle appliquee localement.',
    },
    {
      nom: 'statut',
      type: 'varchar',
      taille: 40,
      obligatoire: true,
      commentaire: 'Statut courant du programme niveau.',
    },
    ...creerColonnesCreation(true),
    {
      nom: 'valide_le',
      type: 'timestamptz',
      obligatoire: false,
      commentaire: 'Date de validation du programme niveau.',
    },
    {
      nom: 'valide_par',
      type: 'varchar',
      taille: 120,
      obligatoire: false,
      commentaire: 'Acteur ayant valide le programme niveau.',
    },
    {
      nom: 'archive_le',
      type: 'timestamptz',
      obligatoire: false,
      commentaire: "Date d'archivage du programme niveau.",
    },
    creerColonneVersionMetier('Version metier du programme niveau.'),
  ],
  references: [
    {
      colonneLocale: 'id_ecole',
      tableReferencee: 'ecoles',
      colonneReferencee: 'id',
      actionSuppression: 'restrict',
      actionMiseAJour: 'cascade',
      commentaire: "Reference vers l'ecole proprietaire.",
    },
    {
      colonneLocale: 'id_annee_scolaire',
      tableReferencee: 'annees_scolaires',
      colonneReferencee: 'id',
      actionSuppression: 'restrict',
      actionMiseAJour: 'cascade',
      commentaire: "Reference vers l'annee scolaire.",
    },
    {
      colonneLocale: 'id_classe_academique',
      tableReferencee: 'classes_academiques',
      colonneReferencee: 'id',
      actionSuppression: 'restrict',
      actionMiseAJour: 'cascade',
      commentaire: 'Reference vers la classe academique ciblee.',
    },
    {
      colonneLocale: 'id_referentiel_programme',
      tableReferencee: 'referentiels_programmes',
      colonneReferencee: 'id',
      actionSuppression: 'restrict',
      actionMiseAJour: 'cascade',
      commentaire: 'Reference vers le referentiel programme source.',
    },
    {
      colonneLocale: 'id_version_referentiel_programme',
      tableReferencee: 'versions_referentiel_programme',
      colonneReferencee: 'id',
      actionSuppression: 'restrict',
      actionMiseAJour: 'cascade',
      commentaire: 'Reference vers la version officielle appliquee.',
    },
  ],
  index: [
    {
      nom: 'ix_programmes_niveau_contexte',
      colonnes: ['id_ecole', 'id_annee_scolaire'],
      unique: false,
      commentaire: 'Accelere les lectures par ecole et annee.',
    },
    {
      nom: 'ux_programmes_niveau_valide_contexte',
      colonnes: ['id_ecole', 'id_annee_scolaire', 'id_classe_academique'],
      unique: true,
      conditionSql: "statut = 'VALIDE'",
      commentaire: 'Garantit un seul programme valide par contexte local.',
    },
    {
      nom: 'ix_programmes_niveau_version_referentiel',
      colonnes: ['id_version_referentiel_programme'],
      unique: false,
      commentaire: 'Accelere les lectures par version appliquee.',
    },
  ],
});

// Ce schema decrit la table locale des lignes de programme niveau.
export const schemaTableLignesProgrammeNiveau: SchemaTablePostgres =
  creerSchemaTablePostgres({
    nomTable: 'lignes_programme_niveau',
    categorie: 'locale_ecole',
    description: "Table locale des lignes d'exploitation d'un programme niveau.",
    strategieIsolationTenant: 'par_parent',
    clePrimaire: ['id'],
    colonnes: [
      creerColonneIdentifiant('Identifiant technique de la ligne locale.'),
      {
        nom: 'id_programme_niveau',
        type: 'uuid',
        obligatoire: true,
        commentaire: 'Programme niveau parent de la ligne.',
      },
      {
        nom: 'id_referentiel_cours',
        type: 'uuid',
        obligatoire: true,
        commentaire: 'Cours officiel reference par la ligne locale.',
      },
      {
        nom: 'ordre_affichage',
        type: 'integer',
        obligatoire: true,
        commentaire: "Ordre d'affichage local de la ligne.",
      },
      {
        nom: 'obligatoire',
        type: 'boolean',
        obligatoire: true,
        commentaire: 'Indique si la ligne est obligatoire.',
      },
      {
        nom: 'a_examen',
        type: 'boolean',
        obligatoire: true,
        commentaire: 'Indique si la ligne comporte un examen.',
      },
      {
        nom: 'est_actif_dans_ecole',
        type: 'boolean',
        obligatoire: true,
        commentaire: 'Indique si le cours est actuellement actif dans ecole.',
      },
      {
        nom: 'est_calculable',
        type: 'boolean',
        obligatoire: true,
        commentaire: 'Indique si la ligne participe au calcul.',
      },
      {
        nom: 'obsolete',
        type: 'boolean',
        obligatoire: true,
        commentaire: 'Indique si la ligne locale est obsolete.',
      },
      {
        nom: 'source_ligne',
        type: 'varchar',
        taille: 80,
        obligatoire: true,
        commentaire: 'Source metier de la ligne locale.',
      },
      {
        nom: 'ponderation',
        type: 'jsonb',
        obligatoire: true,
        commentaire: 'Grille complete de ponderation locale.',
      },
    ],
    references: [
      {
        colonneLocale: 'id_programme_niveau',
        tableReferencee: 'programmes_niveau',
        colonneReferencee: 'id',
        actionSuppression: 'cascade',
        actionMiseAJour: 'cascade',
        commentaire: 'Reference vers le programme niveau parent.',
      },
      {
        colonneLocale: 'id_referentiel_cours',
        tableReferencee: 'referentiels_cours',
        colonneReferencee: 'id',
        actionSuppression: 'restrict',
        actionMiseAJour: 'cascade',
        commentaire: 'Reference vers le cours officiel.',
      },
    ],
    index: [
      {
        nom: 'ux_lignes_programme_niveau_programme_cours',
        colonnes: ['id_programme_niveau', 'id_referentiel_cours'],
        unique: true,
        commentaire: 'Garantit une seule ligne locale par cours et programme.',
      },
      {
        nom: 'ux_lignes_programme_niveau_programme_ordre',
        colonnes: ['id_programme_niveau', 'ordre_affichage'],
        unique: true,
        commentaire: 'Garantit un ordre unique par programme local.',
      },
    ],
  });

// Ce schema decrit la table locale des calendriers academiques.
export const schemaTableCalendriersAcademiques: SchemaTablePostgres =
  creerSchemaTablePostgres({
    nomTable: 'calendriers_academiques',
    categorie: 'locale_ecole',
    description: "Table locale des calendriers academiques d'une ecole.",
    strategieIsolationTenant: 'directe',
    colonneTenant: 'id_ecole',
    clePrimaire: ['id'],
    colonnes: [
      creerColonneIdentifiant('Identifiant technique du calendrier academique.'),
      {
        nom: 'id_ecole',
        type: 'uuid',
        obligatoire: true,
        commentaire: 'Ecole proprietaire du calendrier.',
      },
      {
        nom: 'id_annee_scolaire',
        type: 'uuid',
        obligatoire: true,
        commentaire: 'Annee scolaire portee par le calendrier.',
      },
      {
        nom: 'type_structure_evaluation',
        type: 'varchar',
        taille: 40,
        obligatoire: true,
        commentaire: "Structure logique d'evaluation du calendrier.",
      },
      {
        nom: 'date_debut_annee',
        type: 'date',
        obligatoire: true,
        commentaire: "Date de debut d'annee.",
      },
      {
        nom: 'date_fin_annee',
        type: 'date',
        obligatoire: true,
        commentaire: "Date de fin d'annee.",
      },
      {
        nom: 'verrouille',
        type: 'boolean',
        obligatoire: true,
        valeurParDefautSql: 'false',
        commentaire: 'Indique si le calendrier est verrouille.',
      },
      ...creerColonnesCreation(true),
      ...creerColonnesModification(true),
      creerColonneVersionMetier('Version metier du calendrier academique.'),
    ],
    references: [
      {
        colonneLocale: 'id_ecole',
        tableReferencee: 'ecoles',
        colonneReferencee: 'id',
        actionSuppression: 'restrict',
        actionMiseAJour: 'cascade',
        commentaire: "Reference vers l'ecole proprietaire.",
      },
      {
        colonneLocale: 'id_annee_scolaire',
        tableReferencee: 'annees_scolaires',
        colonneReferencee: 'id',
        actionSuppression: 'restrict',
        actionMiseAJour: 'cascade',
        commentaire: "Reference vers l'annee scolaire.",
      },
    ],
    index: [
      {
        nom: 'ux_calendriers_academiques_ecole_annee',
        colonnes: ['id_ecole', 'id_annee_scolaire'],
        unique: true,
        commentaire: 'Garantit un calendrier unique par ecole et annee.',
      },
      {
        nom: 'ix_calendriers_academiques_verrouille',
        colonnes: ['verrouille'],
        unique: false,
        commentaire: 'Accelere la recherche des calendriers verrouilles.',
      },
    ],
  });

// Ce schema decrit la table locale des periodes d'un calendrier academique.
export const schemaTablePeriodesCalendrier: SchemaTablePostgres =
  creerSchemaTablePostgres({
    nomTable: 'periodes_calendrier',
    categorie: 'locale_ecole',
    description: "Table locale des periodes rattachees a un calendrier academique.",
    strategieIsolationTenant: 'par_parent',
    clePrimaire: ['id'],
    colonnes: [
      creerColonneIdentifiant('Identifiant technique de la periode de calendrier.'),
      {
        nom: 'id_calendrier_academique',
        type: 'uuid',
        obligatoire: true,
        commentaire: 'Calendrier academique parent.',
      },
      {
        nom: 'code',
        type: 'varchar',
        taille: 30,
        obligatoire: true,
        commentaire: 'Code fonctionnel de la periode.',
      },
      {
        nom: 'libelle',
        type: 'varchar',
        taille: 255,
        obligatoire: true,
        commentaire: 'Libelle de la periode.',
      },
      {
        nom: 'ordre',
        type: 'integer',
        obligatoire: true,
        commentaire: "Ordre d'apparition de la periode.",
      },
      {
        nom: 'type_periode',
        type: 'varchar',
        taille: 40,
        obligatoire: true,
        commentaire: 'Type metier de la periode.',
      },
      {
        nom: 'date_debut',
        type: 'date',
        obligatoire: true,
        commentaire: 'Date de debut de la periode.',
      },
      {
        nom: 'date_fin',
        type: 'date',
        obligatoire: true,
        commentaire: 'Date de fin de la periode.',
      },
    ],
    references: [
      {
        colonneLocale: 'id_calendrier_academique',
        tableReferencee: 'calendriers_academiques',
        colonneReferencee: 'id',
        actionSuppression: 'cascade',
        actionMiseAJour: 'cascade',
        commentaire: 'Reference vers le calendrier academique parent.',
      },
    ],
    index: [
      {
        nom: 'ux_periodes_calendrier_calendrier_code',
        colonnes: ['id_calendrier_academique', 'code'],
        unique: true,
        commentaire: 'Garantit un code unique par calendrier.',
      },
      {
        nom: 'ux_periodes_calendrier_calendrier_ordre',
        colonnes: ['id_calendrier_academique', 'ordre'],
        unique: true,
        commentaire: 'Garantit un ordre unique par calendrier.',
      },
      {
        nom: 'ix_periodes_calendrier_bornes',
        colonnes: ['date_debut', 'date_fin'],
        unique: false,
        commentaire: 'Accelere les controles de chronologie.',
      },
    ],
  });

// Ce schema decrit la table locale des migrations de referentiel appliquees.
export const schemaTableMigrationsReferentielProgramme: SchemaTablePostgres =
  creerSchemaTablePostgres({
    nomTable: 'migrations_referentiel_programme',
    categorie: 'locale_ecole',
    description: 'Table locale des migrations de referentiel historisees.',
    strategieIsolationTenant: 'par_parent',
    clePrimaire: ['id'],
    colonnes: [
      creerColonneIdentifiant('Identifiant technique de la migration de referentiel.'),
      {
        nom: 'id_programme_niveau',
        type: 'uuid',
        obligatoire: true,
        commentaire: 'Programme niveau concerne par la migration.',
      },
      {
        nom: 'ancienne_version_referentiel',
        type: 'uuid',
        obligatoire: true,
        commentaire: 'Ancienne version officielle comparee.',
      },
      {
        nom: 'nouvelle_version_referentiel',
        type: 'uuid',
        obligatoire: true,
        commentaire: 'Nouvelle version officielle comparee.',
      },
      {
        nom: 'date_migration',
        type: 'timestamptz',
        obligatoire: true,
        commentaire: 'Date de creation ou lancement de la migration.',
      },
      {
        nom: 'declenche_par',
        type: 'varchar',
        taille: 120,
        obligatoire: false,
        commentaire: 'Acteur ayant declenche la migration.',
      },
      {
        nom: 'statut',
        type: 'varchar',
        taille: 40,
        obligatoire: true,
        commentaire: 'Statut courant de la migration.',
      },
      {
        nom: 'resume_diff',
        type: 'text',
        obligatoire: true,
        commentaire: 'Resume textuel des differences detectees.',
      },
      creerColonneVersionMetier('Version metier de la migration de referentiel.'),
    ],
    references: [
      {
        colonneLocale: 'id_programme_niveau',
        tableReferencee: 'programmes_niveau',
        colonneReferencee: 'id',
        actionSuppression: 'restrict',
        actionMiseAJour: 'cascade',
        commentaire: 'Reference vers le programme niveau concerne.',
      },
      {
        colonneLocale: 'ancienne_version_referentiel',
        tableReferencee: 'versions_referentiel_programme',
        colonneReferencee: 'id',
        actionSuppression: 'restrict',
        actionMiseAJour: 'cascade',
        commentaire: 'Reference vers ancienne version officielle.',
      },
      {
        colonneLocale: 'nouvelle_version_referentiel',
        tableReferencee: 'versions_referentiel_programme',
        colonneReferencee: 'id',
        actionSuppression: 'restrict',
        actionMiseAJour: 'cascade',
        commentaire: 'Reference vers nouvelle version officielle.',
      },
    ],
    index: [
      {
        nom: 'ix_migrations_referentiel_programme_programme',
        colonnes: ['id_programme_niveau'],
        unique: false,
        commentaire: 'Accelere les lectures de migrations par programme niveau.',
      },
      {
        nom: 'ix_migrations_referentiel_programme_statut',
        colonnes: ['statut'],
        unique: false,
        commentaire: 'Accelere les recherches par statut de migration.',
      },
    ],
  });

// Ce schema decrit la table locale des lignes de diff d'une migration.
export const schemaTableLignesDiffMigration: SchemaTablePostgres = creerSchemaTablePostgres({
  nomTable: 'lignes_diff_migration',
  categorie: 'locale_ecole',
  description: "Table locale des differences detectees lors d'une migration.",
  strategieIsolationTenant: 'par_parent',
  clePrimaire: ['id_migration_referentiel_programme', 'type_diff', 'code_cours'],
  colonnes: [
    {
      nom: 'id_migration_referentiel_programme',
      type: 'uuid',
      obligatoire: true,
      commentaire: 'Migration parente de la ligne de diff.',
    },
    {
      nom: 'type_diff',
      type: 'varchar',
      taille: 60,
      obligatoire: true,
      commentaire: 'Type metier de difference detectee.',
    },
    {
      nom: 'code_cours',
      type: 'varchar',
      taille: 80,
      obligatoire: true,
      commentaire: 'Code du cours concerne par la difference.',
    },
    {
      nom: 'ancienne_ponderation',
      type: 'jsonb',
      obligatoire: false,
      commentaire: 'Ancienne ponderation si pertinente.',
    },
    {
      nom: 'nouvelle_ponderation',
      type: 'jsonb',
      obligatoire: false,
      commentaire: 'Nouvelle ponderation si pertinente.',
    },
    {
      nom: 'ancien_ordre',
      type: 'integer',
      obligatoire: false,
      commentaire: 'Ancien ordre si pertinent.',
    },
    {
      nom: 'nouvel_ordre',
      type: 'integer',
      obligatoire: false,
      commentaire: 'Nouvel ordre si pertinent.',
    },
    {
      nom: 'commentaire',
      type: 'text',
      obligatoire: false,
      commentaire: 'Commentaire descriptif de la difference.',
    },
  ],
  references: [
    {
      colonneLocale: 'id_migration_referentiel_programme',
      tableReferencee: 'migrations_referentiel_programme',
      colonneReferencee: 'id',
      actionSuppression: 'cascade',
      actionMiseAJour: 'cascade',
      commentaire: 'Reference vers la migration parente.',
    },
  ],
  index: [
    {
      nom: 'ix_lignes_diff_migration_type',
      colonnes: ['type_diff'],
      unique: false,
      commentaire: 'Accelere les lectures de differences par type.',
    },
  ],
});

// Ce schema decrit la table locale des transformations de notes issues d'une migration.
export const schemaTableTransformationsNote: SchemaTablePostgres = creerSchemaTablePostgres({
  nomTable: 'transformations_note',
  categorie: 'locale_ecole',
  description: "Table locale des transformations de notes produites par une migration.",
  strategieIsolationTenant: 'par_parent',
  clePrimaire: ['id_migration_referentiel_programme', 'id_note'],
  colonnes: [
    {
      nom: 'id_migration_referentiel_programme',
      type: 'uuid',
      obligatoire: true,
      commentaire: 'Migration parente de la transformation.',
    },
    {
      nom: 'id_note',
      type: 'varchar',
      taille: 120,
      obligatoire: true,
      commentaire: 'Identifiant de la note transformee.',
    },
    {
      nom: 'ancienne_valeur',
      type: 'integer',
      obligatoire: true,
      commentaire: 'Ancienne valeur de la note.',
    },
    {
      nom: 'nouvelle_valeur',
      type: 'integer',
      obligatoire: true,
      commentaire: 'Nouvelle valeur de la note.',
    },
    {
      nom: 'ancien_maximum',
      type: 'integer',
      obligatoire: true,
      commentaire: 'Ancien maximum de reference.',
    },
    {
      nom: 'nouveau_maximum',
      type: 'integer',
      obligatoire: true,
      commentaire: 'Nouveau maximum de reference.',
    },
    {
      nom: 'regle_appliquee',
      type: 'text',
      obligatoire: true,
      commentaire: 'Regle textuelle appliquee a la transformation.',
    },
    {
      nom: 'date_transformation',
      type: 'timestamptz',
      obligatoire: true,
      commentaire: 'Date de transformation de la note.',
    },
  ],
  references: [
    {
      colonneLocale: 'id_migration_referentiel_programme',
      tableReferencee: 'migrations_referentiel_programme',
      colonneReferencee: 'id',
      actionSuppression: 'cascade',
      actionMiseAJour: 'cascade',
      commentaire: 'Reference vers la migration parente.',
    },
  ],
  index: [
    {
      nom: 'ix_transformations_note_date',
      colonnes: ['date_transformation'],
      unique: false,
      commentaire: 'Accelere les lectures chronologiques de transformations.',
    },
  ],
});

// Cette collection regroupe les tables locales ecole du BC decrites dans les documents.
export const schemasTablesLocalesEcoleReferentielAcademique: readonly SchemaTablePostgres[] = [
  schemaTableAnneesScolaires,
  schemaTableClassesPedagogiques,
  schemaTableResponsabilitesClassesPedagogiques,
  schemaTableProgrammesNiveau,
  schemaTableLignesProgrammeNiveau,
  schemaTableCalendriersAcademiques,
  schemaTablePeriodesCalendrier,
  schemaTableMigrationsReferentielProgramme,
  schemaTableLignesDiffMigration,
  schemaTableTransformationsNote,
];
