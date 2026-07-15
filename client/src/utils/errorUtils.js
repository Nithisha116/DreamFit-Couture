// src/utils/errorUtils.js
// Redux thunks in this app reject via rejectWithValue(string), so a caught
// error from `.unwrap()` is usually a plain string, not an Error object.
// This normalizes any shape (string / Error / axios error) into a display string.
export const getErrorMessage = (error, fallback = "Something went wrong") => {
  if (!error) return fallback;
  if (typeof error === "string") return error;
  return (
    error?.response?.data?.message ||
    error?.message ||
    fallback
  );
};
