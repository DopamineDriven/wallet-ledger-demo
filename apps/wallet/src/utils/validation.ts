const UUID_REGEX =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;

export function isValidUuid(value: string): boolean {
  return UUID_REGEX.test(value);
}

export function isPositiveInteger(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value > 0 &&
    Number.isSafeInteger(value)
  );
}
