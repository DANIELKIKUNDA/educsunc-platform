<template>
  <section class="audit-journal ui-surface" aria-labelledby="audit-journal-title">
    <header class="audit-panel-header">
      <div>
        <small>Lecture PostgreSQL</small>
        <h2 id="audit-journal-title">Journal des événements</h2>
        <p>Les événements sont classés du plus récent au plus ancien par le serveur.</p>
      </div>
      <span class="ui-badge ui-badge--info">{{ totalLabel }} événements</span>
    </header>

    <LoadingState v-if="status === 'loading' && events.length === 0" title="Chargement du journal" message="Les événements sont relus dans votre périmètre plateforme." />
    <div v-else-if="status === 'error' && events.length === 0" class="audit-error-retry">
      <ErrorState title="Journal indisponible" :message="errorMessage ?? 'La lecture ne peut pas être terminée.'" />
      <button class="ui-button" type="button" @click="emit('retry')">Réessayer</button>
    </div>
    <EmptyState v-else-if="events.length === 0" title="Aucun événement trouvé" message="Aucun événement ne correspond aux filtres actuels. Modifiez la recherche puis réessayez." />
    <template v-else>
      <div class="ui-table-shell audit-journal__desktop">
        <table class="audit-table">
          <thead>
            <tr>
              <th>Date et heure</th>
              <th>Acteur</th>
              <th>Action</th>
              <th>Ressource</th>
              <th>Périmètre</th>
              <th>Gravité</th>
              <th>Résultat</th>
              <th><span class="visually-hidden">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="event in events" :key="event.id">
              <td><strong>{{ event.dateLabel }}</strong><small>{{ event.timeLabel }}</small></td>
              <td><strong>{{ event.actorLabel }}</strong><small>{{ event.actorRole }}</small></td>
              <td><strong>{{ event.actionLabel }}</strong><small>{{ event.typeLabel }}</small></td>
              <td><strong>{{ event.resourceLabel }}</strong><small>{{ event.resourceId || 'Sans identifiant affichable' }}</small></td>
              <td><span class="ui-badge">{{ event.scopeLabel }}</span></td>
              <td><span class="ui-badge" :class="severityTone(event.severity)">{{ event.severityLabel }}</span></td>
              <td><span class="ui-badge" :class="resultTone(event.result)">{{ event.resultLabel }}</span></td>
              <td>
                <button class="audit-icon-button" type="button" :aria-label="`Ouvrir le détail de ${event.actionLabel}`" @click="emit('open', event.id)">
                  <ArrowUpRight :size="18" aria-hidden="true" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="audit-journal__mobile">
        <article v-for="event in events" :key="event.id" class="audit-event-card">
          <div class="audit-event-card__top">
            <span class="ui-badge" :class="severityTone(event.severity)">{{ event.severityLabel }}</span>
            <span>{{ event.dateLabel }} · {{ event.timeLabel }}</span>
          </div>
          <h3>{{ event.actionLabel }}</h3>
          <p>{{ event.actorLabel }} · {{ event.resourceLabel }}</p>
          <div class="audit-event-card__footer">
            <span class="ui-badge" :class="resultTone(event.result)">{{ event.resultLabel }}</span>
            <button class="ui-button ui-button--ghost" type="button" @click="emit('open', event.id)">Voir le détail</button>
          </div>
        </article>
      </div>

      <div class="audit-load-more">
        <p>{{ events.length }} sur {{ totalLabel }} événements chargés</p>
        <button v-if="hasNextPage" class="ui-button" type="button" :disabled="status === 'loading'" @click="emit('loadMore')">
          <ChevronsDown :size="17" aria-hidden="true" />
          {{ status === 'loading' ? 'Chargement…' : 'Charger la suite' }}
        </button>
        <span v-else class="ui-badge ui-badge--success">Fin du journal</span>
      </div>
    </template>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ArrowUpRight, ChevronsDown } from 'lucide-vue-next';
import EmptyState from '../../../shared/ui/EmptyState.vue';
import ErrorState from '../../../shared/ui/ErrorState.vue';
import LoadingState from '../../../shared/ui/LoadingState.vue';
import type { AuditEventViewModel, AuditRequestStatus } from '../models/platform-audit.model';

const props = defineProps<{
  events: readonly AuditEventViewModel[];
  total: number;
  hasNextPage: boolean;
  status: AuditRequestStatus;
  errorMessage: string | null;
}>();
const emit = defineEmits<{ open: [id: string]; loadMore: []; retry: [] }>();
const totalLabel = computed(() => new Intl.NumberFormat('fr-CD').format(props.total));

function severityTone(value: string): string {
  if (value === 'CRITIQUE') return 'ui-badge--danger';
  if (value === 'ELEVEE' || value === 'MOYENNE') return 'ui-badge--warning';
  return 'ui-badge--info';
}
function resultTone(value: string): string {
  if (value === 'SUCCESS' || value === 'IGNORED_DUPLICATE') return 'ui-badge--success';
  if (value === 'FAILED' || value === 'REFUSED') return 'ui-badge--danger';
  return 'ui-badge--warning';
}
</script>
