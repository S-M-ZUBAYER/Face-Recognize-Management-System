let attendanceArray = [];

export const setAttendanceArray = (data) => {
  attendanceArray = Array.isArray(data) ? data : [];
};

export const getAttendanceArray = () => attendanceArray;

export const getAttendanceByEmployeeAndDateRange = (
  employeeId,
  startDate,
  endDate,
) => {
  return attendanceArray.filter((item) => {
    return (
      String(item.employeeId) === String(employeeId) &&
      item.date >= startDate &&
      item.date <= endDate
    );
  });
};
