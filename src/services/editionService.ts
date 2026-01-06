import type { Edition } from "../types";
import api from "./api";

export const editionService = {
  getAll: () => api.get<Edition[]>("/editions"),
  getById: (id: number) => api.get<Edition>(`/editions/${id}`),
  getFull: (id: number) => api.get<any>(`/editions/${id}/full`),
  create: (edition: Edition) => api.post<Edition>("/editions", edition),
  update: (id: number, edition: Edition) =>
    api.put<Edition>(`/editions/${id}`, edition),
  delete: (id: number) => api.delete(`/editions/${id}`),
  getByNumber: (number: number) =>
    api.get<Edition>(`/editions/number/${number}`),
};
