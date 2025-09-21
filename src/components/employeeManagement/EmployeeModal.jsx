import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import image from "@/constants/image";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "../ui/checkbox";
import { useUpdateEmployee } from "../../hook/useUpdateEmployee";
import OvertimeModal from "./OvertimeModal";
import toast from "react-hot-toast";

function EmployeeModal({ employee }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showOvertime, setShowOvertime] = useState(false);

  const [selectedValues, setSelectedValues] = useState({
    workType: "",
    attendanceMethod: "",
    visibleInfo: [],
    overtimeStatus: "",
  });

  const updateEmployee = useUpdateEmployee();

  const accordionData = [
    {
      key: "workType",
      title: "Choose employee work type",
      content: ["Home", "Onsite", "Both"],
      multi: false,
    },
    {
      key: "attendanceMethod",
      title: "Choose attendance method for employee",
      content: ["Check Out Button", "Face attendance", "Both"],
      multi: false,
    },
    {
      key: "visibleInfo",
      title: "Choose which information employee can see",
      content: ["Absent", "Present", "Leaves", "Overtime", "Weekly Activities"],
      multi: true,
    },
    {
      key: "overtimeStatus",
      title: "Choose overtime status",
      content: ["Yes", "No"],
      multi: false,
    },
  ];

  // Helper function to get actual values for "Both" options
  const getActualValues = (groupKey, selectedValue) => {
    if (selectedValue !== "Both") return selectedValue;

    if (groupKey === "workType") {
      return "Home,Onsite";
    }
    if (groupKey === "attendanceMethod") {
      return "Check Out Button,Face attendance";
    }
    return selectedValue;
  };

  // Helper function to check if an option should be checked
  const isOptionChecked = (groupKey, option) => {
    const currentSelection = selectedValues[groupKey];

    if (!currentSelection) return false;

    if (groupKey === "workType" || groupKey === "attendanceMethod") {
      if (option === "Both") {
        // "Both" is checked if it's explicitly selected
        return currentSelection === "Both";
      } else {
        // Individual options are checked if "Both" is selected or if they're individually selected
        return currentSelection === "Both" || currentSelection === option;
      }
    }

    // For multi-select (visibleInfo) and other fields
    if (Array.isArray(currentSelection)) {
      return currentSelection.includes(option);
    }

    return currentSelection === option;
  };

  const handleToggle = (groupKey, value, multi) => {
    setSelectedValues((prev) => {
      if (multi) {
        const current = prev[groupKey] || [];
        const updated = current.includes(value)
          ? current.filter((v) => v !== value)
          : [...current, value];
        return { ...prev, [groupKey]: updated };
      } else {
        // For single-select items
        if (groupKey === "workType" || groupKey === "attendanceMethod") {
          // If clicking "Both", select it
          if (value === "Both") {
            return { ...prev, [groupKey]: "Both" };
          }
          // If clicking individual option when "Both" is selected, switch to individual
          else if (prev[groupKey] === "Both") {
            return { ...prev, [groupKey]: value };
          }
          // Normal toggle behavior
          else {
            return {
              ...prev,
              [groupKey]: prev[groupKey] === value ? "" : value,
            };
          }
        } else {
          // Normal single-select behavior for other fields
          return { ...prev, [groupKey]: prev[groupKey] === value ? "" : value };
        }
      }
    });

    // Special handling: if selecting overtimeStatus = Yes
    if (groupKey === "overtimeStatus" && value === "Yes") {
      setIsOpen(false);
      setShowOvertime(true);
    }
  };

  const handleSave = () => {
    const payload = {
      allowedAttendanceModes: getActualValues(
        "workType",
        selectedValues.workType
      ),
      allowedAttendanceActions: getActualValues(
        "attendanceMethod",
        selectedValues.attendanceMethod
      ),
      visibleDataTypes: selectedValues.visibleInfo.join(","),
    };

    console.log("Payload with processed values:", payload);

    updateEmployee.mutate(
      {
        companyId: employee.deviceMAC,
        employeeId: employee.employeeId,
        data: payload,
      },
      {
        onSuccess: () => {
          toast.success("Employee updated successfully");
          setIsOpen(false);
        },
        onError: () => {
          toast.error("Failed to update employee");
        },
      }
    );
  };

  return (
    <>
      {/* Trigger Button */}
      <button onClick={() => setIsOpen(true)}>
        <img src={image.settingIcon} alt="settings" />
      </button>

      {/* Employee Modal */}
      <AnimatePresence>
        {isOpen && !showOvertime && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="relative w-full max-w-[30vw] bg-white rounded-xl shadow-lg p-6"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Close dialog"
                className="absolute top-3 right-3 text-gray-400 hover:bg-gray-200 hover:text-gray-900 rounded-full p-2"
              >
                <svg
                  className="w-4 h-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 14 14"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M1 1l6 6m0 0l6 6M7 7l6-6M7 7l-6 6"
                  />
                </svg>
              </button>

              {/* Header */}
              {/* <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Employee Settings
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Configure settings for {employee?.name || "this employee"}
                </p>
              </div> */}

              {/* Accordion */}
              <div className="mt-6">
                <Accordion type="single" collapsible className="w-full">
                  {accordionData.map((group, idx) => (
                    <AccordionItem key={idx} value={`item-${idx}`}>
                      <AccordionTrigger className="text-left">
                        {group.title}
                      </AccordionTrigger>
                      <AccordionContent className="flex gap-2.5 items-center flex-wrap">
                        {group.content.map((option, i) => {
                          const isChecked = isOptionChecked(group.key, option);

                          return (
                            <label
                              key={i}
                              className="flex items-center gap-2 mb-2 cursor-pointer hover:bg-gray-50 p-1 rounded"
                            >
                              <Checkbox
                                checked={isChecked}
                                onCheckedChange={() =>
                                  handleToggle(group.key, option, group.multi)
                                }
                                className="data-[state=checked]:bg-[#004368] data-[state=checked]:border-[#004368]"
                              />
                              <span className="text-sm select-none">
                                {option}
                                {/* Show what "Both" represents */}
                                {option === "Both" &&
                                  group.key === "workType" && (
                                    <span className="text-xs text-gray-500 ml-1">
                                      {/* (Home, Onsite) */}
                                    </span>
                                  )}
                                {option === "Both" &&
                                  group.key === "attendanceMethod" && (
                                    <span className="text-xs text-gray-500 ml-1">
                                      {/* (Check Out Button, Face attendance) */}
                                    </span>
                                  )}
                              </span>
                            </label>
                          );
                        })}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>

              {/* Preview of selected values */}
              {/* {(selectedValues.workType || selectedValues.attendanceMethod) && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Preview:
                  </h4>
                  {selectedValues.workType && (
                    <p className="text-xs text-gray-600">
                      <strong>Work Type:</strong>{" "}
                      {getActualValues("workType", selectedValues.workType)}
                    </p>
                  )}
                  {selectedValues.attendanceMethod && (
                    <p className="text-xs text-gray-600">
                      <strong>Attendance Method:</strong>{" "}
                      {getActualValues(
                        "attendanceMethod",
                        selectedValues.attendanceMethod
                      )}
                    </p>
                  )}
                </div>
              )} */}

              {/* Action buttons */}
              <div className="mt-6 w-full justify-end flex items-center gap-2.5">
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-[8vw] border border-[#004368] text-[#004368] py-2 px-4 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={updateEmployee.isLoading}
                  className="w-[8vw] bg-[#004368] text-white py-2 px-4 rounded-lg transition-colors disabled:opacity-50 hover:bg-[#003155]"
                >
                  {updateEmployee.isLoading ? "Saving..." : "Save"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overtime Modal */}
      <OvertimeModal
        isOpen={showOvertime}
        onCancel={() => {
          setShowOvertime(false);
          setIsOpen(true);
        }}
        onConfirm={() => setShowOvertime(false)}
        {...employee}
      />
    </>
  );
}

export default EmployeeModal;
