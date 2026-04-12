import {
  DefinitionColonnePostgres,
  SchemaTablePostgres,
  creerSchemaTablePostgres,
} from './SchemaPostgres';

// Cette fonction cree la colonne d'identifiant primaire standard des tables du BC.
function creerColonneIdentifiant(commentaire: string): DefinitionColonnePostgres {
  return {
    nom: 'id',
    type: 'uuid',
    obligatoire: true,
    commentaire,
  };
}

// Cette fonction cree la colonne de version metier commune aux aggregates persistants.
function creerColonneVersionMetier(commentaire: string): DefinitionColonnePostgres {
  return {
    nom: 'version',
    type: 'integer',
    obligatoire: true,
    valeurParDefautSql: '1',
    commentaire,
  };
}

// Cette fonction cree les colonnes de creation communes.
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

// Cette fonction cree les colonnes de derniere modification communes.
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

// Ce schema decrit la table globale des organisations multi-ecoles.
export const schemaTableOrganisations: SchemaTablePostgres = creerSchemaTablePostgres({
  nomTable: 'organisations',
  categorie: 'globale',
  description: 'Table globale des organisations et coordinations.',
  strategieIsolationTenant: 'non_applicable',
  clePrimaire: ['id'],
  colonnes: [
    creerColonneIdentifiant("Identifiant technique de l'organisation."),
    {
      nom: 'code',
      type: 'varchar',
      taille: 80,
      obligatoire: true,
      commentaire: "Code fonctionnel stable de l'organisation.",
    },
    {
      nom: 'nom',
      type: 'varchar',
      taille: 255,
      obligatoire: true,
      commentaire: "Nom officiel de l'organisation.",
    },
    {
      nom: 'type_organisation',
      type: 'varchar',
      taille: 80,
      obligatoire: true,
      commentaire: "Type d'organisation issu du domaine.",
    },
    {
      nom: 'actif',
      type: 'boolean',
      obligatoire: true,
      valeurParDefautSql: 'true',
      commentaire: "Indique si l'organisation est active.",
    },
    {
      nom: 'description',
      type: 'text',
      obligatoire: false,
      commentaire: "Description libre de l'organisation.",
    },
    ...creerColonnesCreation(true),
    ...creerColonnesModification(true),
    creerColonneVersionMetier("Version metier de l'organisation."),
  ],
  references: [],
  index: [
    {
      nom: 'ux_organisations_code',
      colonnes: ['code'],
      unique: true,
      commentaire: "Garantit l'unicite du code organisation.",
    },
    {
      nom: 'ux_organisations_nom',
      colonnes: ['nom'],
      unique: true,
      commentaire: "Garantit l'unicite du nom organisation.",
    },
    {
      nom: 'ix_organisations_type_actif',
      colonnes: ['type_organisation', 'actif'],
      unique: false,
      commentaire: 'Accelere les lectures par type et etat.',
    },
  ],
});

// Ce schema decrit la table globale des ecoles.
export const schemaTableEcoles: SchemaTablePostgres = creerSchemaTablePostgres({
  nomTable: 'ecoles',
  categorie: 'globale',
  description: 'Table globale des ecoles rattachees ou autonomes.',
  strategieIsolationTenant: 'non_applicable',
  clePrimaire: ['id'],
  colonnes: [
    creerColonneIdentifiant("Identifiant technique de l'ecole."),
    {
      nom: 'id_organisation',
      type: 'uuid',
      obligatoire: false,
      commentaire: "Organisation de rattachement si l'ecole n'est pas autonome.",
    },
    {
      nom: 'code',
      type: 'varchar',
      taille: 80,
      obligatoire: true,
      commentaire: "Code fonctionnel stable de l'ecole.",
    },
    {
      nom: 'nom',
      type: 'varchar',
      taille: 255,
      obligatoire: true,
      commentaire: "Nom officiel de l'ecole.",
    },
    {
      nom: 'sigle',
      type: 'varchar',
      taille: 80,
      obligatoire: false,
      commentaire: "Sigle ou abreviation eventuelle de l'ecole.",
    },
    {
      nom: 'mode_exploitation',
      type: 'varchar',
      taille: 40,
      obligatoire: true,
      commentaire: "Mode d'exploitation hybride de l'ecole.",
    },
    {
      nom: 'actif',
      type: 'boolean',
      obligatoire: true,
      valeurParDefautSql: 'true',
      commentaire: "Indique si l'ecole est active.",
    },
    {
      nom: 'adresse',
      type: 'text',
      obligatoire: false,
      commentaire: "Adresse declarative de l'ecole.",
    },
    {
      nom: 'telephone',
      type: 'varchar',
      taille: 40,
      obligatoire: false,
      commentaire: "Telephone de contact de l'ecole.",
    },
    {
      nom: 'email',
      type: 'varchar',
      taille: 255,
      obligatoire: false,
      commentaire: "Adresse email institutionnelle de l'ecole.",
    },
    ...creerColonnesCreation(true),
    ...creerColonnesModification(true),
    creerColonneVersionMetier("Version metier de l'ecole."),
  ],
  references: [
    {
      colonneLocale: 'id_organisation',
      tableReferencee: 'organisations',
      colonneReferencee: 'id',
      actionSuppression: 'set_null',
      actionMiseAJour: 'cascade',
      commentaire: "Reference optionnelle vers l'organisation parente.",
    },
  ],
  index: [
    {
      nom: 'ux_ecoles_code',
      colonnes: ['code'],
      unique: true,
      commentaire: "Garantit l'unicite du code ecole.",
    },
    {
      nom: 'ix_ecoles_organisation',
      colonnes: ['id_organisation'],
      unique: false,
      commentaire: 'Accelere les lectures par organisation.',
    },
    {
      nom: 'ix_ecoles_mode_actif',
      colonnes: ['mode_exploitation', 'actif'],
      unique: false,
      commentaire: "Accelere les lectures par mode d'exploitation et etat.",
    },
  ],
});

// Ce schema decrit la table globale des sections scolaires officielles.
export const schemaTableSectionsScolaires: SchemaTablePostgres = creerSchemaTablePostgres({
  nomTable: 'sections_scolaires',
  categorie: 'globale',
  description: 'Table globale des sections scolaires officielles.',
  strategieIsolationTenant: 'non_applicable',
  clePrimaire: ['id'],
  colonnes: [
    creerColonneIdentifiant('Identifiant technique de la section scolaire.'),
    {
      nom: 'code',
      type: 'varchar',
      taille: 80,
      obligatoire: true,
      commentaire: 'Code stable de la section scolaire.',
    },
    {
      nom: 'libelle',
      type: 'varchar',
      taille: 255,
      obligatoire: true,
      commentaire: 'Libelle officiel de la section scolaire.',
    },
    {
      nom: 'ordre_affichage',
      type: 'integer',
      obligatoire: true,
      commentaire: "Ordre d'affichage de la section dans le referentiel.",
    },
    {
      nom: 'active',
      type: 'boolean',
      obligatoire: true,
      valeurParDefautSql: 'true',
      commentaire: 'Indique si la section est active.',
    },
    ...creerColonnesCreation(),
    ...creerColonnesModification(),
    creerColonneVersionMetier('Version metier de la section scolaire.'),
  ],
  references: [],
  index: [
    {
      nom: 'ux_sections_scolaires_code',
      colonnes: ['code'],
      unique: true,
      commentaire: "Garantit l'unicite du code section.",
    },
    {
      nom: 'ux_sections_scolaires_ordre_affichage',
      colonnes: ['ordre_affichage'],
      unique: true,
      commentaire: "Garantit l'unicite de l'ordre d'affichage.",
    },
    {
      nom: 'ix_sections_scolaires_active',
      colonnes: ['active'],
      unique: false,
      commentaire: 'Accelere la lecture des sections actives.',
    },
  ],
});

// Ce schema decrit la table globale des options d'etudes officielles.
export const schemaTableOptionsEtudes: SchemaTablePostgres = creerSchemaTablePostgres({
  nomTable: 'options_etudes',
  categorie: 'globale',
  description: "Table globale des options d'etudes et filieres officielles.",
  strategieIsolationTenant: 'non_applicable',
  clePrimaire: ['id'],
  colonnes: [
    creerColonneIdentifiant("Identifiant technique de l'option d'etude."),
    {
      nom: 'code',
      type: 'integer',
      obligatoire: true,
      commentaire: "Code officiel numeric de l'option d'etude.",
    },
    {
      nom: 'libelle',
      type: 'varchar',
      taille: 255,
      obligatoire: true,
      commentaire: "Libelle officiel de l'option d'etude.",
    },
    {
      nom: 'type_option',
      type: 'varchar',
      taille: 120,
      obligatoire: false,
      commentaire: "Type ou famille descriptive de l'option.",
    },
    {
      nom: 'abreviation',
      type: 'varchar',
      taille: 40,
      obligatoire: false,
      commentaire: "Abreviation officielle ou locale de l'option d'etude.",
    },
    {
      nom: 'ordre_affichage',
      type: 'integer',
      obligatoire: false,
      commentaire: "Ordre d'affichage de l'option.",
    },
    {
      nom: 'active',
      type: 'boolean',
      obligatoire: true,
      valeurParDefautSql: 'true',
      commentaire: "Indique si l'option est active.",
    },
    ...creerColonnesCreation(),
    ...creerColonnesModification(),
    creerColonneVersionMetier("Version metier de l'option."),
  ],
  references: [],
  index: [
    {
      nom: 'ux_options_etudes_code',
      colonnes: ['code'],
      unique: true,
      commentaire: "Garantit l'unicite du code option.",
    },
    {
      nom: 'ix_options_etudes_active',
      colonnes: ['active'],
      unique: false,
      commentaire: 'Accelere la lecture des options actives.',
    },
    {
      nom: 'ix_options_etudes_ordre_affichage',
      colonnes: ['ordre_affichage'],
      unique: false,
      commentaire: "Accelere le tri par ordre d'affichage.",
    },
  ],
});

// Ce schema decrit la table globale des classes academiques officielles.
export const schemaTableClassesAcademiques: SchemaTablePostgres = creerSchemaTablePostgres({
  nomTable: 'classes_academiques',
  categorie: 'globale',
  description: 'Table globale des classes academiques abstraites du referentiel.',
  strategieIsolationTenant: 'non_applicable',
  clePrimaire: ['id'],
  colonnes: [
    creerColonneIdentifiant('Identifiant technique de la classe academique.'),
    {
      nom: 'id_section_scolaire',
      type: 'uuid',
      obligatoire: true,
      commentaire: 'Section scolaire de rattachement.',
    },
    {
      nom: 'id_option_etude',
      type: 'uuid',
      obligatoire: false,
      commentaire: "Option d'etude associee si elle existe.",
    },
    {
      nom: 'code',
      type: 'varchar',
      taille: 80,
      obligatoire: true,
      commentaire: 'Code stable de la classe academique.',
    },
    {
      nom: 'libelle',
      type: 'varchar',
      taille: 255,
      obligatoire: true,
      commentaire: 'Libelle officiel de la classe academique.',
    },
    {
      nom: 'ordre_pedagogique',
      type: 'integer',
      obligatoire: true,
      commentaire: "Ordre pedagogique utilise pour trier le parcours scolaire.",
    },
    {
      nom: 'cycle',
      type: 'varchar',
      taille: 120,
      obligatoire: true,
      commentaire: 'Cycle de rattachement de la classe academique.',
    },
    {
      nom: 'accepte_options',
      type: 'boolean',
      obligatoire: true,
      valeurParDefautSql: 'false',
      commentaire: 'Indique si la classe accepte des options.',
    },
    {
      nom: 'option_obligatoire',
      type: 'boolean',
      obligatoire: true,
      valeurParDefautSql: 'false',
      commentaire: 'Indique si une option est obligatoire.',
    },
    {
      nom: 'type_structure_evaluation',
      type: 'varchar',
      taille: 40,
      obligatoire: true,
      commentaire: "Structure logique d'evaluation de la classe.",
    },
    {
      nom: 'active',
      type: 'boolean',
      obligatoire: true,
      valeurParDefautSql: 'true',
      commentaire: 'Indique si la classe academique est active.',
    },
    ...creerColonnesCreation(),
    ...creerColonnesModification(),
    creerColonneVersionMetier('Version metier de la classe academique.'),
  ],
  references: [
    {
      colonneLocale: 'id_section_scolaire',
      tableReferencee: 'sections_scolaires',
      colonneReferencee: 'id',
      actionSuppression: 'restrict',
      actionMiseAJour: 'cascade',
      commentaire: 'Reference vers la section scolaire parente.',
    },
    {
      colonneLocale: 'id_option_etude',
      tableReferencee: 'options_etudes',
      colonneReferencee: 'id',
      actionSuppression: 'set_null',
      actionMiseAJour: 'cascade',
      commentaire: "Reference optionnelle vers l'option d'etude.",
    },
  ],
  index: [
    {
      nom: 'ux_classes_academiques_code',
      colonnes: ['code'],
      unique: true,
      commentaire: "Garantit l'unicite du code de classe academique.",
    },
    {
      nom: 'ix_classes_academiques_section_ordre',
      colonnes: ['id_section_scolaire', 'ordre_pedagogique'],
      unique: false,
      commentaire: 'Accelere les lectures ordonnees par section.',
    },
    {
      nom: 'ix_classes_academiques_option',
      colonnes: ['id_option_etude'],
      unique: false,
      commentaire: 'Accelere les lectures par option.',
    },
  ],
});

// Ce schema decrit la table globale des cours officiels.
export const schemaTableReferentielsCours: SchemaTablePostgres = creerSchemaTablePostgres({
  nomTable: 'referentiels_cours',
  categorie: 'globale',
  description: 'Table globale du catalogue officiel des cours.',
  strategieIsolationTenant: 'non_applicable',
  clePrimaire: ['id'],
  colonnes: [
    creerColonneIdentifiant('Identifiant technique du cours officiel.'),
    {
      nom: 'code',
      type: 'varchar',
      taille: 80,
      obligatoire: true,
      commentaire: 'Code stable du cours officiel.',
    },
    {
      nom: 'libelle',
      type: 'varchar',
      taille: 255,
      obligatoire: true,
      commentaire: 'Libelle officiel du cours.',
    },
    {
      nom: 'abreviation',
      type: 'varchar',
      taille: 80,
      obligatoire: false,
      commentaire: 'Abreviation eventuelle du cours.',
    },
    {
      nom: 'domaine',
      type: 'varchar',
      taille: 120,
      obligatoire: false,
      commentaire: 'Domaine principal du cours.',
    },
    {
      nom: 'sous_domaine',
      type: 'varchar',
      taille: 120,
      obligatoire: false,
      commentaire: 'Sous-domaine eventuel du cours.',
    },
    {
      nom: 'actif',
      type: 'boolean',
      obligatoire: true,
      valeurParDefautSql: 'true',
      commentaire: 'Indique si le cours officiel est actif.',
    },
    ...creerColonnesCreation(),
    ...creerColonnesModification(),
    creerColonneVersionMetier('Version metier du cours officiel.'),
  ],
  references: [],
  index: [
    {
      nom: 'ux_referentiels_cours_code',
      colonnes: ['code'],
      unique: true,
      commentaire: "Garantit l'unicite du code cours.",
    },
    {
      nom: 'ix_referentiels_cours_domaine',
      colonnes: ['domaine', 'sous_domaine'],
      unique: false,
      commentaire: 'Accelere les lectures par domaine.',
    },
    {
      nom: 'ix_referentiels_cours_actif',
      colonnes: ['actif'],
      unique: false,
      commentaire: 'Accelere les lectures des cours actifs.',
    },
  ],
});

// Ce schema decrit la table globale des referentiels programmes.
export const schemaTableReferentielsProgrammes: SchemaTablePostgres = creerSchemaTablePostgres({
  nomTable: 'referentiels_programmes',
  categorie: 'globale',
  description: 'Table globale des referentiels programmes racines officiels.',
  strategieIsolationTenant: 'non_applicable',
  clePrimaire: ['id'],
  colonnes: [
    creerColonneIdentifiant('Identifiant technique du referentiel programme.'),
    {
      nom: 'id_classe_academique',
      type: 'uuid',
      obligatoire: true,
      commentaire: 'Classe academique ciblee par le referentiel.',
    },
    {
      nom: 'type_structure_evaluation',
      type: 'varchar',
      taille: 40,
      obligatoire: true,
      commentaire: "Structure logique d'evaluation du referentiel.",
    },
    {
      nom: 'actif',
      type: 'boolean',
      obligatoire: true,
      valeurParDefautSql: 'false',
      commentaire: 'Indique si le referentiel programme est actif.',
    },
    ...creerColonnesCreation(),
    creerColonneVersionMetier('Version metier du referentiel programme.'),
  ],
  references: [
    {
      colonneLocale: 'id_classe_academique',
      tableReferencee: 'classes_academiques',
      colonneReferencee: 'id',
      actionSuppression: 'restrict',
      actionMiseAJour: 'cascade',
      commentaire: 'Reference vers la classe academique ciblee.',
    },
  ],
  index: [
    {
      nom: 'ix_referentiels_programmes_classe_academique',
      colonnes: ['id_classe_academique'],
      unique: false,
      commentaire: 'Accelere les lectures des referentiels par classe academique.',
    },
  ],
});

// Ce schema decrit la table globale des versions officielles de referentiel programme.
export const schemaTableVersionsReferentielProgramme: SchemaTablePostgres =
  creerSchemaTablePostgres({
    nomTable: 'versions_referentiel_programme',
    categorie: 'globale',
    description: 'Table globale des publications de versions officielles.',
    strategieIsolationTenant: 'non_applicable',
    clePrimaire: ['id'],
    colonnes: [
      creerColonneIdentifiant('Identifiant technique de la version officielle.'),
      {
        nom: 'id_referentiel_programme',
        type: 'uuid',
        obligatoire: true,
        commentaire: 'Referentiel programme auquel appartient la version.',
      },
      {
        nom: 'code_version',
        type: 'varchar',
        taille: 80,
        obligatoire: true,
        commentaire: 'Code stable de la version officielle.',
      },
      {
        nom: 'annee_reference',
        type: 'varchar',
        taille: 20,
        obligatoire: true,
        commentaire: 'Annee de reference de la version.',
      },
      {
        nom: 'date_publication',
        type: 'date',
        obligatoire: true,
        commentaire: 'Date officielle de publication.',
      },
      {
        nom: 'motif_publication',
        type: 'text',
        obligatoire: false,
        commentaire: 'Motif de publication si renseigne.',
      },
      {
        nom: 'active',
        type: 'boolean',
        obligatoire: true,
        valeurParDefautSql: 'false',
        commentaire: 'Indique si la version est active.',
      },
      {
        nom: 'publiee',
        type: 'boolean',
        obligatoire: true,
        valeurParDefautSql: 'false',
        commentaire: 'Indique si la version a ete publiee et verrouillee metierement.',
      },
      {
        nom: 'source_import',
        type: 'varchar',
        taille: 60,
        obligatoire: true,
        commentaire: "Source d'import ou d'origine de la version.",
      },
      ...creerColonnesCreation(),
    ],
    references: [
      {
        colonneLocale: 'id_referentiel_programme',
        tableReferencee: 'referentiels_programmes',
        colonneReferencee: 'id',
        actionSuppression: 'restrict',
        actionMiseAJour: 'cascade',
        commentaire: 'Reference vers le referentiel programme parent.',
      },
    ],
    index: [
      {
        nom: 'ux_versions_referentiel_programme_referentiel_code_version',
        colonnes: ['id_referentiel_programme', 'code_version'],
        unique: true,
        commentaire: "Garantit l'unicite du code de version a l'interieur d'un referentiel.",
      },
      {
        nom: 'ix_versions_referentiel_programme_referentiel',
        colonnes: ['id_referentiel_programme'],
        unique: false,
        commentaire: 'Accelere les lectures des versions par referentiel.',
      },
      {
        nom: 'ix_versions_referentiel_programme_active',
        colonnes: ['active'],
        unique: false,
        commentaire: 'Accelere la recherche de version active.',
      },
      {
        nom: 'ix_versions_referentiel_programme_publiee',
        colonnes: ['publiee'],
        unique: false,
        commentaire: 'Accelere la lecture des versions publiees.',
      },
      {
        nom: 'ix_versions_referentiel_programme_annee_reference',
        colonnes: ['annee_reference'],
        unique: false,
        commentaire: 'Accelere les lectures par annee de reference.',
      },
    ],
  });

// Ce schema decrit la table globale des lignes officielles de referentiel programme.
export const schemaTableLignesReferentielProgramme: SchemaTablePostgres =
  creerSchemaTablePostgres({
    nomTable: 'lignes_referentiel_programme',
    categorie: 'globale',
    description: 'Table globale des lignes officielles d une version de programme.',
    strategieIsolationTenant: 'non_applicable',
    clePrimaire: ['id'],
    colonnes: [
      creerColonneIdentifiant('Identifiant technique de la ligne officielle.'),
      {
        nom: 'id_version_referentiel_programme',
        type: 'uuid',
        obligatoire: true,
        commentaire: 'Version officielle portant la ligne.',
      },
      {
        nom: 'id_referentiel_cours',
        type: 'uuid',
        obligatoire: true,
        commentaire: 'Cours officiel reference par la ligne.',
      },
      {
        nom: 'ordre_affichage',
        type: 'integer',
        obligatoire: true,
        commentaire: "Ordre d'affichage officiel de la ligne.",
      },
      {
        nom: 'obligatoire',
        type: 'boolean',
        obligatoire: true,
        commentaire: 'Indique si le cours est obligatoire.',
      },
      {
        nom: 'a_examen',
        type: 'boolean',
        obligatoire: true,
        commentaire: 'Indique si la ligne comporte un examen.',
      },
      {
        nom: 'est_calculable',
        type: 'boolean',
        obligatoire: true,
        commentaire: 'Indique si la ligne participe au calcul.',
      },
      {
        nom: 'source_ligne',
        type: 'varchar',
        taille: 80,
        obligatoire: true,
        commentaire: 'Source metier de la ligne de programme.',
      },
      {
        nom: 'ponderation',
        type: 'jsonb',
        obligatoire: true,
        commentaire: 'Grille complete de ponderation de la ligne.',
      },
    ],
    references: [
      {
        colonneLocale: 'id_version_referentiel_programme',
        tableReferencee: 'versions_referentiel_programme',
        colonneReferencee: 'id',
        actionSuppression: 'cascade',
        actionMiseAJour: 'cascade',
        commentaire: 'Reference vers la version officielle parente.',
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
        nom: 'ux_lignes_referentiel_programme_version_cours',
        colonnes: ['id_version_referentiel_programme', 'id_referentiel_cours'],
        unique: true,
        commentaire: 'Garantit une seule ligne officielle par cours et version.',
      },
      {
        nom: 'ux_lignes_referentiel_programme_version_ordre',
        colonnes: ['id_version_referentiel_programme', 'ordre_affichage'],
        unique: true,
        commentaire: 'Garantit un ordre unique par version officielle.',
      },
    ],
  });

// Cette collection regroupe les tables globales du BC decrites dans les documents.
export const schemasTablesGlobalesReferentielAcademique: readonly SchemaTablePostgres[] = [
  schemaTableOrganisations,
  schemaTableEcoles,
  schemaTableSectionsScolaires,
  schemaTableOptionsEtudes,
  schemaTableClassesAcademiques,
  schemaTableReferentielsCours,
  schemaTableReferentielsProgrammes,
  schemaTableVersionsReferentielProgramme,
  schemaTableLignesReferentielProgramme,
];
