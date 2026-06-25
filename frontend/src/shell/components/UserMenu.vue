<template>
  <div class="user-menu">
    <PermissionTag :label="session.actorLabel" />
    <div class="user-menu__identity">
      <strong>{{ session.displayName }}</strong>
      <small>{{ session.actorCode }}</small>
    </div>
  </div>
</template>

<script setup lang="ts">
import { sessionStore } from '../../shared/auth/session.store';
import PermissionTag from '../../shared/ui/PermissionTag.vue';

const session = sessionStore.state;
</script>
