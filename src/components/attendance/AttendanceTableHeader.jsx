const AttendanceTableHeader = ({
  isAllSelected,
  isIndeterminate,
  onSelectAll,
}) => (
  <thead className="bg-gray-50 border-b border-gray-200">
    <tr>
      <th className="w-12 p-4">
        <input
          type="checkbox"
          checked={isAllSelected}
          ref={(el) => {
            if (el) el.indeterminate = isIndeterminate;
          }}
          onChange={onSelectAll}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
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
        Work Hour
      </th>
      <th className="text-left p-4 text-sm font-medium text-gray-700">
        Overtime
      </th>
      <th className="text-left p-4 text-sm font-medium text-gray-700">
        Action
      </th>
    </tr>
  </thead>
);

export default AttendanceTableHeader;
