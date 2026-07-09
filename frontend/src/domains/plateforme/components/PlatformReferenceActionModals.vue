<template>
  <PlatformReferenceModal
    id="reference-import"
    :open="vm.modalState === 'import'"
    eyebrow="Import"
    title="Importer un referentiel officiel"
    description="Suivez les etapes pour preparer, verifier et confirmer un import officiel en toute securite."
    @close="vm.closeModal"
  >
    <div class="reference-import">
      <div class="reference-import__steps" role="tablist" aria-label="Etapes de l import officiel">
        <button
          v-for="step in vm.importSteps"
          :key="step.index"
          class="reference-import__step"
          :class="{
            'reference-import__step--active': vm.importWizardStep === step.index,
            'reference-import__step--complete': vm.importWizardStep > step.index,
          }"
          type="button"
          @click="vm.goToImportStep(step.index)"
        >
          <span class="reference-import__step-icon">
            <component :is="step.icon" :size="16" aria-hidden="true" />
          </span>
          <span class="reference-import__step-copy">
            <small>Etape {{ step.index }}</small>
            <strong>{{ step.label }}</strong>
          </span>
        </button>
      </div>

      <div v-if="vm.importWizardStep === 1" class="reference-import__stage">
        <div class="reference-import__stage-head">
          <div>
            <small>Etape 1</small>
            <strong>Choisir la composante officielle</strong>
            <p>
              Selectionnez la famille de donnees a traiter. Les composantes proviennent du centre officiel deja disponible.
            </p>
          </div>
        </div>

        <div class="reference-import__cards">
          <button
            v-for="definition in vm.importDefinitions"
            :key="definition.code"
            class="reference-import__choice"
            :class="{ 'reference-import__choice--active': vm.importForm.typeImport === definition.code }"
            type="button"
            @click="vm.changerTypeImport(definition.code)"
          >
            <strong>{{ definition.label }}</strong>
            <p>{{ definition.description }}</p>
            <span>{{ definition.neutralHint }}</span>
          </button>
        </div>
      </div>

      <div v-else-if="vm.importWizardStep === 2" class="reference-import__stage">
        <div class="reference-import__stage-head">
          <div>
            <small>Etape 2</small>
            <strong>Obtenir le modele officiel</strong>
            <p>Utilisez le modele officiel pour preparer vos donnees avant l import.</p>
          </div>
        </div>

        <div class="reference-import__grid">
          <article class="reference-import__panel">
            <small>Composante selectionnee</small>
            <strong>{{ vm.selectedImportDefinition.label }}</strong>
            <p>{{ vm.selectedImportDefinition.description }}</p>
          </article>
          <article class="reference-import__panel">
            <small>Format attendu</small>
            <strong>JSON</strong>
            <p>{{ vm.selectedImportDefinition.neutralHint }}</p>
          </article>
        </div>

        <div class="reference-import__actions">
          <button class="reference-center__ghost-button" type="button" @click="vm.downloadImportModel">
            Telecharger le modele
          </button>
          <button class="reference-center__ghost-button" type="button" @click="vm.useImportExample">
            Voir un exemple
          </button>
        </div>

        <article class="reference-import__code-shell">
          <div class="reference-import__code-head">
            <strong>{{ vm.importExampleTitle }}</strong>
            <small>Le contenu peut ensuite etre adapte avant la validation.</small>
          </div>
          <pre>{{ vm.importModelJson }}</pre>
        </article>
      </div>

      <div v-else-if="vm.importWizardStep === 3" class="reference-import__stage">
        <div class="reference-import__stage-head">
          <div>
            <small>Etape 3</small>
            <strong>Fournir les donnees</strong>
            <p>Collez le JSON officiel ou chargez directement un fichier <code>.json</code>.</p>
          </div>
        </div>

        <div class="reference-import__mode-switch">
          <button
            class="reference-import__mode-pill"
            :class="{ 'reference-import__mode-pill--active': vm.importSourceMode === 'paste' }"
            type="button"
            @click="vm.importSourceMode = 'paste'"
          >
            Coller le JSON
          </button>
          <button
            class="reference-import__mode-pill"
            :class="{ 'reference-import__mode-pill--active': vm.importSourceMode === 'file' }"
            type="button"
            @click="vm.importSourceMode = 'file'"
          >
            Charger un fichier .json
          </button>
        </div>

        <div class="reference-import__grid">
          <label v-if="vm.importSourceMode === 'file'" class="reference-import__dropzone">
            <input type="file" accept=".json,application/json" @change="vm.handleImportFileSelection" />
            <strong>Deposer ou choisir un fichier JSON</strong>
            <span>
              {{ vm.importFileName || 'Aucun fichier selectionne pour le moment.' }}
            </span>
          </label>

          <label class="reference-center__field reference-center__field--full">
            <span>Contenu a verifier</span>
            <textarea
              v-model="vm.importForm.rawJson"
              class="reference-import__textarea"
              rows="18"
              placeholder="Collez ici le contenu JSON officiel a importer."
            />
          </label>
        </div>
      </div>

      <div v-else-if="vm.importWizardStep === 4" class="reference-import__stage">
        <div class="reference-import__stage-head">
          <div>
            <small>Etape 4</small>
            <strong>Validation automatique</strong>
            <p>Le contenu est controle avant toute operation critique.</p>
          </div>
          <button
            class="reference-center__primary-button"
            type="button"
            :disabled="vm.importValidationStatus === 'loading' || !vm.importForm.rawJson.trim()"
            @click="vm.validateImportPayload"
          >
            {{ vm.importValidationStatus === 'loading' ? 'Validation...' : 'Lancer la validation' }}
          </button>
        </div>

        <div v-if="vm.importValidationStatus === 'idle'" class="reference-import__empty">
          <strong>Validation en attente</strong>
          <p>Le contenu fourni sera analyse ici avant l apercu final.</p>
        </div>

        <div v-else-if="vm.importValidationStatus === 'loading'" class="reference-import__loading">
          <div class="reference-import__loading-bar" />
          <div class="reference-import__loading-bar reference-import__loading-bar--short" />
          <div class="reference-import__loading-grid">
            <div class="reference-import__loading-card" />
            <div class="reference-import__loading-card" />
            <div class="reference-import__loading-card" />
          </div>
        </div>

        <div v-else class="reference-import__stage-stack">
          <div class="reference-import__status-card" :class="{
            'reference-import__status-card--success': vm.importValidation?.estValide,
            'reference-import__status-card--danger': !vm.importValidation?.estValide,
          }">
            <strong>
              {{ vm.importValidation?.estValide ? 'JSON valide et structure reconnue' : 'Des corrections sont necessaires avant import' }}
            </strong>
            <p>
              {{
                vm.importValidation?.estValide
                  ? 'Le contenu peut passer a l apercu avant confirmation.'
                  : 'Le contenu reste bloque tant que les erreurs detectees ne sont pas corrigees.'
              }}
            </p>
          </div>

          <div class="reference-import__preview-grid">
            <article class="reference-import__metric">
              <small>Structure</small>
              <strong>{{ vm.importValidation?.structureReconnaissable ? 'Reconnaissable' : 'Non reconnue' }}</strong>
            </article>
            <article class="reference-import__metric">
              <small>Elements detectes</small>
              <strong>{{ vm.importValidation?.elementsDetectes ?? 0 }}</strong>
            </article>
            <article class="reference-import__metric">
              <small>Erreurs bloquantes</small>
              <strong>{{ vm.importValidationPreview?.erreursBloquantes ?? 0 }}</strong>
            </article>
            <article class="reference-import__metric">
              <small>Avertissements</small>
              <strong>{{ vm.importValidationPreview?.avertissements ?? 0 }}</strong>
            </article>
          </div>

          <div class="reference-import__issues">
            <article
              v-for="issue in vm.importValidationIssues"
              :key="`${issue.niveau}-${issue.message}`"
              class="reference-import__issue"
              :class="{
                'reference-import__issue--danger': issue.niveau === 'erreur',
                'reference-import__issue--warning': issue.niveau === 'avertissement',
              }"
            >
              <strong>{{ issue.niveau === 'erreur' ? 'Erreur' : 'Avertissement' }}</strong>
              <p>{{ issue.message }}</p>
            </article>
          </div>
        </div>
      </div>

      <div v-else-if="vm.importWizardStep === 5" class="reference-import__stage">
        <div class="reference-import__stage-head">
          <div>
            <small>Etape 5</small>
            <strong>Apercu de l import</strong>
            <p>Relisez les informations disponibles avant de confirmer l operation.</p>
          </div>
        </div>

        <div class="reference-import__preview-grid">
          <article class="reference-import__metric">
            <small>Elements detectes</small>
            <strong>{{ vm.importValidationPreview?.elementsDetectes ?? 0 }}</strong>
          </article>
          <article class="reference-import__metric">
            <small>Elements a creer</small>
            <strong>{{ vm.importValidationPreview?.elementsACreer ?? 'A confirmer' }}</strong>
          </article>
          <article class="reference-import__metric">
            <small>Elements a mettre a jour</small>
            <strong>{{ vm.importValidationPreview?.elementsAMettreAJour ?? 'Non detaille' }}</strong>
          </article>
          <article class="reference-import__metric">
            <small>Elements ignores</small>
            <strong>{{ vm.importValidationPreview?.elementsIgnores ?? 'A confirmer' }}</strong>
          </article>
          <article class="reference-import__metric">
            <small>Erreurs bloquantes</small>
            <strong>{{ vm.importValidationPreview?.erreursBloquantes ?? 0 }}</strong>
          </article>
          <article class="reference-import__metric">
            <small>Avertissements</small>
            <strong>{{ vm.importValidationPreview?.avertissements ?? 0 }}</strong>
          </article>
        </div>
      </div>

      <div v-else-if="vm.importWizardStep === 6" class="reference-import__stage">
        <div class="reference-import__stage-head">
          <div>
            <small>Etape 6</small>
            <strong>Confirmation finale</strong>
            <p>Une derniere verification avant l import officiel.</p>
          </div>
        </div>

        <article class="reference-import__confirm-card">
          <strong>{{ vm.selectedImportDefinition.label }}</strong>
          <p>
            Vous etes sur le point d importer ces donnees dans le referentiel officiel.
            Cette operation peut modifier les donnees disponibles pour les prochaines publications.
            Voulez-vous continuer ?
          </p>
          <span v-if="vm.importBlockingMessage">{{ vm.importBlockingMessage }}</span>
        </article>
      </div>

      <div v-else class="reference-import__stage">
        <div class="reference-import__stage-head">
          <div>
            <small>Etape 7</small>
            <strong>Resultat final</strong>
            <p>Le compte rendu de l import reste disponible tant que la modale est ouverte.</p>
          </div>
        </div>

        <div v-if="vm.importResultSummary" class="reference-import__stage-stack">
          <div class="reference-import__status-card reference-import__status-card--success">
            <strong>{{ vm.importResultSummary.titre }}</strong>
            <p>L import officiel a ete traite et les donnees du centre ont ete rechargees.</p>
          </div>

          <div class="reference-import__preview-grid">
            <article class="reference-import__metric">
              <small>Elements importes</small>
              <strong>{{ vm.importResultSummary.elementsImportes ?? 'Non detaille' }}</strong>
            </article>
            <article class="reference-import__metric">
              <small>Elements rejetes</small>
              <strong>{{ vm.importResultSummary.elementsRejetes ?? 'Non detaille' }}</strong>
            </article>
            <article class="reference-import__metric">
              <small>Elements ignores</small>
              <strong>{{ vm.importResultSummary.elementsIgnores ?? 'Non detaille' }}</strong>
            </article>
            <article class="reference-import__metric">
              <small>Duree</small>
              <strong>{{ vm.importResultSummary.dureeTexte ?? 'Non disponible' }}</strong>
            </article>
          </div>

          <article v-if="vm.importResultSummary.detailsDisponibles" class="reference-import__code-shell">
            <div class="reference-import__code-head">
              <strong>Details disponibles</strong>
              <small>Uniquement les informations renvoyees par le systeme actuel.</small>
            </div>
            <pre>{{ JSON.stringify(vm.importResultSummary.detailsDisponibles, null, 2) }}</pre>
          </article>
        </div>
      </div>
    </div>

    <template #footer>
      <button class="reference-center__ghost-button" type="button" @click="vm.closeModal">
        {{ vm.importWizardStep === 7 ? 'Terminer' : 'Fermer' }}
      </button>
      <button
        v-if="vm.importWizardStep > 1 && vm.importWizardStep < 7"
        class="reference-center__ghost-button"
        type="button"
        @click="vm.previousImportStep"
      >
        Retour
      </button>
      <button
        v-if="vm.importWizardStep === 1 || vm.importWizardStep === 2 || vm.importWizardStep === 3"
        class="reference-center__primary-button"
        type="button"
        :disabled="vm.importWizardStep === 3 && !vm.importForm.rawJson.trim()"
        @click="vm.nextImportStep"
      >
        Continuer
      </button>
      <button
        v-else-if="vm.importWizardStep === 4"
        class="reference-center__primary-button"
        type="button"
        :disabled="vm.importValidationStatus !== 'ready' || !vm.importValidation?.estValide"
        @click="vm.nextImportStep"
      >
        Voir l apercu
      </button>
      <button
        v-else-if="vm.importWizardStep === 5"
        class="reference-center__primary-button"
        type="button"
        :disabled="!vm.importValidation?.estValide"
        @click="vm.nextImportStep"
      >
        Passer a la confirmation
      </button>
      <button
        v-else-if="vm.importWizardStep === 6"
        class="reference-center__primary-button"
        type="button"
        :disabled="!vm.canSubmitImport || vm.store.state.actionStatus === 'loading'"
        @click="vm.askSubmitImport"
      >
        {{ vm.store.state.actionStatus === 'loading' ? 'Import en cours...' : 'Importer maintenant' }}
      </button>
      <button
        v-else
        class="reference-center__primary-button"
        type="button"
        @click="vm.resetImportWizard(vm.importForm.typeImport)"
      >
        Recommencer
      </button>
    </template>
  </PlatformReferenceModal>

  <PlatformReferenceModal
    id="reference-publish"
    :open="vm.modalState === 'publish'"
    eyebrow="Publication"
    title="Publier une version du referentiel"
    description="Verifiez les informations de la version avant publication. Une version publiee pourra ensuite etre activee selon les droits disponibles."
    @close="vm.closeModal"
  >
    <div class="reference-center__modal-grid">
      <label class="reference-center__field">
        <span>Referentiel programme</span>
        <select v-model="vm.publishForm.idReferentielProgramme">
          <option value="">Selectionnez un referentiel</option>
          <option
            v-for="referentiel in vm.store.state.referentiels"
            :key="referentiel.id"
            :value="referentiel.id"
          >
            {{ vm.readClasseLabel(referentiel.idClasseAcademique) }}
          </option>
        </select>
      </label>
      <label class="reference-center__field">
        <span>Code version</span>
        <input
          v-model="vm.publishForm.codeVersion"
          type="text"
          placeholder="Ex. MINEDUC-2025-2026-V2"
        />
      </label>
      <label class="reference-center__field">
        <span>Annee reference</span>
        <input v-model="vm.publishForm.anneeReference" type="text" placeholder="2025" />
      </label>
      <label class="reference-center__field">
        <span>Date publication</span>
        <input v-model="vm.publishForm.datePublication" type="date" />
      </label>
      <label class="reference-center__field">
        <span>Source</span>
        <input
          v-model="vm.publishForm.sourceImport"
          type="text"
          placeholder="Ex. Import officiel plateforme"
        />
      </label>
      <label class="reference-center__field reference-center__field--full">
        <span>Motif publication</span>
        <textarea v-model="vm.publishForm.motifPublication" rows="4" placeholder="Motif facultatif" />
      </label>
    </div>

    <template #footer>
      <button class="reference-center__ghost-button" type="button" @click="vm.closeModal">Annuler</button>
      <button
        class="reference-center__primary-button"
        type="button"
        :disabled="!vm.canSubmitPublish || vm.store.state.actionStatus === 'loading'"
        @click="vm.submitPublish"
      >
        Publier la version
      </button>
    </template>
  </PlatformReferenceModal>

  <PlatformReferenceModal
    id="reference-activate"
    :open="vm.modalState === 'activate'"
    eyebrow="Activation"
    title="Activer une version du referentiel"
    description="Cette action rendra cette version active pour les usages concernes. Confirmez uniquement apres verification."
    @close="vm.closeModal"
  >
    <div class="reference-center__modal-grid">
      <label class="reference-center__field">
        <span>Version disponible</span>
        <select v-model="vm.activateForm.idVersionReferentielProgramme">
          <option value="">Selectionnez une version disponible</option>
          <option
            v-for="version in vm.store.versionsDisponibles.value"
            :key="version.id"
            :value="version.id"
          >
            {{ version.codeVersion }} - {{ version.anneeReference }}
          </option>
        </select>
      </label>
      <label class="reference-center__field reference-center__field--full">
        <span>Ou reference d une version specifique</span>
        <input
          v-model="vm.activateForm.idVersionReferentielProgramme"
          type="text"
          placeholder="Renseignez une reference si la version n apparait pas encore dans la liste."
        />
      </label>
    </div>

    <template #footer>
      <button class="reference-center__ghost-button" type="button" @click="vm.closeModal">Annuler</button>
      <button
        class="reference-center__primary-button"
        type="button"
        :disabled="!vm.activateForm.idVersionReferentielProgramme.trim() || vm.store.state.actionStatus === 'loading'"
        @click="vm.askActivateVersion"
      >
        Confirmer l activation
      </button>
    </template>
  </PlatformReferenceModal>

  <PlatformReferenceModal
    id="reference-compare"
    :open="vm.modalState === 'compare'"
    eyebrow="Comparaison"
    title="Comparer deux versions"
    description="Choisissez une version source et une version cible pour afficher les differences."
    @close="vm.closeModal"
  >
    <div class="reference-center__modal-grid">
      <label class="reference-center__field">
        <span>Classe academique</span>
        <select v-model="vm.compareForm.idClasseAcademique">
          <option value="">Selectionnez une classe academique</option>
          <option v-for="classe in vm.store.state.classesAcademiques" :key="classe.id" :value="classe.id">
            {{ classe.libelle }}
          </option>
        </select>
      </label>
      <label class="reference-center__field">
        <span>Version source</span>
        <input
          v-model="vm.compareForm.versionReferentielSource"
          type="text"
          placeholder="Code ou reference de la version source"
        />
      </label>
      <label class="reference-center__field">
        <span>Version cible</span>
        <input
          v-model="vm.compareForm.versionReferentielCible"
          type="text"
          placeholder="Code ou reference de la version cible"
        />
      </label>
    </div>

    <template #footer>
      <button class="reference-center__ghost-button" type="button" @click="vm.closeModal">Fermer</button>
      <button
        class="reference-center__primary-button"
        type="button"
        :disabled="!vm.canSubmitCompare || vm.store.state.actionStatus === 'loading'"
        @click="vm.submitCompare"
      >
        Lancer la comparaison
      </button>
    </template>
  </PlatformReferenceModal>

  <PlatformReferenceModal
    id="reference-migration"
    :open="vm.modalState === 'migration'"
    eyebrow="Migrations"
    title="Migrations referentielles"
    description="Suivez les migrations entre versions officielles et programmes concernes."
    @close="vm.closeModal"
  >
    <div class="reference-center__modal-grid">
      <label class="reference-center__field">
        <span>Programme concerne</span>
        <input
          v-model="vm.migrationForm.idProgrammeNiveau"
          type="text"
          placeholder="Reference du programme concerne"
        />
      </label>
      <label class="reference-center__field">
        <span>Ancienne version</span>
        <input
          v-model="vm.migrationForm.idAncienneVersionReferentiel"
          type="text"
          placeholder="Reference de la version source"
        />
      </label>
      <label class="reference-center__field">
        <span>Nouvelle version</span>
        <input
          v-model="vm.migrationForm.idNouvelleVersionReferentiel"
          type="text"
          placeholder="Reference de la version cible"
        />
      </label>
    </div>

    <template #footer>
      <button class="reference-center__ghost-button" type="button" @click="vm.closeModal">Annuler</button>
      <button
        class="reference-center__primary-button"
        type="button"
        :disabled="!vm.canSubmitMigration || vm.store.state.actionStatus === 'loading'"
        @click="vm.submitMigrationAnalysis"
      >
        Analyser la migration
      </button>
    </template>
  </PlatformReferenceModal>

  <PlatformReferenceModal
    id="socle-create"
    :open="vm.modalState === 'create-socle'"
    eyebrow="Socle officiel"
    :title="vm.socleCreationTitle"
    description="Ajoutez un element officiel du socle pour enrichir le centre de reference."
    @close="vm.closeModal"
  >
    <template v-if="vm.store.state.activeFamily === 'sections'">
      <div class="reference-center__modal-grid">
        <label class="reference-center__field">
          <span>Code</span>
          <input v-model="vm.sectionForm.code" type="text" placeholder="PRIM" />
        </label>
        <label class="reference-center__field">
          <span>Libelle</span>
          <input v-model="vm.sectionForm.libelle" type="text" placeholder="Primaire" />
        </label>
        <label class="reference-center__field">
          <span>Ordre d affichage</span>
          <input v-model.number="vm.sectionForm.ordreAffichage" type="number" min="1" />
        </label>
      </div>
    </template>

    <template v-else-if="vm.store.state.activeFamily === 'classes'">
      <div class="reference-center__modal-grid">
        <label class="reference-center__field">
          <span>Section scolaire</span>
          <select v-model="vm.classeForm.idSectionScolaire">
            <option value="">Selectionnez une section</option>
            <option v-for="section in vm.store.state.sections" :key="section.id" :value="section.id">
              {{ section.libelle }}
            </option>
          </select>
        </label>
        <label class="reference-center__field">
          <span>Code</span>
          <input v-model="vm.classeForm.code" type="text" placeholder="7EB" />
        </label>
        <label class="reference-center__field">
          <span>Libelle</span>
          <input v-model="vm.classeForm.libelle" type="text" placeholder="7e EB" />
        </label>
        <label class="reference-center__field">
          <span>Ordre pedagogique</span>
          <input v-model.number="vm.classeForm.ordrePedagogique" type="number" min="1" />
        </label>
        <label class="reference-center__field">
          <span>Cycle</span>
          <input v-model="vm.classeForm.cycle" type="text" placeholder="SECONDAIRE" />
        </label>
        <label class="reference-center__field">
          <span>Structure d evaluation</span>
          <select v-model="vm.classeForm.typeStructureEvaluation">
            <option value="TRIMESTRIEL">TRIMESTRIEL</option>
            <option value="SEMESTRIEL">SEMESTRIEL</option>
          </select>
        </label>
        <label class="reference-center__field reference-center__field--check">
          <input v-model="vm.classeForm.accepteOptions" type="checkbox" />
          <span>Accepte les options</span>
        </label>
        <label class="reference-center__field reference-center__field--check">
          <input v-model="vm.classeForm.optionObligatoire" type="checkbox" />
          <span>Option obligatoire</span>
        </label>
        <label class="reference-center__field reference-center__field--check">
          <input v-model="vm.classeForm.estClasseTENASOSP" type="checkbox" />
          <span>Classe TENASOSP</span>
        </label>
        <label class="reference-center__field reference-center__field--check">
          <input v-model="vm.classeForm.estClasseEXETAT" type="checkbox" />
          <span>Classe EXETAT</span>
        </label>
        <label class="reference-center__field reference-center__field--check">
          <input v-model="vm.classeForm.estClasseFinaliste" type="checkbox" />
          <span>Classe finaliste</span>
        </label>
      </div>
    </template>

    <template v-else>
      <div class="reference-center__modal-grid">
        <label class="reference-center__field">
          <span>Code numerique</span>
          <input v-model.number="vm.optionForm.code" type="number" min="1" />
        </label>
        <label class="reference-center__field">
          <span>Abreviation</span>
          <input v-model="vm.optionForm.abreviation" type="text" placeholder="CG" />
        </label>
        <label class="reference-center__field">
          <span>Libelle</span>
          <input
            v-model="vm.optionForm.libelle"
            type="text"
            placeholder="Commerciale et gestion"
          />
        </label>
        <label class="reference-center__field">
          <span>Ordre d affichage</span>
          <input v-model.number="vm.optionForm.ordreAffichage" type="number" min="1" />
        </label>
        <label class="reference-center__field reference-center__field--check">
          <input v-model="vm.optionForm.estTechnique" type="checkbox" />
          <span>Option technique</span>
        </label>
        <label class="reference-center__field">
          <span>Categorie technique</span>
          <select v-model="vm.optionForm.categorieTechnique">
            <option :value="null">Aucune</option>
            <option value="GROUPE_1">GROUPE_1</option>
            <option value="GROUPE_2">GROUPE_2</option>
          </select>
        </label>
      </div>
    </template>

    <template #footer>
      <button class="reference-center__ghost-button" type="button" @click="vm.closeModal">Annuler</button>
      <button
        class="reference-center__primary-button"
        type="button"
        :disabled="!vm.canSubmitSocleCreation || vm.store.state.actionStatus === 'loading'"
        @click="vm.submitSocleCreation"
      >
        Creer
      </button>
    </template>
  </PlatformReferenceModal>

  <PlatformReferenceModal
    id="confirm-action"
    :open="vm.confirmDialog !== null"
    eyebrow="Confirmation"
    :title="vm.confirmDialog?.title ?? ''"
    :description="vm.confirmDialog?.message ?? ''"
    @close="vm.closeConfirm"
  >
    <template #footer>
      <button class="reference-center__ghost-button" type="button" @click="vm.closeConfirm">Annuler</button>
      <button
        class="reference-center__primary-button"
        :class="{ 'reference-center__danger-button': vm.confirmDialog?.tone === 'danger' }"
        type="button"
        :disabled="vm.store.state.actionStatus === 'loading'"
        @click="vm.executeConfirm"
      >
        {{ vm.confirmDialog?.confirmLabel ?? 'Confirmer' }}
      </button>
    </template>
  </PlatformReferenceModal>
</template>

<script setup lang="ts">
import PlatformReferenceModal from './PlatformReferenceModal.vue';
import { usePlatformOfficialReferenceCenterViewModelContext } from '../viewmodels/usePlatformOfficialReferenceCenterViewModel';

const vm = usePlatformOfficialReferenceCenterViewModelContext();
</script>
