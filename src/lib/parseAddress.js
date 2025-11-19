// Helper function to parse address
const parseAddress = (address) => {
  if (typeof address === "string") {
    try {
      return JSON.parse(address) || address;
    } catch {
      return address;
    }
  }
  return address || "";
};

export default parseAddress;
