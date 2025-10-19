import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

function NormalMonthForm() {
  const [basic, setBasic] = useState("");
  const [other, setOther] = useState("");

  const salarySections = [
    {
      id: "basic-salary",
      label: "Basic Salary",
      value: basic,
      setValue: setBasic,
      placeholder: "000000",
    },
    {
      id: "other-salary",
      label: "Others Salary",
      value: other,
      setValue: setOther,
      placeholder: "000000",
    },
  ];

  const checkboxStyle =
    "data-[state=checked]:bg-[#004368] data-[state=checked]:border-[#004368] data-[state=checked]:text-white";

  return (
    <div className="space-y-5 p-6">
      {/* === Salary Section === */}
      <div className="space-y-2">
        {salarySections.map(({ id, label, value, setValue, placeholder }) => (
          <div key={id} className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <Checkbox id={id} className={checkboxStyle} />
              <Label htmlFor={id}>{label}</Label>
            </div>
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-80"
              placeholder={placeholder}
            />
          </div>
        ))}

        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            className="mt-2 flex items-center  bg-[#E6ECF0]"
            style={{ padding: "20px 52px" }}
          >
            <Plus className="w-4 h-4 text-[#004368]" />
            <span>Add another salary section</span>
          </Button>
        </div>
      </div>

      {/* === Working Day === */}
      <div className="flex   justify-between">
        <Label className="font-semibold whitespace-nowrap">
          Add Working Day
        </Label>
        <Input placeholder="26 Days" className="w-80" />
      </div>

      {/* === Working Hours === */}
      <div className="flex  justify-between ">
        <Label className="font-semibold whitespace-nowrap">
          Add Working Hours
        </Label>
        <Input placeholder="8" className="w-80" />
      </div>

      {/* === Overtime Rate === */}
      <div className="space-y-3">
        <Label className="font-semibold">Select Overtime Rate</Label>
        <div className="flex flex-col space-y-2">
          {[
            {
              id: "auto-calc",
              label: "Automatic Calculation (Day)",
              placeholder: "000",
            },
            {
              id: "fixed-input",
              label: "Fixed Input (Hour)",
              placeholder: "Enter Overtime Rate",
            },
          ].map(({ id, label, placeholder }) => (
            <div key={id} className="flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <Checkbox id={id} className={checkboxStyle} />
                <Label htmlFor={id} className="whitespace-nowrap">
                  {label}
                </Label>
              </div>
              <Input placeholder={placeholder} className="w-80" />
            </div>
          ))}
        </div>
      </div>

      {/* === Details Section === */}
      <div className="flex-col space-y-3.5">
        <Label className="font-semibold">Details</Label>
        <p>Details of pay period</p>
      </div>

      {/* === Save Button === */}
      <Button className="w-full mt-4 bg-[#004368] hover:bg-[#004368]">
        Save
      </Button>
    </div>
  );
}

export default NormalMonthForm;
