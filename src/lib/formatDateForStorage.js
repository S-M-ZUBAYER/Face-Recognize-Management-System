// Format date for storage without timezone issues (YYYY-MM-DD)
const formatDateForStorage = (date) => {
  if (!date) return "";

  // Create date without timezone issues
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default formatDateForStorage;
