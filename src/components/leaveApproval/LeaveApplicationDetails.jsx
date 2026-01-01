import React, { useState, useEffect, useCallback } from "react";
import { useLeaveData } from "@/hook/useLeaveData";
import { useImageUpload } from "@/hook/useImageUpload";
import { useUserStore } from "@/zustand/useUserStore";
import updateJsonString from "@/lib/updateJsonString";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

// Icons
import {
  UserCircle2,
  User,
  FileText,
  Download,
  Calendar,
  CalendarDays,
  Clock,
  Tag,
  Paperclip,
  FileX,
  XCircle,
  CheckCircle2,
  Edit2,
  Save,
  X,
  Upload,
} from "lucide-react";

// ShadCN Components
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import formatDateForStorage from "@/lib/formatDateForStorage";

// Constants
const LEAVE_CATEGORIES = [
  "Maternity Leave",
  "Marriage Leave",
  "Paternity Leave",
  "Sick Leave",
  "Casual Leave",
  "Earned Leave",
  "Without Pay Leave",
  "Rest Leave",
  "Other",
];

const LEAVE_TYPES = ["Hourly Leave", "Full Day Leave", "Extended Leave"];

const LeaveApplicationDetails = ({ data }) => {
  // Hooks
  const { updateLeave } = useLeaveData();
  const { user } = useUserStore();
  const { uploadImage, uploading: isUploading } = useImageUpload();

  // State
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState(null);
  const [documentFile, setDocumentFile] = useState(null);

  // Derived state
  const isExtendedLeave = editedData?.leaveType === "Extended Leave";

  // Parse description from data
  const parseDescription = useCallback((desc) => {
    if (!desc)
      return {
        des: "",
        fStartHour: "",
        fEndHour: "",
        lStartHour: "",
        lEndHour: "",
        fromTime: "",
        toTime: "",
      };

    if (typeof desc === "string") {
      try {
        return JSON.parse(desc);
      } catch {
        return {
          des: desc,
          fStartHour: "",
          fEndHour: "",
          lStartHour: "",
          lEndHour: "",
          fromTime: "",
          toTime: "",
        };
      }
    }

    return desc;
  }, []);

  // Initialize edited data
  useEffect(() => {
    if (data) {
      const parsedDescription = parseDescription(data.description);

      setEditedData({
        ...data,
        description: parsedDescription,
        startDate: data.startDate ? new Date(data.startDate) : new Date(),
        endDate: data.endDate ? new Date(data.endDate) : null,
      });
    }
  }, [data, parseDescription]);

  // Utility Functions
  const formatDate = useCallback((dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return isNaN(date.getTime())
      ? "Invalid Date"
      : date.toLocaleDateString("en-US", {
          weekday: "short",
          year: "numeric",
          month: "short",
          day: "numeric",
        });
  }, []);

  const getDayName = useCallback((dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return isNaN(date.getTime())
      ? "Invalid Date"
      : date.toLocaleDateString("en-US", { weekday: "long" });
  }, []);

  const calculateDuration = useCallback((startDate, endDate) => {
    if (!startDate || !endDate) return 1;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }, []);

  const getApproverName = useCallback(() => {
    if (!data?.approverName) return "No approver";
    if (typeof data.approverName === "object") {
      return (
        data.approverName.admin || data.approverName.leader || "No approver"
      );
    }
    return data.approverName;
  }, [data]);

  // Get description text for display
  const getDescriptionText = useCallback(() => {
    if (!editedData?.description) return "No description provided";

    if (typeof editedData.description === "object") {
      return editedData.description.des || "No description provided";
    }

    return editedData.description || "No description provided";
  }, [editedData]);

  // Event Handlers
  const handleEditToggle = () => {
    if (isEditing) {
      // Reset to original data
      const parsedDescription = parseDescription(data.description);

      setEditedData({
        ...data,
        description: parsedDescription,
        startDate: data.startDate ? new Date(data.startDate) : new Date(),
        endDate: data.endDate ? new Date(data.endDate) : null,
      });
      setDocumentFile(null);
    }
    setIsEditing(!isEditing);
  };

  const handleFieldChange = (field, value) => {
    if (field === "description") {
      // Update only the 'des' field of the description object
      setEditedData((prev) => ({
        ...prev,
        description: {
          ...prev.description,
          des: value,
        },
      }));
    } else {
      const updatedData = { ...editedData, [field]: value };

      // Clear end date if switching from Extended Leave
      if (
        field === "leaveType" &&
        value !== "Extended Leave" &&
        editedData.endDate
      ) {
        updatedData.endDate = null;
      }

      setEditedData(updatedData);
    }
  };

  const handleDocumentUpload = async (file) => {
    try {
      const imagePath = await uploadImage(file);
      if (imagePath) {
        setEditedData((prev) => ({ ...prev, documentUrl: imagePath }));
        toast.success("Document uploaded successfully");
      }
    } catch (error) {
      toast.error("Failed to upload document");
      console.error("Document upload error:", error);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validation
    const validTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "application/pdf",
    ];
    if (!validTypes.includes(file.type)) {
      toast.error("Please upload JPEG, PNG, or PDF files only");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setDocumentFile(file);
    handleDocumentUpload(file);
  };

  const handleSaveEdit = async () => {
    try {
      let documentUrl = editedData.documentUrl;

      // Upload new document if exists
      if (documentFile) {
        documentUrl = await uploadImage(documentFile);
        if (!documentUrl) {
          toast.error("Failed to upload document");
          return;
        }
      }
      // Prepare data for API
      const updatedData = {
        id: editedData.id,
        employeeId: editedData.employeeId,
        employeeName: editedData.employeeName,
        approverName: JSON.stringify(editedData.approverName),
        deviceMAC: editedData.deviceMAC,
        startDate: formatDateForStorage(editedData.startDate) || null,
        endDate:
          isExtendedLeave && editedData.endDate
            ? formatDateForStorage(editedData.endDate)
            : null,
        description: JSON.stringify(editedData.description),
        leaveCategory: editedData.leaveCategory,
        leaveType: editedData.leaveType,
        documentUrl,
        status: editedData.status,
      };

      // console.log(updatedData);

      await updateLeave(updatedData);
      toast.success("Leave application updated successfully");
      setIsEditing(false);
      setDocumentFile(null);
    } catch (error) {
      toast.error("Failed to update leave application");
      console.error("Update error:", error);
    }
  };

  const handleUpdateLeave = async (status) => {
    try {
      const updatedData = {
        id: data.id,
        employeeId: data.employeeId,
        employeeName: data.employeeName,
        approverName: updateJsonString("admin", user?.userName),
        deviceMAC: data.deviceMAC,
        startDate: data.startDate,
        endDate: data.endDate,
        description:
          typeof data.description === "object"
            ? JSON.stringify(data.description)
            : data.description,
        leaveCategory: data.leaveCategory,
        leaveType: data.leaveType,
        documentUrl: data.documentUrl,
        status: `${status}_admin`,
      };

      await updateLeave(updatedData);
      toast.success(`Leave ${status} successfully`);
    } catch (error) {
      toast.error(`Leave ${status} failed`);
      console.error("Status update error:", error);
    }
  };

  const handleReject = () => handleUpdateLeave("rejected");
  const handleApprove = () => handleUpdateLeave("approved");

  const handleDownload = () => {
    if (!data?.documentUrl) {
      toast.error("No document available");
      return;
    }

    try {
      const link = document.createElement("a");
      link.href = data.documentUrl;
      link.download = data.documentUrl.split("/").pop() || "document";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Download started");
    } catch (error) {
      toast.error("Download failed");
      console.error("Download error:", error);
    }
  };

  // Loading State
  if (!data || !editedData) {
    return (
      <div className="w-2/3 rounded-2xl border border-gray-200 p-6 flex items-center justify-center">
        <p className="text-gray-500">Select an application to view details</p>
      </div>
    );
  }

  // Render Components
  const renderHeader = () => (
    <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm py-2 mb-6 flex justify-between items-center">
      <span className="text-[1.4vh] font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
        Application Details
      </span>
      <Button
        onClick={handleEditToggle}
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
        disabled={isUploading}
      >
        {isUploading ? (
          <>
            <div className="w-4 h-4 border-2 border-gray-300 border-t-[#004368] rounded-full animate-spin" />
            Uploading...
          </>
        ) : isEditing ? (
          <>
            <X className="w-4 h-4" />
            Cancel Edit
          </>
        ) : (
          <>
            <Edit2 className="w-4 h-4" />
            Edit Application
          </>
        )}
      </Button>
    </div>
  );

  const renderBasicInfo = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
      {/* Approver */}
      <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-gradient-to-br from-[#004368]/5 to-white p-4 transition-all duration-300 hover:shadow-md hover:border-[#004368]/20 group">
        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-[#004368]/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
        <p className="text-[1.2vh] font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
          <UserCircle2 className="w-3.5 h-3.5" />
          APPROVER
        </p>
        <p className="text-base md:text-l[1.4vh] font-bold text-gray-800 group-hover:text-[#004368] transition-colors truncate">
          {getApproverName()}
        </p>
      </div>

      {/* Applicant */}
      <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-gradient-to-br from-emerald-50/30 to-white p-4 transition-all duration-300 hover:shadow-md hover:border-emerald-200/50 group">
        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-emerald-100/20 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
        <p className="text-[1.2vh] font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
          <User className="w-3.5 h-3.5" />
          APPLICANT
        </p>
        <p className="text-base md:text-[1.4vh] font-bold text-gray-800 group-hover:text-gray-900 transition-colors truncate">
          {data.employeeName.split("<")[0]}
        </p>
      </div>
    </div>
  );

  const renderDescription = () => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <FileText className="w-4 h-4 text-gray-400" />
          Description
        </p>
        <span className="text-xs font-medium px-3 py-1 rounded-full bg-[#004368]/10 text-[#004368]">
          Details
        </span>
      </div>

      {isEditing ? (
        <Textarea
          value={editedData.description?.des || ""}
          onChange={(e) => handleFieldChange("description", e.target.value)}
          className="min-h-[100px] border-gray-200 rounded-xl"
          placeholder="Enter description..."
          disabled={isUploading}
        />
      ) : (
        <div className="relative">
          <div className="border border-gray-100 rounded-2xl p-4 bg-gradient-to-br from-gray-50/50 to-white max-h-[150px] min-h-[100px] overflow-y-auto custom-scrollbar backdrop-blur-sm shadow-inner">
            <p className="text-sm text-gray-700 leading-relaxed font-medium">
              {getDescriptionText()}
            </p>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-white to-transparent pointer-events-none rounded-b-2xl" />
        </div>
      )}
    </div>
  );

  const renderLeaveDetails = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Leave Category */}
      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm hover:shadow-md transition-shadow duration-300">
        <div className="flex items-center justify-start gap-3">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-[#004368]/5 to-[#004368]/10 flex items-center justify-center">
            <Tag className="w-4 h-4 md:w-5 md:h-5 text-[#004368]" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[1.2vh] font-semibold text-gray-500 uppercase tracking-wider truncate mb-2">
              Category
            </p>
            {isEditing ? (
              <Select
                value={editedData.leaveCategory}
                onValueChange={(value) =>
                  handleFieldChange("leaveCategory", value)
                }
                disabled={isUploading}
              >
                <SelectTrigger className="w-full border-gray-200">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {LEAVE_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="text-sm md:text-[1.4vh] font-bold text-gray-800 truncate">
                {data.leaveCategory}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Leave Type */}
      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm hover:shadow-md transition-shadow duration-300">
        <div className="flex items-center justify-start gap-3">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-[#004368]/5 to-[#004368]/10 flex items-center justify-center">
            <Calendar className="w-4 h-4 md:w-5 md:h-5 text-[#004368]" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[1.2vh] font-semibold text-gray-500 uppercase tracking-wider truncate mb-2">
              Type
            </p>
            {isEditing ? (
              <Select
                value={editedData.leaveType}
                onValueChange={(value) => handleFieldChange("leaveType", value)}
                disabled={isUploading}
              >
                <SelectTrigger className="w-full border-gray-200">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {LEAVE_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="text-sm md:text-[1.4vh] font-bold text-gray-800 truncate">
                {data.leaveType}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Duration */}
      {data.endDate && (
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm hover:shadow-md transition-shadow duration-300 group">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Clock className="w-4 h-4 md:w-5 md:h-5 text-orange-600" />
            </div>
            <div className="min-w-0">
              <p className="text-[1.2vh] font-semibold text-gray-500 uppercase tracking-wider truncate">
                Duration
              </p>
              <p className="text-sm md:text-[1.4vh] font-bold text-gray-800">
                {calculateDuration(data.startDate, data.endDate)} days
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderDateRange = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-gray-400" />
          {isExtendedLeave ? "Leave Period" : "Leave Date"}
        </p>
        {isEditing && isExtendedLeave && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleFieldChange("endDate", null)}
            className="text-xs"
            disabled={isUploading}
          >
            {editedData.endDate ? "Clear End Date" : "Add End Date"}
          </Button>
        )}
      </div>

      <div
        className={`grid gap-4 ${
          isExtendedLeave && editedData.endDate
            ? "grid-cols-1 md:grid-cols-2"
            : "grid-cols-1"
        }`}
      >
        {/* Start Date */}
        <div className="rounded-2xl border border-gray-100 bg-gradient-to-br from-green-50/30 to-white p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            {isExtendedLeave ? "LEAVE START DAY" : "LEAVE DATE"}
          </p>
          {isEditing ? (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal h-auto py-3"
                  disabled={isUploading}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {editedData.startDate
                    ? formatDate(editedData.startDate.toISOString())
                    : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={editedData.startDate}
                  onSelect={(date) => handleFieldChange("startDate", date)}
                  initialFocus
                  className="rounded-md border"
                />
              </PopoverContent>
            </Popover>
          ) : (
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-[1.4vh] font-bold text-gray-800">
                  {formatDate(data.startDate)}
                </p>
                <p className="text-sm text-gray-600">
                  {getDayName(data.startDate)}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* End Date - Only for Extended Leave */}
        {isEditing && isExtendedLeave && (
          <div className="rounded-2xl border border-gray-100 bg-gradient-to-br from-purple-50/30 to-white p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              LEAVE END DAY
            </p>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal h-auto py-3"
                  disabled={isUploading}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {editedData.endDate
                    ? formatDate(editedData.endDate.toISOString())
                    : "Select end date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={editedData.endDate}
                  onSelect={(date) => handleFieldChange("endDate", date)}
                  initialFocus
                  disabled={(date) =>
                    date < (editedData.startDate || new Date())
                  }
                  className="rounded-md border"
                />
              </PopoverContent>
            </Popover>
            {!editedData.endDate && (
              <p className="text-xs text-gray-500 mt-2">
                End date is required for Extended Leave
              </p>
            )}
          </div>
        )}

        {/* View mode end date display */}
        {!isEditing && data.endDate && isExtendedLeave && (
          <div className="rounded-2xl border border-gray-100 bg-gradient-to-br from-purple-50/30 to-white p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              LEAVE END DAY
            </p>
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-[1.4vh] font-bold text-gray-800">
                  {formatDate(data.endDate)}
                </p>
                <p className="text-sm text-gray-600">
                  {getDayName(data.endDate)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {isEditing && (
        <p className="text-xs text-gray-500">
          {isExtendedLeave
            ? "Extended Leave requires both start and end dates"
            : "Hourly/Full Day Leave requires only start date"}
        </p>
      )}
    </div>
  );

  const renderDocument = () => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <Paperclip className="w-4 h-4 text-gray-400" />
          Attached Documents
        </p>
        {data.documentUrl && (
          <span className="text-xs font-medium px-3 py-1 rounded-full bg-[#004368]/10 text-[#004368]">
            Available
          </span>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center hover:border-[#004368]/30 transition-colors">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#004368]/10 to-[#004368]/5 flex items-center justify-center">
                <Upload className="w-6 h-6 text-[#004368]" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">
                  {documentFile?.name || "Upload supporting document"}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Upload image or PDF (Max 5MB)
                </p>
              </div>
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={isUploading}
                />
                <div className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#004368] to-[#003152] text-white text-sm font-medium hover:from-[#005580] hover:to-[#004368] transition-all">
                  {isUploading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Uploading...
                    </div>
                  ) : (
                    "Choose File"
                  )}
                </div>
              </label>
            </div>
          </div>
          {editedData.documentUrl && !documentFile && (
            <p className="text-xs text-gray-500">
              Current document: {editedData.documentUrl.split("/").pop()}
            </p>
          )}
        </div>
      ) : (
        <div
          onClick={data.documentUrl ? handleDownload : undefined}
          className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 ${
            data.documentUrl
              ? "border-[#004368]/20 bg-gradient-to-br from-[#004368]/5 to-white hover:border-[#004368]/30 hover:shadow-lg hover:shadow-[#004368]/10 cursor-pointer active:scale-[0.98]"
              : "border-gray-100 bg-gradient-to-br from-gray-50/50 to-white"
          }`}
        >
          <div className="p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div
                className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${
                  data.documentUrl
                    ? "bg-gradient-to-br from-[#004368]/10 to-[#004368]/5 group-hover:scale-110 transition-transform duration-300"
                    : "bg-gradient-to-br from-gray-100 to-gray-50"
                }`}
              >
                {data.documentUrl ? (
                  <FileText className="w-6 h-6 text-[#004368]" />
                ) : (
                  <FileX className="w-6 h-6 text-gray-400" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-medium truncate ${
                    data.documentUrl ? "text-gray-800" : "text-gray-500"
                  }`}
                >
                  {data.documentUrl
                    ? data.documentUrl.split("/").pop()?.slice(0, 50) ||
                      "Document"
                    : "No document attached"}
                  {data.documentUrl?.split("/").pop()?.length > 50 ? "..." : ""}
                </p>
                <p className="text-xs text-gray-500 mt-1 truncate">
                  {data.documentUrl
                    ? "Click to download"
                    : "No attachment available"}
                </p>
              </div>

              {data.documentUrl && (
                <div className="flex-shrink-0 w-full sm:w-auto mt-4 sm:mt-0">
                  <div className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#004368] to-[#003152] text-white text-sm font-medium group-hover:from-[#005580] group-hover:to-[#004368] transition-all">
                    <Download className="w-4 h-4" />
                    Download
                  </div>
                </div>
              )}
            </div>
          </div>

          {data.documentUrl && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#004368]/20 to-[#004368]/10 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-[#004368] to-[#003152] w-0 group-hover:w-full transition-all duration-500 ease-out" />
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderActionButtons = () => {
    if (isEditing) {
      return (
        <>
          <Button
            onClick={handleEditToggle}
            variant="outline"
            className="sm:w-[50%] py-3"
            disabled={isUploading}
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button
            onClick={handleSaveEdit}
            className="sm:w-[50%] py-3 bg-gradient-to-r from-[#004368] to-[#003152] hover:from-[#005580] hover:to-[#004368]"
            disabled={isUploading}
          >
            {isUploading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </div>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </>
      );
    }

    if (data.status === "pending_leader" || data.status === "pending_admin") {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-3 w-full"
        >
          <button
            onClick={handleReject}
            className="group relative px-6 py-3 text-sm font-semibold text-red-600 bg-gradient-to-br from-red-50 to-white border border-red-100 rounded-2xl hover:border-red-200 hover:shadow-lg hover:shadow-red-100/50 transition-all duration-300 active:scale-[0.98] overflow-hidden sm:w-[50%]"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/5 to-red-500/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <div className="relative flex items-center justify-center gap-3">
              <XCircle className="w-5 h-5" />
              <span>Reject</span>
            </div>
          </button>

          <button
            onClick={handleApprove}
            className="group relative px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-[#004368] to-[#003152] rounded-2xl hover:from-[#005580] hover:to-[#004368] hover:shadow-xl hover:shadow-[#004368]/30 transition-all duration-300 active:scale-[0.98] overflow-hidden sm:w-[50%]"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <div className="relative flex items-center justify-center gap-3">
              <CheckCircle2 className="w-5 h-5" />
              <span>Approve</span>
            </div>
          </button>
        </motion.div>
      );
    }

    return null;
  };

  return (
    <div className="flex flex-col h-full w-full max-w-4xl mx-auto">
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="rounded-3xl border border-gray-100 p-6 bg-white shadow-lg shadow-gray-100/50 backdrop-blur-sm">
          {renderHeader()}

          <div className="space-y-8">
            {renderBasicInfo()}
            {renderDescription()}
            {renderLeaveDetails()}
            {renderDateRange()}
            {renderDocument()}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-6 mt-8 border-t border-gray-100">
            {renderActionButtons()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(LeaveApplicationDetails);
