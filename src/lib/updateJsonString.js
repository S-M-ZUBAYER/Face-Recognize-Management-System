function updateJsonString(key, newValue) {
  const input = '{"leader":"admin","admin":""}';
  try {
    // Parse the JSON string first
    const obj = JSON.parse(input);

    // Update the key
    obj[key] = newValue;

    // Convert back to JSON string
    return JSON.stringify(obj);
  } catch (error) {
    console.error("Invalid JSON string:", error);
    return input; // fallback
  }
}

export default updateJsonString;
