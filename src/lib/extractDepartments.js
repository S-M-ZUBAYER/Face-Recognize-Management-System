function extractDepartments(designationArray) {
  const departments = new Set();

  designationArray.forEach((item) => {
    try {
      const deptArr = item.department;
      deptArr.forEach((d) => departments.add(d));
    } catch {
      console.error("Invalid department format:", item.department);
    }
  });

  // Convert Set to Array and add "All Employees" at the beginning
  return ["All Employees", ...Array.from(departments)];
}

export default extractDepartments;
