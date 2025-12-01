function extractDepartments(designationArray) {
  const departments = new Set();

  designationArray.forEach((item) => {
    const deptArr = item?.department;

    // Only process if department is an array
    if (Array.isArray(deptArr)) {
      deptArr.forEach((d) => departments.add(d));
    }
  });

  return ["All Employees", ...Array.from(departments)];
}

export default extractDepartments;
