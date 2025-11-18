import { create } from "zustand";

const useAlertDialog = create((set) => ({
  isOpen: false,
  dialogMessage: "",

  openDialog: (message) => set({ isOpen: true, dialogMessage: message }),
  closeDialog: () => set({ isOpen: false, dialogMessage: "" }),
}));

export default useAlertDialog;
