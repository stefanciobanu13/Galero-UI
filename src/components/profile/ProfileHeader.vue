<template>
  <div class="mb-lg">
    <!-- Hero Background -->
    <div class="bg-gradient-primary rounded-xl shadow-xl px-md py-md mb-md">
      <v-row align="center" class="gap-md">
        <!-- Avatar -->
        <v-col cols="12" sm="auto" class="text-center sm:text-left">
          <v-avatar
            :image="profilePictureUrl"
            size="80"
            class="shadow-md border-2 border-white"
          />
        </v-col>

        <!-- Info -->
        <v-col cols="12" sm>
          <h1 class="text-2xl text-bold text-white mb-xs">{{ fullName }}</h1>
          <p class="text-sm text-grey-100 mb-sm">{{ email }}</p>
          
          <v-chip
            :color="isAdmin ? 'warning' : 'success'"
            text-color="white"
            size="small"
            :prepend-icon="isAdmin ? 'mdi-shield-admin' : 'mdi-account'"
            class="mb-sm"
          >
            {{ isAdmin ? 'Administrator' : 'Player' }}
          </v-chip>
          
          <div class="flex gap-sm align-center flex-wrap">
            <div class="flex align-center gap-xs">
              <v-icon size="18" color="white">mdi-account-card</v-icon>
              <span class="text-white text-sm font-bold">ID: {{ userId }}</span>
            </div>
            <div v-if="playerName" class="flex align-center gap-xs">
              <v-icon size="18" color="white">mdi-soccer</v-icon>
              <span class="text-white text-sm font-bold">{{ playerName }}</span>
            </div>
          </div>
        </v-col>
      </v-row>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  fullName: string;
  email: string;
  profilePictureUrl: string;
  userId: number;
  playerName?: string;
  isAdmin: boolean;
}

defineProps<Props>();
</script>
