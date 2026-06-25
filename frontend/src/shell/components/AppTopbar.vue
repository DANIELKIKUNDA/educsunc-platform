<template>
  <header class="shell-topbar">
    <ContextSwitcher />
    <div class="shell-topbar__side">
      <ModuleQuickAccess :entries="entries" />
      <UserMenu />
    </div>
  </header>
</template>

<script setup lang="ts">
import type { NavigationEntry } from '../../shared/navigation/navigation.types';
import ContextSwitcher from './ContextSwitcher.vue';
import ModuleQuickAccess from './ModuleQuickAccess.vue';
import UserMenu from './UserMenu.vue';

defineProps<{
  entries: NavigationEntry[];
}>();
</script>
