const AttendanceTableHeader = () => (
  <thead className="bg-[#E6ECF0]">
    <tr>
      <th className="text-left p-4 text-sm font-medium text-gray-700">
        Select
      </th>
      <th className="text-left p-4 text-sm font-medium text-gray-700">Name</th>
      <th className="text-left p-4 text-sm font-medium text-gray-700">
        Employee ID
      </th>
      <th className="text-left p-4 text-sm font-medium text-gray-700">
        Designation
      </th>
      <th className="text-left p-4 text-sm font-medium text-gray-700">
        Department
      </th>
      <th className="text-left p-4 text-sm font-medium text-gray-700">
        Action
      </th>
    </tr>
  </thead>
);

export default AttendanceTableHeader;
