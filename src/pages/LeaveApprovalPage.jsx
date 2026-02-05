import React, { useState, useEffect, useMemo, useCallback } from "react";
import LeaveApplicationsList from "@/components/leaveApproval/LeaveApplicationsList";
import LeaveApplicationDetails from "@/components/leaveApproval/LeaveApplicationDetails";
import ExportLeaveToExcel from "@/components/leaveApproval/ExportLeaveToExcel";
import { Search, X, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import useLeaveStore from "@/zustand/useLeaveStore";
import { fetchLeavesData } from "@/utils/leaveServices/LeaveDataService";
import FancyLoader from "@/components/FancyLoader";

const LeaveApprovalPage = () => {
  const [selectedId, setSelectedId] = useState(null);
  const [selectedMacAddress, setSelectedMacAddress] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredLeaves, setFilteredLeaves] = useState([]);
  const [dateRange, setDateRange] = useState({
    from: null,
    to: null,
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true); // start loading
      try {
        await fetchLeavesData(); // fetch data
      } catch (error) {
        console.error("Failed to fetch leaves:", error);
      } finally {
        setIsLoading(false); // stop loading
      }
    };

    loadData();
  }, []);

  const leaves = useLeaveStore((state) => state.leaves);

  // Safe date range setter to handle undefined values
  const handleDateRangeChange = useCallback((range) => {
    setDateRange(range || { from: null, to: null });
  }, []);

  useEffect(() => {
    setFilteredLeaves(leaves);
  }, [leaves]);

  // Memoize the selected application to avoid recalculations
  const selectedApplication = useMemo(
    () =>
      leaves.find(
        (app) => app.id === selectedId && app.deviceMAC === selectedMacAddress,
      ),
    [leaves, selectedId, selectedMacAddress],
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
    [leaves],
  );

  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
  }, []);

  // Apply both search and date filters
  const applyFilters = useCallback(() => {
    let filtered = [...leaves];

    // Apply search filter
    const query = searchQuery.toLowerCase().trim();
    if (query) {
      filtered = filtered.filter((leave) => {
        const employeeName = leave.employeeName?.toLowerCase() || "";
        return employeeName.includes(query);
      });
    }

    // Apply date range filter
    if (dateRange?.from) {
      filtered = filtered.filter((leave) => {
        if (!leave.createdAt) return false;

        const leaveDate = new Date(leave.createdAt);
        const fromDate = new Date(dateRange.from);
        fromDate.setHours(0, 0, 0, 0);

        if (dateRange.to) {
          const toDate = new Date(dateRange.to);
          toDate.setHours(23, 59, 59, 999);
          return leaveDate >= fromDate && leaveDate <= toDate;
        }

        return leaveDate >= fromDate;
      });
    }

    setFilteredLeaves(filtered);
  }, [searchQuery, leaves, dateRange]);

  // Apply filters whenever search query or date range changes
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleSearch = useCallback(() => {
    applyFilters();
  }, [applyFilters]);

  // Clear search
  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
  }, []);

  // Clear date filter
  const handleClearDateFilter = useCallback(() => {
    setDateRange({ from: null, to: null });
  }, []);

  // Clear all filters
  const handleClearAllFilters = useCallback(() => {
    setSearchQuery("");
    setDateRange({ from: null, to: null });
  }, []);

  // Check if any filters are active
  const hasActiveFilters = searchQuery || dateRange?.from;

  if (isLoading) {
    return <FancyLoader />;
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

        <div className="flex items-center gap-3">
          {/* Excel Export Button */}
          <ExportLeaveToExcel
            leaves={filteredLeaves}
            isFiltered={hasActiveFilters}
          />

          {/* Date Range Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={`w-[280px] justify-start text-left font-normal border-[#004368] hover:text-[#8896B4] hover:bg-transparent ${
                  !dateRange?.from && "text-muted-foreground"
                }`}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange?.to ? (
                    <>
                      {format(dateRange.from, "MMM dd, yyyy")} -{" "}
                      {format(dateRange.to, "MMM dd, yyyy")}
                    </>
                  ) : (
                    format(dateRange.from, "MMM dd, yyyy")
                  )
                ) : (
                  <span>Filter by date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={handleDateRangeChange}
                numberOfMonths={2}
                disabled={{ after: new Date() }}
              />
              {dateRange?.from && (
                <div className="p-3 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearDateFilter}
                    className="w-full"
                  >
                    Clear Date Filter
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>

          {/* Search Field */}
          <div className="relative w-80">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 cursor-pointer"
              onClick={handleSearch}
            />
            <input
              type="text"
              placeholder="Search by employee name..."
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none border-[#004368] text-sm"
            />
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Clear All Filters Button */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAllFilters}
              className="text-gray-600 hover:text-gray-900"
            >
              Clear All
            </Button>
          )}
        </div>
      </div>

      {/* Show filter summary */}
      {hasActiveFilters && (
        <div className="mb-4 flex items-center gap-2 text-sm text-gray-600">
          <span>
            Showing {filteredLeaves.length} of {leaves.length} applications
          </span>
          {searchQuery && (
            <span className="px-2 py-1 bg-blue-50 rounded text-blue-700">
              Name: "{searchQuery}"
            </span>
          )}
          {dateRange?.from && (
            <span className="px-2 py-1 bg-blue-50 rounded text-blue-700">
              Date: {format(dateRange.from, "MMM dd")}
              {dateRange?.to && ` - ${format(dateRange.to, "MMM dd")}`}
            </span>
          )}
        </div>
      )}

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
            key={selectedId}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center rounded-lg">
            <p className="text-gray-500">
              {filteredLeaves.length === 0
                ? "No applications match your filters"
                : "Select an application to view details"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaveApprovalPage;
