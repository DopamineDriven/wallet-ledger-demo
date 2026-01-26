/**
 * ValidationService - Input validation utilities
 *
 * Abstract class providing static validation methods for UUIDs, integers, and other input types.
 * Used by WalletResolver for request validation.
 */
export abstract class ValidationService {
  private static readonly uuidRegex =
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;

  /**
   * Validates a string as a valid UUID (versions 1-5)
   */
  public static isValidUuid(value: string): boolean {
    return ValidationService.uuidRegex.test(value);
  }

  /**
   * Validates a value as a positive safe integer (number type only)
   */
  public static isPositiveInteger(value: unknown): value is number {
    return (
      typeof value === "number" &&
      Number.isInteger(value) &&
      value > 0 &&
      Number.isSafeInteger(value)
    );
  }
}
