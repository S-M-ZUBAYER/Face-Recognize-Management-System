import { Checkbox } from "../ui/checkbox";

const AttendanceEmployeeRow = ({ employee, isSelected, onSelect }) => (
  <tr className="hover:bg-gray-50">
    <td className="sticky left-0 z-10 bg-white p-4">
      <Checkbox
        checked={isSelected}
        onCheckedChange={() => onSelect(employee.id)}
      />
    </td>
    <td className="sticky left-[2vw] z-10 bg-white p-8 text-sm text-gray-600 text-nowrap">
      {employee.punch.date}
    </td>
    <td className="sticky left-[8vw] z-10 bg-white p-8 text-sm text-gray-900">
      {employee.name.split("<")[0] || ""}
    </td>
    <td className="p-4 text-sm text-gray-600">{employee.employeeId}</td>
    <td className="p-4 text-sm text-gray-600">{employee.designation}</td>
    <td className="p-4 text-sm text-gray-600">{employee.department}</td>
    {employee.punch.checkIn.map((item, index) => (
      <td className="p-4 text-sm text-gray-600" key={index}>
        {item}
      </td>
    ))}
  </tr>
);

export default AttendanceEmployeeRow;
