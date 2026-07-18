<template>
  <div v-if="rows.length" class="security-table-wrap">
    <table class="security-table">
      <thead><tr><th>Responsable</th><th>{{ mode === 'schools' ? 'École' : 'Organisation' }}</th><th>État du compte</th><th>État de l’affectation</th><th>Sessions</th><th>Dernière activité</th><th v-if="canReplace" class="security-table__actions">Actions</th></tr></thead>
      <tbody><tr v-for="row in rows" :key="row.idAffectation">
        <td data-label="Responsable"><strong>{{ row.nomComplet }}</strong><small>{{ row.email }}</small></td>
        <td :data-label="mode === 'schools' ? 'École' : 'Organisation'"><strong>{{ mode === 'schools' ? row.ecoleNom || 'École rattachée' : row.organisationNom || 'Organisation gouvernée' }}</strong><small v-if="mode === 'schools'">{{ row.organisationNom }}</small></td>
        <td data-label="État du compte"><span class="security-status" :class="`security-status--${row.etatCompte.toLowerCase()}`">{{ stateLabel(row.etatCompte) }}</span></td>
        <td data-label="État de l’affectation">{{ row.etatAffectation === 'ACTIVE' ? 'Active' : 'Inactive' }}</td>
        <td data-label="Sessions">{{ row.sessionsActives }}</td><td data-label="Dernière activité">{{ formatDate(row.dernierAcces) }}</td><td v-if="canReplace" data-label="Actions" class="security-table__actions"><div class="security-row-actions"><button type="button" @click="$emit('replace',row)">Remplacer</button></div></td>
      </tr></tbody>
    </table>
  </div>
  <div v-else class="security-empty"><ShieldQuestion :size="30" /><strong>Aucun administrateur visible</strong><p>Les responsables affectés à ce niveau apparaîtront ici.</p></div>
</template>
<script setup lang="ts">
import { ShieldQuestion } from 'lucide-vue-next';
import type { SecurityAdministrator } from '../models/security.model';
defineProps<{ rows: readonly SecurityAdministrator[]; mode: 'organizations'|'schools'; canReplace?: boolean }>();
defineEmits<{ replace: [administrator: SecurityAdministrator] }>();
const stateLabel = (value: string) => ({ ACTIVE:'Actif', SUSPENDED:'Suspendu', DISABLED:'Désactivé' }[value] ?? value);
const formatDate = (value?: string) => value ? new Intl.DateTimeFormat('fr-CD', { dateStyle:'medium', timeStyle:'short' }).format(new Date(value)) : 'Aucune activité récente';
</script>
