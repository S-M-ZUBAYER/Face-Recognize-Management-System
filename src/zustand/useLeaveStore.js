import { create } from "zustand";

const useLeaveStore = create((set) => ({
  leaves: [],

  setLeaves: (leavesArray) => {
    set({ leaves: leavesArray });
  },

  updateLeave: ({ Id, employeeId, deviceMAC, updatedLeave }) =>
    set((state) => {
      // console.group("🟡 updateLeave DEBUG");
      // console.log("Incoming employeeId:", employeeId);
      // console.log("Incoming deviceMAC:", deviceMAC);
      // console.log("Current leaves:", state.leaves);

      // const matchedLeave = state.leaves.find(
      //   (leave) =>
      //     String(leave.employeeId) === String(employeeId) &&
      //     leave.deviceMAC === deviceMAC,
      // );

      // console.log("Matched leave:", matchedLeave);

      const updatedLeaves = state.leaves.map((leave) =>
        String(leave.id) === String(Id) &&
        String(leave.employeeId) === String(employeeId) &&
        leave.deviceMAC === deviceMAC
          ? { ...leave, ...updatedLeave }
          : leave,
      );

      // console.log("Updated leaves:", updatedLeaves);
      // console.groupEnd();

      return { leaves: updatedLeaves };
    }),
}));

export default useLeaveStore;
