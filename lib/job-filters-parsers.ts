import { parseAsArrayOf, parseAsInteger, parseAsString } from "nuqs/server";

export const jobFiltersParsers = {
  stack: parseAsArrayOf(parseAsString).withDefault([]),
  salary_min: parseAsInteger,
  mode: parseAsString,
  level: parseAsString,
  city: parseAsString,
  q: parseAsString,
};
