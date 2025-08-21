import { create } from "zustand";

export const useAdminStore = create((set) => ({
  admins: [],
  setAdmins: (admins) => set({ admins }),
}));
