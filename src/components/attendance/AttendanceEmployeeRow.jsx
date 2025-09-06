import { MoreHorizontal } from "lucide-react";
import { Checkbox } from "../ui/checkbox";

const AttendanceEmployeeRow = ({ employee, isSelected, onSelect }) => (
  <tr className="hover:bg-gray-50">
    <td className="p-4">
      <Checkbox
        checked={isSelected}
        onCheckedChange={() => onSelect(employee.id)}
        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
      />
    </td>
    <td className="p-4 text-sm text-gray-900">{employee.name}</td>
    <td className="p-4 text-sm text-gray-600">{employee.employeeId}</td>
    <td className="p-4 text-sm text-gray-600">{employee.designation}</td>
    <td className="p-4 text-sm text-gray-600">{employee.department}</td>
    <td className="p-4">
      <button className="text-gray-400 hover:text-gray-600">
        <MoreHorizontal size={16} />
      </button>
    </td>
  </tr>
);

export default AttendanceEmployeeRow;
