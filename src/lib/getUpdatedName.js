function getUpdatedName(serverName, inputName) {
  if (typeof serverName !== "string") return inputName;

  // Match <anything> at the end OR <anything (no closing >)
  const match = serverName.match(/<[^>]*>?$/);
  if (match) {
    return `${inputName}${match[0]}`;
  }

  return inputName;
}

export default getUpdatedName;
