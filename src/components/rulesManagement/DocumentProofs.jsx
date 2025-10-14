import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronDownIcon, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import image from "@/constants/image";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function DocumentProofs() {
  const [missedPunchDate, setMissedPunchDate] = useState();
  const [latePunchDate, setLatePunchDate] = useState();
  const [missedPunchOpen, setMissedPunchOpen] = useState(false);
  const [latePunchOpen, setLatePunchOpen] = useState(false);
  const [missedPunchImage, setMissedPunchImage] = useState();
  const [latePunchImage, setLatePunchImage] = useState();
  const [missedPunchCutSalary, setMissedPunchCutSalary] = useState("No");
  const [latePunchCutSalary, setLatePunchCutSalary] = useState("No");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const handleImageUpload = (event, setImageFunction) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setImageFunction(imageUrl);
    }
  };

  const handleSave = (tab) => {
    console.log(`Saving ${tab} configuration:`, {
      date: tab === "missed" ? missedPunchDate : latePunchDate,
      cutSalary: tab === "missed" ? missedPunchCutSalary : latePunchCutSalary,
      image: tab === "missed" ? missedPunchImage : latePunchImage,
      ...(tab === "late" && { startTime, endTime }),
    });
    // Add your save logic here
  };

  return (
    <div className="flex w-full max-w-4xl flex-col gap-6 p-4">
      <Tabs defaultValue="missed" className="w-full">
        <TabsList className="bg-transparent border-b rounded-none w-full">
          <TabsTrigger
            value="missed"
            className="text-[#004368] border-b-2  data-[state=active]:border-b-[#004368] data-[state=active]:shadow-none rounded-none px-6 py-3 font-medium transition-all"
          >
            Missed Punch Documents
          </TabsTrigger>
          <TabsTrigger
            value="late"
            className="text-[#004368] border-b-2  data-[state=active]:border-b-[#004368] data-[state=active]:shadow-none rounded-none px-6 py-3 font-medium transition-all"
          >
            Late Punch Documents
          </TabsTrigger>
        </TabsList>

        {/* Missed Punch Tab */}
        <TabsContent value="missed" className="space-y-6 mt-6">
          <div>
            <p className="text-sm font-semibold mb-4">Missed Punch Documents</p>

            {/* Date Selection */}
            <div className="mb-6">
              <Label className="text-sm font-medium mb-2 block">
                Select Date
              </Label>
              <div className="flex gap-3 bg-zinc-50 rounded-md w-full max-w-md p-3 justify-between">
                <div className="flex items-center gap-1.5">
                  <img
                    src={image.calendar}
                    alt="calendar"
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Date</span>
                </div>
                <Popover
                  open={missedPunchOpen}
                  onOpenChange={setMissedPunchOpen}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-30 justify-between font-normal bg-transparent border-none shadow-none hover:bg-transparent"
                    >
                      {missedPunchDate
                        ? missedPunchDate.toLocaleDateString()
                        : "Select date"}
                      <ChevronDownIcon className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={missedPunchDate}
                      onSelect={(date) => {
                        setMissedPunchDate(date);
                        setMissedPunchOpen(false);
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Cut Salary Option */}
            <div className="mb-6">
              <Label className="text-sm font-semibold mb-3 block">
                Cut Salary
              </Label>
              <RadioGroup
                value={missedPunchCutSalary}
                onValueChange={setMissedPunchCutSalary}
                className="flex gap-6"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem
                    value="Yes"
                    id="missed-yes"
                    className="border-2 text-[#004368] data-[state=checked]:border-[#B0C5D0]"
                  />
                  <Label htmlFor="missed-yes" className="cursor-pointer">
                    Yes
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem
                    value="No"
                    id="missed-no"
                    className="border-2 text-[#004368] data-[state=checked]:border-[#B0C5D0]"
                  />
                  <Label htmlFor="missed-no" className="cursor-pointer">
                    No
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Image Upload */}
            <div className="mb-6">
              <Label className="text-sm font-medium mb-3 block">
                Upload Signature
              </Label>
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-center">
                  <label className="flex flex-col items-center justify-center cursor-pointer transition-colors hover:bg-gray-50 p-4 rounded-lg border-2 border-dashed border-gray-300">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        handleImageUpload(e, setMissedPunchImage)
                      }
                      className="hidden"
                    />
                    <div className="flex flex-col items-center gap-2">
                      <UploadCloud />
                      <p className="text-sm text-gray-600">Signature</p>
                    </div>
                  </label>
                </div>
                {missedPunchImage && (
                  <div className="ml-4">
                    <img
                      src={missedPunchImage}
                      alt="Uploaded signature"
                      className="w-20 h-20 object-cover rounded border"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Details Section */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold mb-2">Details</h3>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    You can upload the signature here
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Example: </strong>
                    If an employee forgets to punch in, they need to upload a
                    document with authorized signatures as proof for that day.
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleSave("missed")}
                className="w-full  py-3 bg-[#004368] text-white rounded-lg hover:bg-[#003256] transition-colors  text-sm font-semibold "
              >
                Save
              </button>
            </div>
          </div>
        </TabsContent>

        {/* Late Punch Tab */}
        <TabsContent value="late" className="space-y-6 mt-6">
          <div>
            <p className="text-sm font-semibold mb-4">Late Punch Documents</p>

            {/* Date Selection */}
            <div className="mb-6">
              <Label className="text-sm font-medium mb-2 block">
                Select Date
              </Label>
              <div className="flex gap-3 bg-zinc-50 rounded-md w-full max-w-md p-3 justify-between">
                <div className="flex items-center gap-1.5">
                  <img
                    src={image.calendar}
                    alt="calendar"
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Date</span>
                </div>
                <Popover open={latePunchOpen} onOpenChange={setLatePunchOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-30 justify-between font-normal bg-transparent border-none shadow-none hover:bg-transparent"
                    >
                      {latePunchDate
                        ? latePunchDate.toLocaleDateString()
                        : "Select date"}
                      <ChevronDownIcon className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={latePunchDate}
                      onSelect={(date) => {
                        setLatePunchDate(date);
                        setLatePunchOpen(false);
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Time Selection */}
            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between w-full max-w-md">
                <Label className="text-sm font-medium">Start Time</Label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div className="flex items-center justify-between w-full max-w-md">
                <Label className="text-sm font-medium">End Time</Label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            </div>

            {/* Cut Salary Option */}
            <div className="mb-6">
              <Label className="text-sm font-semibold mb-3 block">
                Cut Salary
              </Label>
              <RadioGroup
                value={latePunchCutSalary}
                onValueChange={setLatePunchCutSalary}
                className="flex gap-6"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem
                    value="Yes"
                    id="late-yes"
                    className="border-2 text-[#004368] data-[state=checked]:border-[#B0C5D0]"
                  />
                  <Label htmlFor="late-yes" className="cursor-pointer">
                    Yes
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem
                    value="No"
                    id="late-no"
                    className="border-2 text-[#004368] data-[state=checked]:border-[#B0C5D0]"
                  />
                  <Label htmlFor="late-no" className="cursor-pointer">
                    No
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Image Upload */}
            <div className="mb-6">
              <Label className="text-sm font-medium mb-3 block">
                Upload Signature
              </Label>
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-center">
                  <label className="flex flex-col items-center justify-center cursor-pointer transition-colors hover:bg-gray-50 p-4 rounded-lg border-2 border-dashed border-gray-300">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, setLatePunchImage)}
                      className="hidden"
                    />
                    <div className="flex flex-col items-center gap-2">
                      <UploadCloud />
                      <p className="text-sm text-gray-600">Signature</p>
                    </div>
                  </label>
                </div>
                {latePunchImage && (
                  <div className="ml-4">
                    <img
                      src={latePunchImage}
                      alt="Uploaded signature"
                      className="w-20 h-20 object-cover rounded border"
                    />
                  </div>
                )}
              </div>
            </div>

            <div class="flex items-center w-full my-4">
              <div class="flex-grow border-t border-gray-300"></div>

              <span class="flex-shrink mx-4 text-gray-500 text-sm font-medium">
                OR
              </span>

              <div class="flex-grow border-t border-gray-300"></div>
            </div>

            <div>
              <p className="text-sm font-semibold mb-3">Write Description</p>
              <textarea
                type="text"
                placeholder="Enter description for late punch (optional)"
                className="h-[15vh] border border-gray-300 rounded-md w-full p-1.5
               focus:outline-none 
               focus:ring-transparent
               placeholder:text-gray-400"
              />
            </div>

            {/* Details Section */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold mb-2">Details</h3>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    You can upload Late punch documents with start and end time
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Example: </strong>
                    if someone was late to the institution,you can specify the
                    exact time priod and upload documentation.
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleSave("late")}
                className="w-full  py-3 bg-[#004368] text-white rounded-lg hover:bg-[#003256] transition-colors text-sm font-semibold"
              >
                Save Late Punch Document
              </button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
