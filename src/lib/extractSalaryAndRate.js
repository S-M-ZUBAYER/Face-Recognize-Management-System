const extractSalaryAndRate = (input) => {
  try {
    const obj = JSON.parse(input);

    return {
      salary: obj.salary || null,
      hourlyRate: obj.hourlyRate || null,
    };
  } catch {
    return String(input);
  }
};
export default extractSalaryAndRate;
