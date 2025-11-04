// DocumentProofs.jsx - Complete updated code with useImageUpload hook

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronDownIcon, UploadCloud, Trash2, Eye } from "lucide-react";
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
import { useEmployeeStore } from "@/zustand/useEmployeeStore";
import { useSingleEmployeeDetails } from "@/hook/useSingleEmployeeDetails";

import toast from "react-hot-toast";
import finalJsonForUpdate from "@/lib/finalJsonForUpdate";
import { useImageUpload } from "@/hook/useImageUpload";

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
  const [description, setDescription] = useState("");
  const [missedPunchDocuments, setMissedPunchDocuments] = useState([]);
  const [latePunchDocuments, setLatePunchDocuments] = useState([]);

  const { selectedEmployee } = useEmployeeStore();
  const { updateEmployee, updating } = useSingleEmployeeDetails();
  const { uploadImage, uploading } = useImageUpload();

  // Load existing documents
  useEffect(() => {
    if (selectedEmployee?.salaryRules) {
      try {
        const salaryRules = selectedEmployee.salaryRules;

        // Load missed punch documents
        if (salaryRules.punchDocuments) {
          const punchDocs =
            typeof salaryRules.punchDocuments === "string"
              ? JSON.parse(salaryRules.punchDocuments)
              : salaryRules.punchDocuments || [];
          setMissedPunchDocuments(punchDocs);
        }

        // Load late punch documents
        if (salaryRules.latePunchDocuments) {
          const latePunchDocs =
            typeof salaryRules.latePunchDocuments === "string"
              ? JSON.parse(salaryRules.latePunchDocuments)
              : salaryRules.latePunchDocuments || [];
          setLatePunchDocuments(latePunchDocs);
        }
      } catch (error) {
        console.error("Error parsing documents:", error);
      }
    }
  }, [selectedEmployee]);

  const handleImageUpload = async (event, setImageFunction) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setImageFunction({ file, preview: imageUrl });
    }
  };

  // Save missed punch document
  const handleSaveMissedPunch = async () => {
    if (!selectedEmployee?.employeeId) {
      toast.error("No employee selected");
      return;
    }

    if (!missedPunchDate) {
      toast.error("Please select a date");
      return;
    }

    try {
      const salaryRules = selectedEmployee.salaryRules;
      const existingRules = salaryRules.rules || [];
      const empId = selectedEmployee.employeeId;

      // Ensure ruleId === 11 exists
      let ruleEleven = existingRules.find(
        (rule) => rule.ruleId === 11 || rule.ruleId === "11",
      );

      if (!ruleEleven) {
        ruleEleven = {
          id: Math.floor(10 + Math.random() * 90),
          empId: empId.toString(),
          ruleId: "11",
          ruleStatus: 1,
          param1: null,
          param2: null,
          param3: null,
          param4: null,
          param5: null,
          param6: null,
        };
      }

      // Upload image if exists
      let imagePath = "";
      if (missedPunchImage?.file) {
        imagePath = await uploadImage(missedPunchImage.file); // ✅ Use hook
        if (!imagePath) return;
      }

      // Create new missed punch document
      const newMissedPunch = {
        id: Math.floor(10 + Math.random() * 90),
        empId: Number(empId),
        date: missedPunchDate.toISOString().split("T")[0],
        CutSalary: missedPunchCutSalary,
        image_path: imagePath,
      };

      const updatedMissedPunchDocuments = [
        ...missedPunchDocuments,
        newMissedPunch,
      ];

      const updatedJSON = finalJsonForUpdate(salaryRules, {
        empId: empId,
        rules: {
          filter: (r) => r.ruleId === 11 || r.ruleId === "11",
          newValue: ruleEleven,
        },
        punchDocuments: updatedMissedPunchDocuments,
      });

      const payload = { salaryRules: JSON.stringify(updatedJSON) };
      console.log(payload);

      await updateEmployee({
        mac: selectedEmployee?.deviceMAC || "",
        id: selectedEmployee?.employeeId,
        payload,
      });

      setMissedPunchDocuments(updatedMissedPunchDocuments);
      resetMissedPunchForm();
      toast.success("Missed punch document saved successfully!");
    } catch (error) {
      console.error("Error saving missed punch:", error);
      toast.error("Failed to save missed punch document.");
    }
  };

  // Save late punch document
  const handleSaveLatePunch = async () => {
    if (!selectedEmployee?.employeeId) {
      toast.error("No employee selected");
      return;
    }

    if (!latePunchDate) {
      toast.error("Please select a date");
      return;
    }

    try {
      const salaryRules = selectedEmployee.salaryRules;
      const existingRules = salaryRules.rules || [];
      const empId = selectedEmployee.employeeId;

      // Ensure ruleId === 11 exists
      let ruleEleven = existingRules.find(
        (rule) => rule.ruleId === 11 || rule.ruleId === "11",
      );

      if (!ruleEleven) {
        ruleEleven = {
          id: Math.floor(10 + Math.random() * 90),
          empId: empId.toString(),
          ruleId: "11",
          ruleStatus: 1,
          param1: null,
          param2: null,
          param3: null,
          param4: null,
          param5: null,
          param6: null,
        };
      }

      // Upload image if exists
      let imagePath = "";
      if (latePunchImage?.file) {
        imagePath = await uploadImage(latePunchImage.file); // ✅ Use hook
        if (!imagePath) return;
      }

      // Create new late punch document
      const newLatePunch = {
        id: Math.floor(10 + Math.random() * 90),
        empId: Number(empId),
        date: latePunchDate.toISOString(),
        startTime: startTime || null,
        endTime: endTime || null,
        CutSalary: latePunchCutSalary,
        image_path: imagePath,
        description: description,
      };

      const updatedLatePunchDocuments = [...latePunchDocuments, newLatePunch];

      const updatedJSON = finalJsonForUpdate(salaryRules, {
        empId: empId,
        rules: {
          filter: (r) => r.ruleId === 11 || r.ruleId === "11",
          newValue: ruleEleven,
        },
        latePunchDocuments: updatedLatePunchDocuments,
      });

      const payload = { salaryRules: JSON.stringify(updatedJSON) };
      console.log(payload);

      await updateEmployee({
        mac: selectedEmployee?.deviceMAC || "",
        id: selectedEmployee?.employeeId,
        payload,
      });

      setLatePunchDocuments(updatedLatePunchDocuments);
      resetLatePunchForm();
      toast.success("Late punch document saved successfully!");
    } catch (error) {
      console.error("Error saving late punch:", error);
      toast.error("Failed to save late punch document.");
    }
  };

  // Delete document
  const handleDeleteDocument = async (documentId, isMissedPunch) => {
    try {
      const salaryRules = selectedEmployee.salaryRules;
      const empId = selectedEmployee.employeeId;

      let updatedDocuments;
      if (isMissedPunch) {
        updatedDocuments = missedPunchDocuments.filter(
          (doc) => doc.id !== documentId,
        );
      } else {
        updatedDocuments = latePunchDocuments.filter(
          (doc) => doc.id !== documentId,
        );
      }

      const updatedJSON = finalJsonForUpdate(salaryRules, {
        empId: empId,
        [isMissedPunch ? "punchDocuments" : "latePunchDocuments"]:
          updatedDocuments,
      });

      const payload = { salaryRules: JSON.stringify(updatedJSON) };

      await updateEmployee({
        mac: selectedEmployee?.deviceMAC || "",
        id: selectedEmployee?.employeeId,
        payload,
      });

      if (isMissedPunch) {
        setMissedPunchDocuments(updatedDocuments);
      } else {
        setLatePunchDocuments(updatedDocuments);
      }

      toast.success("Document deleted successfully!");
    } catch (error) {
      console.error("Error deleting document:", error);
      toast.error("Failed to delete document.");
    }
  };

  const resetMissedPunchForm = () => {
    setMissedPunchDate();
    setMissedPunchCutSalary("No");
    setMissedPunchImage();
  };

  const resetLatePunchForm = () => {
    setLatePunchDate();
    setStartTime("");
    setEndTime("");
    setLatePunchCutSalary("No");
    setLatePunchImage();
    setDescription("");
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
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
                {missedPunchImage?.preview && (
                  <div className="ml-4 flex items-center gap-2">
                    <img
                      src={missedPunchImage.preview}
                      alt="Uploaded signature"
                      className="w-20 h-20 object-cover rounded border"
                    />
                    <button
                      onClick={() => setMissedPunchImage()}
                      className="p-1 text-red-500 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Existing Missed Punch Documents */}
            {missedPunchDocuments.length > 0 && (
              <div className="mb-6">
                <Label className="text-sm font-semibold mb-3 block">
                  Existing Missed Punch Documents
                </Label>
                <div className="space-y-3">
                  {missedPunchDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="text-sm font-medium">
                            {formatDate(doc.date)}
                          </p>
                          <p className="text-xs text-gray-500">
                            Cut Salary: {doc.CutSalary}
                          </p>
                        </div>
                        {doc.image_path && (
                          <div className="relative group">
                            <img
                              src={doc.image_path}
                              alt="Document signature"
                              className="w-12 h-12 object-cover rounded border"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Eye className="w-4 h-4 text-white" />
                            </div>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteDocument(doc.id, true)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Details Section */}
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">
                  Details
                </h3>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li className="flex items-start">
                    <span className="font-semibold mr-2">•</span>
                    <span>
                      <p>You can upload the signature here</p>
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-semibold mr-2">•</span>
                    <span>
                      <strong>Example:</strong> If an employee forgets to punch
                      in, they need to upload a document with authorized
                      signatures as proof for that day.
                    </span>
                  </li>
                </ul>
              </div>

              <button
                onClick={handleSaveMissedPunch}
                disabled={updating || uploading || !missedPunchDate}
                className="w-full py-3 bg-[#004368] text-white rounded-lg hover:bg-[#003256] transition-colors text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? "Uploading..." : updating ? "Saving..." : "Save"}
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
                {latePunchImage?.preview && (
                  <div className="ml-4 flex items-center gap-2">
                    <img
                      src={latePunchImage.preview}
                      alt="Uploaded signature"
                      className="w-20 h-20 object-cover rounded border"
                    />
                    <button
                      onClick={() => setLatePunchImage()}
                      className="p-1 text-red-500 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center w-full my-4">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="flex-shrink mx-4 text-gray-500 text-sm font-medium">
                OR
              </span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>

            <div className="mb-6">
              <p className="text-sm font-semibold mb-3">Write Description</p>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter description for late punch (optional)"
                className="h-[15vh] border border-gray-300 rounded-md w-full p-3 focus:outline-none focus:ring-transparent placeholder:text-gray-400"
              />
            </div>

            {/* Existing Late Punch Documents */}
            {latePunchDocuments.length > 0 && (
              <div className="mb-6">
                <Label className="text-sm font-semibold mb-3 block">
                  Existing Late Punch Documents
                </Label>
                <div className="space-y-3">
                  {latePunchDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <p className="text-sm font-medium">
                            {formatDate(doc.date)}
                          </p>
                          <p className="text-xs text-gray-500">
                            Cut Salary: {doc.CutSalary}
                          </p>
                        </div>
                        {(doc.startTime || doc.endTime) && (
                          <p className="text-xs text-gray-500">
                            Time: {doc.startTime} - {doc.endTime}
                          </p>
                        )}
                        {doc.description && (
                          <p className="text-xs text-gray-500 mt-1">
                            Description: {doc.description}
                          </p>
                        )}
                        {doc.image_path && (
                          <div className="mt-2 relative group inline-block">
                            <img
                              src={doc.image_path}
                              alt="Document signature"
                              className="w-12 h-12 object-cover rounded border"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Eye className="w-4 h-4 text-white" />
                            </div>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteDocument(doc.id, false)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Details Section */}
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">
                  Details
                </h3>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li className="flex items-start">
                    <span className="font-semibold mr-2">•</span>
                    <span>
                      <p>
                        You can upload Late punch documents with start and end
                        time
                      </p>
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-semibold mr-2">•</span>
                    <span>
                      <strong>Example:</strong> if someone was late to the
                      institution, you can specify the exact time period and
                      upload documentation.
                    </span>
                  </li>
                </ul>
              </div>

              <button
                onClick={handleSaveLatePunch}
                disabled={updating || uploading || !latePunchDate}
                className="w-full py-3 bg-[#004368] text-white rounded-lg hover:bg-[#003256] transition-colors text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading
                  ? "Uploading..."
                  : updating
                    ? "Saving..."
                    : "Save Late Punch Document"}
              </button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
