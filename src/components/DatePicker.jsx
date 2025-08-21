import * as React from "react";
import { CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { useEmployeeData } from "@/hook/useEmployeeData";

function formatDate(date) {
  if (!date) {
    return "";
  }

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function DatePicker() {
  const [open, setOpen] = React.useState(false);
  const [date, setDate] = React.useState(new Date());
  const [month, setMonth] = React.useState(date);
  const [value, setValue] = React.useState(formatDate(date));
  const { setSelectedDate } = useEmployeeData();
  console.log(format(date, "yyyy-MM-dd"));

  return (
    <div className="flex flex-col gap-3">
      <div>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <div className="flex items-center gap-4 border border-[#B0C5D0] rounded-lg px-4 py-2 cursor-pointer">
              <CalendarIcon className="size-4 text-gray-500" />
              <p>{value}</p>
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
              selected={date}
              captionLayout="dropdown"
              month={month}
              onMonthChange={setMonth}
              onSelect={(date) => {
                setDate(date);
                setValue(formatDate(date));
                setOpen(false);
                setSelectedDate(format(date, "yyyy-MM-dd"));
              }}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
