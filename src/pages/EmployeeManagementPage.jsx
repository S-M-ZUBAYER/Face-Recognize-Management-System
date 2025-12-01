import React, { useMemo, useCallback, memo } from "react";
import EmployeeFilterTabs from "@/components/EmployeeFilterTabs";
import EmployeeManagementTable from "@/components/employeeManagement/EmployeeManagementTable";
import { useDesignation } from "@/hook/useDesignation";
import FancyLoader from "@/components/FancyLoader";
import { useEmployeeStore } from "@/zustand/useEmployeeStore";

// Constants
const ALL_EMPLOYEES_FILTER = "All Employees";

// Memoized components to prevent unnecessary re-renders
const PageHeader = memo(() => (
  <h1 className="text-[22px] font-[600] capitalize font-poppins-regular text-[#1F1F1F] px-4 pt-4">
    Employee Management
  </h1>
));

PageHeader.displayName = "PageHeader";

const EmployeeManagementContent = memo(
  ({ activeFilter, onFilterChange, designation, filteredEmployees }) => (
    <div className="p-4 space-y-4">
      <EmployeeFilterTabs
        filters={designation}
        activeFilter={activeFilter}
        onFilterChange={onFilterChange}
      />
      <EmployeeManagementTable employees={filteredEmployees} />
    </div>
  )
);

EmployeeManagementContent.displayName = "EmployeeManagementContent";

function EmployeeManagementPage() {
  const [activeFilter, setActiveFilter] = React.useState(ALL_EMPLOYEES_FILTER);

  const { employees } = useEmployeeStore();
  const Employees = employees();
  const { designation, isLoading: managementLoading } = useDesignation();

  // Memoized filter handler
  const handleFilterChange = useCallback((filter) => {
    setActiveFilter(filter);
  }, []);

  // Memoized filtered employees calculation
  const filteredEmployees = useMemo(() => {
    if (!Employees || !Array.isArray(Employees)) return [];

    return activeFilter === ALL_EMPLOYEES_FILTER
      ? Employees
      : Employees.filter((emp) => emp.department === activeFilter);
  }, [Employees, activeFilter]);

  // Memoized loading state
  const isLoading = useMemo(() => managementLoading, [managementLoading]);

  // Early return for loading state
  if (isLoading) {
    return <FancyLoader />;
  }

  // Early return for no data
  if (!Employees || Employees.length === 0) {
    return (
      <div className="p-4 space-y-4">
        <PageHeader />
        <div className="flex items-center justify-center h-64 text-gray-500">
          No employee data available
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <PageHeader />
      <EmployeeManagementContent
        activeFilter={activeFilter}
        onFilterChange={handleFilterChange}
        designation={designation}
        filteredEmployees={filteredEmployees}
      />
    </div>
  );
}

// Export memoized component
export default memo(EmployeeManagementPage);
