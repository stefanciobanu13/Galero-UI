import type { Attendance } from "../types";
import api from "./api";

export const attendanceService = {
  getAttendanceByDate: (date: string) => {
    return api.get(`/attendance/edition/${date}`);
  },

  getAttendanceById: (attendanceId: number) => {
    return api.get(`/attendance/${attendanceId}`);
  },

  submitAttendance: (attendanceData: any) => {
    return api.post("/attendance", attendanceData);
  },

  updateAttendance: (attendanceId: number, attendanceData: any) => {
    return api.put(`/attendance/${attendanceId}`, attendanceData);
  },

  deleteAttendance: (attendanceId: number) => {
    return api.delete(`/attendance/${attendanceId}`);
  },

  getAllAttendances: () => {
    return api.get("/attendance");
  },

  getAttendanceByEdition: (editionId: number) => {
    return api.get<Attendance[]>(`/attendance/edition/${editionId}`);
  },
};
