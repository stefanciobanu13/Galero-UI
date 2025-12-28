import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Player } from '../types';
import { playerService } from '../services/api';

export const usePlayerStore = defineStore('player', () => {
  const players = ref<Player[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchPlayers = async () => {
    loading.value = true;
    error.value = null;
    try {
      const response = await playerService.getAll();
      players.value = response.data;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch players';
    } finally {
      loading.value = false;
    }
  };

  const createPlayer = async (player: Player) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await playerService.create(player);
      players.value.push(response.data);
      return response.data;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to create player';
      throw error.value;
    } finally {
      loading.value = false;
    }
  };

  const updatePlayer = async (id: number, player: Player) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await playerService.update(id, player);
      const index = players.value.findIndex(p => p.playerId === id);
      if (index !== -1) {
        players.value[index] = response.data;
      }
      return response.data;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to update player';
      throw error.value;
    } finally {
      loading.value = false;
    }
  };

  const deletePlayer = async (id: number) => {
    loading.value = true;
    error.value = null;
    try {
      await playerService.delete(id);
      players.value = players.value.filter(p => p.playerId !== id);
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to delete player';
      throw error.value;
    } finally {
      loading.value = false;
    }
  };

  const searchPlayers = async (firstName: string, lastName: string) => {
    loading.value = true;
    error.value = null;
    try {
      if (!firstName && !lastName) {
        await fetchPlayers();
      } else {
        const response = await playerService.searchByName(firstName, lastName);
        players.value = [response.data];
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to search players';
    } finally {
      loading.value = false;
    }
  };

  const setPlayers = (newPlayers: Player[]) => {
    players.value = newPlayers;
  };

  return {
    players,
    loading,
    error,
    fetchPlayers,
    createPlayer,
    updatePlayer,
    deletePlayer,
    searchPlayers,
    setPlayers,
  };
});
