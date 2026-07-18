<template>
  <div v-if="accounts.length" class="security-table-wrap">
    <table class="security-table">
      <thead><tr><th>Compte</th><th>Rôles et niveaux</th><th>État</th><th>Sessions</th><th>Dernière activité</th><th class="security-table__actions">Actions</th></tr></thead>
      <tbody>
        <tr v-for="account in accounts" :key="account.id">
          <td data-label="Compte"><strong>{{ account.nomComplet }}</strong><small>{{ account.email }}</small></td>
          <td data-label="Rôles et niveaux"><div class="security-badges"><span v-for="assignment in account.affectations" :key="assignment.idAffectation" class="security-badge">{{ assignment.roleLibelle || roleLabel(assignment.role) }} · {{ levelLabel(assignment.niveau) }}</span><span v-if="!account.affectations.length" class="security-muted">Aucune affectation active</span></div></td>
          <td data-label="État"><span class="security-status" :class="`security-status--${account.etat.toLowerCase()}`">{{ stateLabel(account.etat) }}</span></td>
          <td data-label="Sessions">{{ account.sessionsActives }}</td>
          <td data-label="Dernière activité">{{ formatDate(account.dernierAcces) }}</td>
          <td data-label="Actions" class="security-table__actions">
            <div class="security-row-actions">
              <button v-if="canLifecycle && account.etat === 'ACTIVE'" type="button" @click="$emit('action', account, 'suspend')">Suspendre</button>
              <button v-if="canLifecycle && account.etat === 'SUSPENDED'" type="button" @click="$emit('action', account, 'reactivate')">Réactiver</button>
              <button v-if="canLifecycle && account.etat !== 'DISABLED'" type="button" class="danger" @click="$emit('action', account, 'deactivate')">Désactiver</button>
              <button v-if="canUnlock && account.verrouilleJusqua" type="button" @click="$emit('action', account, 'unlock')">Déverrouiller</button>
              <button v-if="canLifecycle && account.etat !== 'DISABLED'" type="button" @click="$emit('action', account, 'reset-password')">Réinitialiser le mot de passe</button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  <div v-else class="security-empty"><UserRoundSearch :size="30" /><strong>Aucun compte ne correspond à cette lecture</strong><p>Modifiez la recherche ou les filtres pour retrouver un compte.</p></div>
</template>

<script setup lang="ts">
import { UserRoundSearch } from 'lucide-vue-next';
import type { SecurityAccount } from '../models/security.model';

defineProps<{ accounts: readonly SecurityAccount[]; canLifecycle: boolean; canUnlock: boolean }>();
defineEmits<{ action: [account: SecurityAccount, action: 'suspend'|'reactivate'|'deactivate'|'unlock'|'reset-password'] }>();

const stateLabel = (value: string) => ({ ACTIVE:'Actif', SUSPENDED:'Suspendu', DISABLED:'Désactivé' }[value] ?? value);
const levelLabel = (value: string) => ({ PLATEFORME:'Plateforme', ORGANISATION:'Organisation', ECOLE:'École' }[value] ?? value);
const roleLabel = (value: string) => value.split('_').map((word) => word.charAt(0) + word.slice(1).toLowerCase()).join(' ');
const formatDate = (value?: string) => value ? new Intl.DateTimeFormat('fr-CD', { dateStyle:'medium', timeStyle:'short' }).format(new Date(value)) : 'Aucune activité récente';
</script>
