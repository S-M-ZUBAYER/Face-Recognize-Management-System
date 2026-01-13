import React, { useState, useEffect, useMemo, useCallback } from "react";
import LeaveApplicationsList from "@/components/leaveApproval/LeaveApplicationsList";
import LeaveApplicationDetails from "@/components/leaveApproval/LeaveApplicationDetails";
import { useLeaveData } from "@/hook/useLeaveData";
import FancyLoader from "@/components/FancyLoader";
import { Search, X } from "lucide-react";

const LeaveApprovalPage = () => {
  const { leaves, isLoading, error } = useLeaveData();
  const [selectedId, setSelectedId] = useState(null);
  const [selectedMacAddress, setSelectedMacAddress] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredLeaves, setFilteredLeaves] = useState([]);

  useEffect(() => {
    setFilteredLeaves(leaves);
  }, [leaves]);
  // Memoize the selected application to avoid recalculations
  const selectedApplication = useMemo(
    () =>
      leaves.find(
        (app) => app.id === selectedId && app.deviceMAC === selectedMacAddress
      ),
    [leaves, selectedId, selectedMacAddress]
  );

  // Set first leave as selected when data loads
  useEffect(() => {
    if (leaves.length > 0 && !selectedId) {
      const firstValidLeave = leaves.find((leave) => leave?.id) || leaves[0];
      setSelectedId(firstValidLeave?.id);
      setSelectedMacAddress(firstValidLeave.deviceMAC);
    }
  }, [leaves, selectedId]);

  // Handle application selection with validation
  const handleSelectApplication = useCallback(
    (id, macAddress) => {
      if (
        id &&
        leaves.some((app) => app.id === id && app.deviceMAC === macAddress)
      ) {
        setSelectedId(id);
        setSelectedMacAddress(macAddress);
      }
    },
    [leaves]
  );

  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
  }, []);

  const handleSearch = useCallback(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) {
      setFilteredLeaves(leaves);
      return;
    }
    const filtered = leaves.filter((leave) => {
      const employeeName = leave.employeeName?.toLowerCase() || "";
      return employeeName.includes(query);
    });
    setFilteredLeaves(filtered);
  }, [searchQuery, leaves]);
  // Clear search
  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
    setFilteredLeaves(leaves);
  }, [leaves]);

  // Loading state
  if (isLoading) {
    return (
      <div className="p-6">
        <FancyLoader />
      </div>
    );
  }

  // Error state (assuming useLeaveData returns error)
  if (error) {
    return (
      <div className="p-6">
        <p className="text-[22px] font-[600] capitalize font-poppins-regular text-[#1F1F1F] mb-5">
          Leave approval
        </p>
        <div className="flex flex-col items-center justify-center h-[75vh] rounded-lg bg-red-50 border border-red-100">
          <p className="text-red-600 font-medium mb-2">
            Failed to load applications
          </p>
          <p className="text-gray-500 text-sm">
            {error.message || "Please try again later"}
          </p>
        </div>
      </div>
    );
  }

  // Empty state
  if (!leaves.length) {
    return (
      <div className="p-6">
        <p className="text-[22px] font-[600] capitalize font-poppins-regular text-[#1F1F1F] mb-5">
          Leave approval
        </p>
        <div className="flex flex-col items-center justify-center h-[75vh] rounded-lg ">
          <p className="text-gray-500 mb-2">No leave applications found</p>
          <p className="text-gray-400 text-sm">
            All applications have been processed
          </p>
        </div>
      </div>
    );
  }

  // Ensure we have a selected application
  const hasSelectedApplication = selectedApplication && selectedId;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-5">
        <p className="text-[22px] font-[600] capitalize font-poppins-regular text-[#1F1F1F]">
          Leave approval
        </p>

        {/* Search Field */}
        <div className="relative w-80">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4"
            onClick={handleSearch}
          />
          <input
            type="text"
            placeholder="Search by employee name..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-10 py-2 border  rounded-lg focus:outline-none border-[#004368]  text-sm"
          />
          {searchQuery && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" onClick={handleClearSearch} />
            </button>
          )}
        </div>
      </div>

      {/* Search results info */}
      {/* {searchQuery && (
        <div className="mb-3 text-sm text-gray-600">
          {filteredLeaves.length > 0 ? (
            <span>
              Found{" "}
              <span className="font-semibold">{filteredLeaves.length}</span>{" "}
              {filteredLeaves.length === 1 ? "result" : "results"} for "
              {searchQuery}"
            </span>
          ) : (
            <span className="text-red-600">
              No results found for "{searchQuery}"
            </span>
          )}
        </div>
      )} */}
      <div className="h-[75vh] flex gap-4">
        <LeaveApplicationsList
          applications={filteredLeaves}
          selectedId={selectedId}
          selectedMac={selectedMacAddress}
          onSelect={handleSelectApplication}
        />
        {hasSelectedApplication ? (
          <LeaveApplicationDetails
            data={selectedApplication}
            key={selectedId} // Re-mount on selection change
          />
        ) : (
          <div className="flex-1 flex items-center justify-center rounded-lg ">
            <p className="text-gray-500">
              Select an application to view details
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaveApprovalPage;
