export const updateActivity = () => {
  const now = Date.now();
  localStorage.setItem("lastActivityAt", now.toString());
};

export const checkSessionExpiry = () => {
  const lastActivityAt = localStorage.getItem("lastActivityAt");

  if (!lastActivityAt) {
    return true;
  }

  //   const INACTIVITY_LIMIT = 5 * 60 * 1000; // 5 minutes for testing
  const INACTIVITY_LIMIT = 7 * 24 * 60 * 60 * 1000; // 7 days for production

  const isExpired = Date.now() - Number(lastActivityAt) > INACTIVITY_LIMIT;

  //   console.log(lastActivityAt, INACTIVITY_LIMIT, isExpired);

  if (isExpired) {
    localStorage.removeItem("user");
    localStorage.removeItem("deviceMACs");
    localStorage.removeItem("lastLoginAt");
    localStorage.removeItem("lastActivityAt");
  }

  return isExpired;
};
