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

function EmployeeModal() {
  const [isOpen, setIsOpen] = useState(false);

  // state to track selected options
  const [selectedValues, setSelectedValues] = useState({
    workType: "",
    attendanceMethod: "",
    visibleInfo: [],
    overtimeStatus: "",
  });

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
      content: ["Check Out Button", "Face Attendance", "Both"],
      multi: false,
    },
    {
      key: "visibleInfo",
      title: "Choose which information employee can see",
      content: [
        "Select All",
        "Absent",
        "Present",
        "Leaves",
        "Overtime",
        "Weekly Activities",
      ],
      multi: true, // only this one supports multiple
    },
    {
      key: "overtimeStatus",
      title: "Choose overtime status",
      content: ["Yes", "No"],
      multi: false,
    },
  ];

  // toggle values
  const handleToggle = (groupKey, value, multi) => {
    setSelectedValues((prev) => {
      if (multi) {
        // Multi-select (array)
        const current = prev[groupKey] || [];
        const updated = current.includes(value)
          ? current.filter((v) => v !== value)
          : [...current, value];
        return { ...prev, [groupKey]: updated };
      } else {
        // Single select (radio-like)
        return { ...prev, [groupKey]: value };
      }
    });
  };

  // save handler (API call here)
  const handleSave = () => {
    console.log("Sending to API:", selectedValues);

    // Example:
    // await axios.post("/api/employee/settings", selectedValues);

    setIsOpen(false);
  };

  return (
    <>
      {/* Trigger Button */}
      <button onClick={() => setIsOpen(true)}>
        <img src={image.settingIcon} alt="settings" />
      </button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
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

              {/* Accordion */}
              <div className="mt-6">
                <Accordion type="single" collapsible className="w-full">
                  {accordionData.map((group, idx) => (
                    <AccordionItem key={idx} value={`item-${idx}`}>
                      <AccordionTrigger>{group.title}</AccordionTrigger>
                      <AccordionContent
                        className={"flex gap-2.5 items-center flex-wrap"}
                      >
                        {group.content.map((option, i) => {
                          const isChecked = group.multi
                            ? selectedValues[group.key]?.includes(option)
                            : selectedValues[group.key] === option;

                          return (
                            <label
                              key={i}
                              className="flex items-center gap-2 mb-2 cursor-pointer"
                            >
                              <Checkbox
                                checked={isChecked}
                                onCheckedChange={() =>
                                  handleToggle(group.key, option, group.multi)
                                }
                              />
                              <span>{option}</span>
                            </label>
                          );
                        })}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>

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
                  className="w-[8vw] bg-[#004368] text-white py-2 px-4 rounded-lg  transition-colors"
                >
                  Save
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default EmployeeModal;
