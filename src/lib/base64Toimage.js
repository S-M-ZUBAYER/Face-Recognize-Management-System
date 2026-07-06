const DEFAULT_AVATAR_URL = "https://i.pravatar.cc/300";

export const base64ToImage = (imageValue, fallbackUrl = DEFAULT_AVATAR_URL) => {
  if (typeof imageValue !== "string") {
    return fallbackUrl;
  }

  const trimmedValue = imageValue.trim();

  if (
    !trimmedValue ||
    trimmedValue === "null" ||
    trimmedValue === "undefined"
  ) {
    return fallbackUrl;
  }

  if (/^(https?:|blob:|\/)/i.test(trimmedValue)) {
    return trimmedValue;
  }

  if (/^data:image\//i.test(trimmedValue)) {
    return trimmedValue;
  }

  const base64Data = trimmedValue.includes(",")
    ? trimmedValue.split(",").pop()
    : trimmedValue;

  try {
    atob(base64Data);
    return `data:image/png;base64,${base64Data}`;
  } catch {
    return fallbackUrl;
  }
};
