// store/updateProgressStore.js
import { create } from "zustand";

const useUpdateProgressStore = create((set, get) => ({
  title: "",
  isModalOpen: false,
  totalEmployees: 0,
  processedEmployees: 0,
  successfulEmployees: [],
  failedEmployees: [],
  currentProcessingEmployee: null,

  // Initialize the update process
  startUpdate: (employees, title) => {
    set({
      isModalOpen: true,
      title: title,
      totalEmployees: employees.length,
      processedEmployees: 0,
      successfulEmployees: [],
      failedEmployees: [],
      currentProcessingEmployee: null,
    });
  },

  // Update progress for an employee
  updateProgress: (employeeName, status, error = null) => {
    const state = get();
    const processedCount = state.processedEmployees + 1;

    if (status === "success") {
      set({
        successfulEmployees: [...state.successfulEmployees, employeeName],
        processedEmployees: processedCount,
        currentProcessingEmployee: null,
      });
    } else if (status === "failed") {
      set({
        failedEmployees: [
          ...state.failedEmployees,
          { name: employeeName, error },
        ],
        processedEmployees: processedCount,
        currentProcessingEmployee: null,
      });
    } else if (status === "processing") {
      set({
        currentProcessingEmployee: employeeName,
      });
    }

    // Auto close modal when all are processed
    // if (processedCount === state.totalEmployees) {
    //   setTimeout(() => {
    //     set({ isModalOpen: false });
    //   }, 3000);
    // }
  },

  // Reset the store
  resetProgress: () => {
    set({
      isModalOpen: false,
      totalEmployees: 0,
      processedEmployees: 0,
      successfulEmployees: [],
      failedEmployees: [],
      currentProcessingEmployee: null,
    });
  },

  // Close modal manually
  closeModal: () => {
    set({ isModalOpen: false });
  },
}));

export default useUpdateProgressStore;
