/**
 * Utility function to parse a date object to a string in the format "YYYY-MM-DD".
 *
 * @param date - The date object to parse.
 *
 * @returns - The date as a string.
 */
export const parseDate = (input: Date | string): string => {
  const date = typeof input === "string" ? new Date(input) : input;

  return date.toISOString().split("T")[0];
};

/** A diary timestamp is local wall-clock time, never a UTC instant. */
export const parseDiaryDateTime = (input: string): string => {
  const message = "Diary date must be a valid local YYYY-MM-DD HH:mm:ss timestamp";
  if (!/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(input))
    throw new RangeError(message);

  // UTC is used only to validate the calendar fields; the original string is sent.
  const validation = new Date(`${input.replace(" ", "T")}Z`);
  if (
    !Number.isFinite(validation.getTime()) ||
    validation.toISOString().slice(0, 19).replace("T", " ") !== input
  )
    throw new RangeError(message);
  return input;
};
