import * as React from "react";
import { CalendarIcon, ChevronRight } from "lucide-react";
import { format } from "date-fns";

import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// import { useEmployeeData } from "@/hook/useEmployeeData";
import { useAttendanceStore } from "@/zustand/useAttendanceStore";

function formatDate(date) {
  if (!date) return "";
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function DatePicker() {
  const [open, setOpen] = React.useState(false);

  // ✅ get selectedDate and setter from your hook
  const { selectedDate, setSelectedDate } = useAttendanceStore();

  React.useEffect(() => {
    console.log(selectedDate);
  }, [selectedDate]);

  // Convert string date from hook into JS Date
  const selectedDateObj = selectedDate ? new Date(selectedDate) : new Date();

  const [month, setMonth] = React.useState(selectedDateObj);

  return (
    <div className="flex flex-col gap-3">
      <div>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <div className="flex items-center gap-4 border border-[#B0C5D0] rounded-lg px-4 py-2 cursor-pointer">
              <CalendarIcon className="size-4 text-gray-500" />
              <p>{formatDate(selectedDateObj)}</p>
              <ChevronRight className="size-4 text-gray-500" />
            </div>
          </PopoverTrigger>
          <PopoverContent
            className="w-auto overflow-hidden p-0 bg-white shadow-lg border border-gray-200"
            align="start"
            alignOffset={-20}
            sideOffset={15}
          >
            <Calendar
              mode="single"
              selected={selectedDateObj}
              captionLayout="dropdown"
              month={month}
              onMonthChange={setMonth}
              onSelect={(date) => {
                if (!date) return;
                setSelectedDate(format(date, "yyyy-MM-dd")); // ✅ update hook state
                setOpen(false);
              }}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
