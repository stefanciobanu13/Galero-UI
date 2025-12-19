<template>
  <v-app>
    <!-- Top App Bar -->
    <v-app-bar elevation="4" color="primary">
      <v-menu
        v-model="showMenu"
        :close-on-content-click="false"
        location="bottom"
        offset="0"
        width="100%"
      >
        <template #activator="{ props }">
          <v-app-bar-nav-icon v-bind="props" />
        </template>

        <v-list class="full-width-menu">
          <!-- User Profile Section -->
          <v-list-item
            v-if="authStore.isLoggedIn"
            :title="authStore.user?.name"
            :subtitle="authStore.user?.email"
            class="mb-2"
          >
            <template #prepend>
              <v-avatar
                :image="authStore.user?.picture || 'https://cdn.vuetifyjs.com/images/avatars/1.jpg'"
                color="primary"
              />
            </template>
          </v-list-item>

          <v-divider v-if="authStore.isLoggedIn" class="my-2" />

          <!-- Login Item -->
          <v-list-item
            v-if="!authStore.isLoggedIn"
            title="Login"
            to="/login"
            prepend-icon="mdi-login"
            @click="showMenu = false"
          />

          <!-- Home Item -->
          <v-list-item
            v-if="authStore.isLoggedIn"
            title="Home"
            to="/"
            prepend-icon="mdi-home"
            @click="showMenu = false"
          />

          <!-- Players Item -->
          <v-list-item
            v-if="authStore.isLoggedIn"
            title="Players"
            to="/players"
            prepend-icon="mdi-soccer"
            @click="showMenu = false"
          />

          <!-- Add Player Item (Admin Only) -->
          <v-list-item
            v-if="authStore.isLoggedIn && authStore.isAdmin"
            title="Add Player"
            to="/add-player"
            prepend-icon="mdi-plus-circle"
            @click="showMenu = false"
          />

          <!-- Attendance Item -->
          <v-list-item
            v-if="authStore.isLoggedIn"
            title="Attendance"
            to="/attendance"
            prepend-icon="mdi-calendar-check"
            @click="showMenu = false"
          />

          <!-- Editions Item -->
          <v-list-item
            v-if="authStore.isLoggedIn"
            title="Editions"
            to="/editions"
            prepend-icon="mdi-trophy"
            @click="showMenu = false"
          />

          <!-- Profile Item -->
          <v-list-item
            v-if="authStore.isLoggedIn"
            title="Profile"
            to="/profile"
            prepend-icon="mdi-account"
            @click="showMenu = false"
          />

          <!-- Divider before Logout -->
          <v-divider v-if="authStore.isLoggedIn" class="my-2" />

          <!-- Logout Item -->
          <v-list-item
            v-if="authStore.isLoggedIn"
            title="Logout"
            prepend-icon="mdi-logout"
            @click="handleLogout"
          />
        </v-list>
      </v-menu>

      <v-toolbar-title>Default Test</v-toolbar-title>
    </v-app-bar>

    <!-- Main Content -->
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from './stores/auth';

const authStore = useAuthStore();
const router = useRouter();
const showMenu = ref(false);

onMounted(() => {
  authStore.restoreFromStorage();
});

const handleLogout = () => {
  authStore.logout();
  showMenu.value = false;
  router.push('/login');
};
</script>

<style scoped>
:deep(.full-width-menu) {
  width: 100vw !important;
  max-width: 100vw !important;
  margin-left: calc(-50vw + 50%) !important;
  border-radius: 0 !important;
}
</style>
