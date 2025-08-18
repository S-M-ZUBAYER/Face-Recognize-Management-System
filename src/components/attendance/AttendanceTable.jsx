import AttendanceTableHeader from "./AttendanceTableHeader";
import AttendanceEmployeeRow from "./AttendanceEmployeeRow";

const AttendanceTable = ({
  employees,
  selectedEmployees,
  onSelectAll,
  onSelectEmployee,
  showOvertime = true,
}) => {
  const isAllSelected =
    selectedEmployees.length === employees.length && employees.length > 0;
  const isIndeterminate =
    selectedEmployees.length > 0 && selectedEmployees.length < employees.length;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <AttendanceTableHeader
            isAllSelected={isAllSelected}
            isIndeterminate={isIndeterminate}
            onSelectAll={onSelectAll}
          />
          <tbody className="divide-y divide-gray-200">
            {employees.length > 0 ? (
              employees.map((employee) => (
                <AttendanceEmployeeRow
                  key={employee.employeeId}
                  employee={employee}
                  isSelected={selectedEmployees.includes(employee.employeeId)}
                  onSelect={onSelectEmployee}
                  showOvertime={showOvertime}
                />
              ))
            ) : (
              <tr>
                <td colSpan="8" className="p-8 text-center text-gray-500">
                  No employees found for this filter
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendanceTable;
