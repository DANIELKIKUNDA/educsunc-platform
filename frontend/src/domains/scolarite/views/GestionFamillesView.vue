<template>
  <PageContainer>
    <PageHeader
      eyebrow="MS-03"
      title="Gestion des familles"
      description="Centre famille complet pour consulter, creer, modifier, gerer les responsables et lier les eleves dans le flux reel d inscription."
    >
      <template #actions>
        <div class="scolarite-actions">
          <RouterLink class="scolarite-pill" to="/app/scolarite">
            <ArrowLeft />
            <span>Retour scolarite</span>
          </RouterLink>
          <button class="scolarite-pill" type="button" :disabled="store.state.entries.length === 0" @click="exporterCsv">
            <Sheet />
            <span>Excel</span>
          </button>
          <button class="scolarite-pill scolarite-pill--action" type="button" :disabled="store.state.entries.length === 0" @click="imprimer">
            <Printer />
            <span>Impression</span>
          </button>
        </div>
      </template>
    </PageHeader>

    <SectionBlock title="Perimetre familles" description="La gestion des familles reste une mutation d ecole, strictement reservee au caissier.">
      <div class="scolarite-hero">
        <div class="scolarite-hero__lead">
          <div class="scolarite-hero__icon">
            <Users />
          </div>
          <div>
            <h3>{{ context.schoolName }}</h3>
            <p>{{ perimeterMessage }}</p>
          </div>
        </div>
        <div class="scolarite-badges">
          <PermissionTag :label="session.actorLabel" />
          <ContextBadge label="Organisation" :value="context.organizationName" />
          <ContextBadge label="Ecole" :value="context.schoolName" />
          <ContextBadge label="Annee scolaire" :value="context.schoolYearLabel" />
        </div>
      </div>
    </SectionBlock>

    <AccessBoundary page-code="SCO-003">
      <ErrorState
        v-if="!isAuthorized"
        title="Familles non autorisees"
        message="Cette vue reste reservee au caissier actif."
      />

      <template v-else>
        <SectionBlock title="Recherche et creation" description="Le centre famille expose maintenant les vrais filtres backend et les mutations reelles du workflow.">
          <div class="scolarite-kpi-grid">
            <div class="scolarite-kpi-card">
              <small>Familles visibles</small>
              <strong>{{ store.state.pagination?.total ?? store.state.entries.length }}</strong>
              <span>Total retour backend</span>
            </div>
            <div class="scolarite-kpi-card">
              <small>Responsables lies</small>
              <strong>{{ totalResponsables }}</strong>
              <span>Somme sur la page chargee</span>
            </div>
            <div class="scolarite-kpi-card">
              <small>Recherche active</small>
              <strong>{{ hasSearch ? 'Oui' : 'Non' }}</strong>
              <span>Nom famille, responsable ou eleve rattache</span>
            </div>
            <div class="scolarite-kpi-card">
              <small>Creation</small>
              <strong>{{ canCreate ? 'Prete' : 'Incomplete' }}</strong>
              <span>Identifiant + code + nom + telephone requis</span>
            </div>
          </div>

          <div class="scolarite-form-stack">
            <div class="scolarite-subsection">
              <div class="scolarite-subsection__header">
                <div>
                  <h3>Filtres de liste</h3>
                  <p>Recherche backend par nom de famille, responsable ou eleve rattache.</p>
                </div>
              </div>
              <div class="scolarite-grid">
                <label class="scolarite-field">
                  <span>Nom famille</span>
                  <input v-model="filters.nomFamille" type="text" placeholder="Famille Mbuyi" />
                </label>
                <label class="scolarite-field">
                  <span>Responsable</span>
                  <input v-model="filters.nomResponsable" type="text" placeholder="Jean Mbuyi" />
                </label>
                <label class="scolarite-field">
                  <span>Eleve rattache</span>
                  <input v-model="filters.nomEleve" type="text" placeholder="Josias Mukuta" />
                </label>
                <label class="scolarite-field">
                  <span>Page</span>
                  <input v-model.number="filters.page" type="number" min="1" />
                </label>
                <label class="scolarite-field">
                  <span>Taille page</span>
                  <input v-model.number="filters.taillePage" type="number" min="1" />
                </label>
              </div>
              <div class="scolarite-actions-row">
                <button class="scolarite-primary-action" type="button" @click="charger">
                  <Search />
                  <span>Charger</span>
                </button>
                <button class="scolarite-secondary-action" type="button" @click="reinitialiserFiltres">
                  Reinitialiser les filtres
                </button>
              </div>
            </div>

            <div class="scolarite-subsection">
              <div class="scolarite-subsection__header">
                <div>
                  <h3>Creation de famille</h3>
                  <p>Creation directe d une famille administrative avant rattachement des eleves.</p>
                </div>
                <span class="status-chip" :class="canCreate ? 'status-chip--ok' : 'status-chip--neutral'">
                  {{ canCreate ? 'Prete' : 'A completer' }}
                </span>
              </div>
              <div class="scolarite-grid">
                <label class="scolarite-field">
                  <span>Id famille</span>
                  <input v-model="createForm.idFamille" type="text" placeholder="famille-uuid" />
                </label>
                <label class="scolarite-field">
                  <span>Code famille</span>
                  <input v-model="createForm.codeFamille" type="text" placeholder="FAM-001" />
                </label>
                <label class="scolarite-field">
                  <span>Nom famille</span>
                  <input v-model="createForm.nomFamille" type="text" placeholder="Famille Mbuyi" />
                </label>
                <label class="scolarite-field">
                  <span>Telephone principal</span>
                  <input v-model="createForm.telephonePrincipal" type="text" placeholder="+243..." />
                </label>
                <label class="scolarite-field">
                  <span>Email</span>
                  <input v-model="createForm.email" type="text" placeholder="optionnel" />
                </label>
                <label class="scolarite-field scolarite-field--full">
                  <span>Adresse</span>
                  <input v-model="createForm.adresse" type="text" placeholder="optionnel" />
                </label>
              </div>
              <div class="scolarite-actions-row">
                <button v-if="canManageFamilies" class="scolarite-primary-action" type="button" :disabled="!canCreate" @click="creer">
                  <Save />
                  <span>Creer la famille</span>
                </button>
                <button class="scolarite-secondary-action" type="button" @click="reinitialiserCreation">
                  Reinitialiser la creation
                </button>
              </div>
            </div>
          </div>
        </SectionBlock>

        <LoadingState
          v-if="store.state.status === 'loading'"
          title="Chargement des familles"
          message="Lecture des familles, responsables et rattachements en cours."
        />
        <ErrorState
          v-else-if="store.state.status === 'error'"
          title="Familles indisponibles"
          :message="store.state.errorMessage ?? 'La liste ne peut pas etre ouverte.'"
        />
        <EmptyState
          v-else-if="store.state.entries.length === 0"
          title="Aucune famille visible"
          message="La liste sera alimentee des que des familles sont enregistrees."
        />

        <template v-else>
          <SectionBlock title="Liste et detail" description="La vue combine maintenant liste, edition famille, responsables, enfants lies et eligibilite famille nombreuse.">
            <div class="scolarite-layout">
              <div class="scolarite-table-shell">
                <table class="scolarite-table">
                  <thead>
                    <tr>
                      <th>Code</th>
                      <th>Nom famille</th>
                      <th>Telephone</th>
                      <th>Responsables</th>
                      <th>Eleves actifs</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="entry in store.state.entries"
                      :key="entry.idFamille"
                      :class="{ 'scolarite-row--selected': store.state.selected?.idFamille === entry.idFamille }"
                    >
                      <td>{{ entry.codeFamille }}</td>
                      <td>
                        <strong>{{ entry.nomFamille }}</strong>
                        <div class="scolarite-muted">{{ entry.idFamille }}</div>
                      </td>
                      <td>{{ entry.telephonePrincipal }}</td>
                      <td>{{ entry.responsables.length }}</td>
                      <td>{{ entry.nombreElevesActifs ?? '-' }}</td>
                      <td>
                        <div class="scolarite-actions-row">
                          <button class="scolarite-inline-action" type="button" @click="ouvrirDetail(entry.idFamille)">Ouvrir</button>
                          <button class="scolarite-inline-action" type="button" @click="ouvrirInscriptionFamille(entry.idFamille)">Inscription</button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <aside class="scolarite-panel" v-if="store.state.selected">
                <div class="scolarite-panel__header">
                  <div>
                    <p class="scolarite-label">Famille</p>
                    <strong>{{ store.state.selected.nomFamille }}</strong>
                    <div class="scolarite-muted">{{ store.state.selected.idFamille }}</div>
                  </div>
                  <span class="status-chip status-chip--ok">{{ store.state.selected.codeFamille }}</span>
                </div>

                <div class="scolarite-detail-grid">
                  <div><small>Telephone</small><strong>{{ store.state.selected.telephonePrincipal }}</strong></div>
                  <div><small>Email</small><strong>{{ store.state.selected.email ?? '-' }}</strong></div>
                  <div><small>Adresse</small><strong>{{ store.state.selected.adresse ?? '-' }}</strong></div>
                  <div><small>Version</small><strong>{{ store.state.selected.version }}</strong></div>
                  <div><small>Eleves actifs</small><strong>{{ store.state.selected.nombreElevesActifs ?? '-' }}</strong></div>
                </div>

                <div class="scolarite-next-grid">
                  <button class="scolarite-next-card" type="button" @click="ouvrirInscriptionFamille(store.state.selected.idFamille)">
                    <strong>Continuer vers l inscription</strong>
                    <small>Ouvrir MS-01 avec la famille deja pre-rattachee.</small>
                  </button>
                  <button class="scolarite-next-card" type="button" @click="ouvrirElevesFamille">
                    <strong>Relire les eleves</strong>
                    <small>Basculer vers la liste eleves pour verifier les rattachements actifs.</small>
                  </button>
                </div>

                <div class="scolarite-subsection">
                  <div class="scolarite-subsection__header">
                    <div>
                      <h3>Modifier la famille</h3>
                      <p>Mutation backend reelle sur les coordonnees et le nom de famille.</p>
                    </div>
                  </div>
                  <div class="scolarite-grid">
                    <label class="scolarite-field">
                      <span>Nom famille</span>
                      <input v-model="editFamilyForm.nomFamille" type="text" placeholder="Nom famille" />
                    </label>
                    <label class="scolarite-field">
                      <span>Telephone</span>
                      <input v-model="editFamilyForm.telephonePrincipal" type="text" placeholder="+243..." />
                    </label>
                    <label class="scolarite-field">
                      <span>Email</span>
                      <input v-model="editFamilyForm.email" type="text" placeholder="optionnel" />
                    </label>
                    <label class="scolarite-field scolarite-field--full">
                      <span>Adresse</span>
                      <input v-model="editFamilyForm.adresse" type="text" placeholder="optionnel" />
                    </label>
                  </div>
                  <div class="scolarite-actions-row">
                    <button v-if="canManageFamilies" class="scolarite-primary-action" type="button" @click="modifierFamille">
                      <Save />
                      <span>Mettre a jour</span>
                    </button>
                    <button class="scolarite-secondary-action" type="button" @click="chargerDepuisSelection">
                      Recharger les valeurs
                    </button>
                  </div>
                </div>

                <div class="scolarite-subsection">
                  <div class="scolarite-subsection__header">
                    <div>
                      <h3>Famille nombreuse</h3>
                      <p>Lecture backend de l eligibilite famille nombreuse.</p>
                    </div>
                    <button class="scolarite-secondary-action" type="button" @click="chargerFamilleNombreuse">
                      Evaluer
                    </button>
                  </div>
                  <div v-if="store.state.familleNombreuse" class="scolarite-detail-grid">
                    <div><small>Eligibilite</small><strong>{{ store.state.familleNombreuse.eligible ? 'Oui' : 'Non' }}</strong></div>
                    <div><small>Eleves eligibles</small><strong>{{ store.state.familleNombreuse.nombreElevesEligibles }}</strong></div>
                    <div><small>Seuil</small><strong>{{ store.state.familleNombreuse.seuilFamilleNombreuse }}</strong></div>
                  </div>
                </div>

                <div class="scolarite-subsection">
                  <div class="scolarite-subsection__header">
                    <div>
                      <h3>Responsables</h3>
                      <p>Ajout, edition, retrait et designation du principal branches sur le backend reel.</p>
                    </div>
                  </div>

                  <div class="scolarite-grid">
                    <label class="scolarite-field">
                      <span>Id responsable</span>
                      <input v-model="responsableForm.idResponsableFamille" type="text" placeholder="responsable-uuid" />
                    </label>
                    <label class="scolarite-field">
                      <span>Nom complet</span>
                      <input v-model="responsableForm.nomComplet" type="text" placeholder="Nom complet" />
                    </label>
                    <label class="scolarite-field">
                      <span>Telephone</span>
                      <input v-model="responsableForm.telephone" type="text" placeholder="+243..." />
                    </label>
                    <label class="scolarite-field">
                      <span>Telephone secondaire</span>
                      <input v-model="responsableForm.telephoneSecondaire" type="text" placeholder="optionnel" />
                    </label>
                    <label class="scolarite-field">
                      <span>Profession</span>
                      <input v-model="responsableForm.profession" type="text" placeholder="optionnel" />
                    </label>
                    <label class="scolarite-field">
                      <span>Lien parente</span>
                      <select v-model="responsableForm.lienParente">
                        <option value="PERE">PERE</option>
                        <option value="MERE">MERE</option>
                        <option value="TUTEUR">TUTEUR</option>
                        <option value="TUTRICE">TUTRICE</option>
                        <option value="AUTRE">AUTRE</option>
                      </select>
                    </label>
                    <label class="scolarite-field">
                      <span>Id utilisateur auth</span>
                      <input v-model="responsableForm.idUtilisateurAuth" type="text" placeholder="optionnel" />
                    </label>
                    <label class="scolarite-field scolarite-field--full">
                      <span>Adresse</span>
                      <input v-model="responsableForm.adresse" type="text" placeholder="optionnel" />
                    </label>
                  </div>
                  <div class="scolarite-actions-row">
                    <button v-if="canManageFamilies" class="scolarite-primary-action" type="button" :disabled="!canSaveResponsable" @click="ajouterResponsable">
                      <Save />
                      <span>Ajouter</span>
                    </button>
                    <button v-if="canManageFamilies" class="scolarite-secondary-action" type="button" :disabled="!canSaveResponsable" @click="modifierResponsable">
                      Modifier
                    </button>
                    <button class="scolarite-secondary-action" type="button" @click="reinitialiserResponsable">
                      Reinitialiser
                    </button>
                  </div>

                  <ul v-if="store.state.selected.responsables.length > 0" class="scolarite-list">
                    <li v-for="responsable in store.state.selected.responsables" :key="responsable.idResponsableFamille">
                      <strong>{{ responsable.nomComplet }}</strong>
                      <small>{{ responsable.lienParente }} | {{ responsable.telephone }}</small>
                      <small>{{ responsable.estPrincipal ? 'Principal' : 'Secondaire' }}</small>
                      <div class="scolarite-actions-row">
                        <button class="scolarite-inline-action" type="button" @click="chargerResponsable(responsable)">Charger</button>
                        <button v-if="canManageFamilies" class="scolarite-inline-action" type="button" @click="definirPrincipal(responsable.idResponsableFamille)">Definir principal</button>
                        <button v-if="canManageFamilies" class="scolarite-inline-action" type="button" @click="retirerResponsable(responsable.idResponsableFamille)">Retirer</button>
                      </div>
                    </li>
                  </ul>
                  <div v-else class="scolarite-empty-inline">
                    Aucun responsable expose pour cette famille.
                  </div>
                </div>

                <div class="scolarite-subsection">
                  <div class="scolarite-subsection__header">
                    <div>
                      <h3>Eleves lies</h3>
                      <p>La lecture et le rattachement / detachement d eleves sont maintenant visibles dans la meme vue.</p>
                    </div>
                  </div>
                  <div class="scolarite-grid">
                    <label class="scolarite-field">
                      <span>Id eleve a rattacher</span>
                      <input v-model="linkForm.idEleve" type="text" placeholder="eleve-uuid" />
                    </label>
                  </div>
                  <div class="scolarite-actions-row">
                    <button v-if="canManageFamilies" class="scolarite-primary-action" type="button" :disabled="!canLinkStudent" @click="rattacherEleve">
                      <Link2 />
                      <span>Rattacher l eleve</span>
                    </button>
                  </div>

                  <ul v-if="(store.state.selected.elevesLies?.length ?? 0) > 0" class="scolarite-list">
                    <li v-for="eleve in store.state.selected.elevesLies" :key="eleve.idEleve">
                      <strong>{{ nomComplet(eleve) }}</strong>
                      <small>{{ eleve.matricule }} | {{ eleve.statutGlobal }}</small>
                      <div class="scolarite-actions-row">
                        <button v-if="canManageFamilies" class="scolarite-inline-action" type="button" @click="detacherEleve(eleve.idEleve)">Detacher</button>
                      </div>
                    </li>
                  </ul>
                  <div v-else class="scolarite-empty-inline">
                    Aucun eleve lie n est encore expose pour cette famille.
                  </div>
                </div>
              </aside>
            </div>
          </SectionBlock>
        </template>
      </template>
    </AccessBoundary>
  </PageContainer>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router';
import {
  ArrowLeft,
  Link2,
  Printer,
  Save,
  Search,
  Sheet,
  ShieldCheck,
  Users,
} from 'lucide-vue-next';
import PageContainer from '../../../shared/layout/PageContainer.vue';
import PageHeader from '../../../shared/layout/PageHeader.vue';
import SectionBlock from '../../../shared/layout/SectionBlock.vue';
import AccessBoundary from '../../../shared/permissions/AccessBoundary.vue';
import LoadingState from '../../../shared/ui/LoadingState.vue';
import ErrorState from '../../../shared/ui/ErrorState.vue';
import EmptyState from '../../../shared/ui/EmptyState.vue';
import ContextBadge from '../../../shared/ui/ContextBadge.vue';
import PermissionTag from '../../../shared/ui/PermissionTag.vue';
import { useFamiliesViewModel } from '../viewmodels/useFamiliesViewModel';

const {
  store,
  session,
  context,
  isAuthorized,
  canManageFamilies,
  filters,
  createForm,
  editFamilyForm,
  responsableForm,
  linkForm,
  perimeterMessage,
  totalResponsables,
  hasSearch,
  canCreate,
  canSaveResponsable,
  canLinkStudent,
  nomComplet,
  charger,
  ouvrirDetail,
  ouvrirInscriptionFamille,
  ouvrirElevesFamille,
  creer,
  modifierFamille,
  ajouterResponsable,
  modifierResponsable,
  retirerResponsable,
  definirPrincipal,
  chargerFamilleNombreuse,
  rattacherEleve,
  detacherEleve,
  chargerResponsable,
  chargerDepuisSelection,
  reinitialiserResponsable,
  reinitialiserCreation,
  reinitialiserFiltres,
  exporterCsv,
  imprimer,
} = useFamiliesViewModel();
</script>

<style src="./GestionFamillesView.css" scoped></style>
