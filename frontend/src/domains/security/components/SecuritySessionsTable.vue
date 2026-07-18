<template>
  <div v-if="sessions.length" class="security-table-wrap">
    <table class="security-table">
      <thead><tr><th>Utilisateur</th><th>Appareil</th><th>Adresse réseau</th><th>Dernière activité</th><th>État</th><th class="security-table__actions">Actions</th></tr></thead>
      <tbody><tr v-for="session in sessions" :key="session.id">
        <td data-label="Utilisateur"><strong>{{ session.nomComplet }}</strong><small>{{ session.email }}</small></td>
        <td data-label="Appareil"><strong>{{ session.appareil || 'Appareil non identifié' }}</strong><small>{{ browserLabel(session.navigateur) }}</small></td>
        <td data-label="Adresse réseau">{{ session.adresseIp || 'Non disponible' }}</td>
        <td data-label="Dernière activité">{{ formatDate(session.dernierAcces || session.creeLe) }}</td>
        <td data-label="État"><span class="security-status" :class="session.statut === 'ACTIVE' ? 'security-status--active' : 'security-status--disabled'">{{ session.statut === 'ACTIVE' ? 'Active' : 'Révoquée' }}</span></td>
        <td data-label="Actions" class="security-table__actions"><div v-if="canRevoke && session.statut === 'ACTIVE'" class="security-row-actions"><button type="button" @click="$emit('revoke', session, false)">Fermer cette connexion</button><button type="button" class="danger" @click="$emit('revoke', session, true)">Fermer toutes</button></div></td>
      </tr></tbody>
    </table>
  </div>
  <div v-else class="security-empty"><MonitorOff :size="30" /><strong>Aucune session visible</strong><p>Les connexions actives et révoquées apparaîtront ici.</p></div>
</template>
<script setup lang="ts">
import { MonitorOff } from 'lucide-vue-next';
import type { SecuritySession } from '../models/security.model';
defineProps<{ sessions: readonly SecuritySession[]; canRevoke: boolean }>();
defineEmits<{ revoke: [session: SecuritySession, all: boolean] }>();
const formatDate = (value?: string) => value ? new Intl.DateTimeFormat('fr-CD', { dateStyle:'medium', timeStyle:'short' }).format(new Date(value)) : 'Non disponible';
const browserLabel = (value?: string) => value ? value.split(' ').slice(0, 5).join(' ') : 'Navigateur non identifié';
</script>
