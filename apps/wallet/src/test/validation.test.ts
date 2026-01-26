import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ValidationService } from "@/services/validation.ts";

const { isValidUuid, isPositiveInteger } = ValidationService;

describe("isValidUuid", () => {
  it("should accept valid lowercase UUID", () => {
    assert.equal(isValidUuid("550e8400-e29b-41d4-a716-446655440000"), true);
  });

  it("should accept valid uppercase UUID", () => {
    assert.equal(isValidUuid("550E8400-E29B-41D4-A716-446655440000"), true);
  });

  it("should accept valid mixed case UUID", () => {
    assert.equal(isValidUuid("550e8400-E29B-41d4-A716-446655440000"), true);
  });

  it("should accept UUID with uppercase variant bits (A, B)", () => {
    assert.equal(isValidUuid("550e8400-e29b-41d4-A716-446655440000"), true);
    assert.equal(isValidUuid("550e8400-e29b-41d4-B716-446655440000"), true);
  });

  it("should reject UUID with invalid variant (0-7, c-f)", () => {
    assert.equal(isValidUuid("550e8400-e29b-41d4-0716-446655440000"), false);
    assert.equal(isValidUuid("550e8400-e29b-41d4-7716-446655440000"), false);
    assert.equal(isValidUuid("550e8400-e29b-41d4-c716-446655440000"), false);
    assert.equal(isValidUuid("550e8400-e29b-41d4-f716-446655440000"), false);
  });

  it("should reject UUID with invalid version (0, 6-9)", () => {
    assert.equal(isValidUuid("550e8400-e29b-01d4-a716-446655440000"), false);
    assert.equal(isValidUuid("550e8400-e29b-61d4-a716-446655440000"), false);
    assert.equal(isValidUuid("550e8400-e29b-91d4-a716-446655440000"), false);
  });

  it("should accept all valid version numbers (1-5)", () => {
    assert.equal(isValidUuid("550e8400-e29b-11d4-a716-446655440000"), true);
    assert.equal(isValidUuid("550e8400-e29b-21d4-a716-446655440000"), true);
    assert.equal(isValidUuid("550e8400-e29b-31d4-a716-446655440000"), true);
    assert.equal(isValidUuid("550e8400-e29b-41d4-a716-446655440000"), true);
    assert.equal(isValidUuid("550e8400-e29b-51d4-a716-446655440000"), true);
  });

  it("should reject UUID one character too short", () => {
    assert.equal(isValidUuid("550e8400-e29b-41d4-a716-44665544000"), false);
  });

  it("should reject UUID one character too long", () => {
    assert.equal(isValidUuid("550e8400-e29b-41d4-a716-4466554400000"), false);
  });

  it("should reject UUID with missing hyphen", () => {
    assert.equal(isValidUuid("550e8400e29b-41d4-a716-446655440000"), false);
  });

  it("should reject UUID with extra hyphen", () => {
    assert.equal(isValidUuid("550e8400-e29b-41d4-a716-4466-55440000"), false);
  });

  it("should reject UUID with invalid characters", () => {
    assert.equal(isValidUuid("550e8400-e29b-41d4-a716-44665544000g"), false);
    assert.equal(isValidUuid("550e8400-e29b-41d4-a716-44665544000z"), false);
    assert.equal(isValidUuid("550e8400-e29b-41d4-a716-44665544000!"), false);
  });

  it("should reject empty string", () => {
    assert.equal(isValidUuid(""), false);
  });

  it("should reject UUID without hyphens", () => {
    assert.equal(isValidUuid("550e8400e29b41d4a716446655440000"), false);
  });
});

describe("isPositiveInteger", () => {
  it("should accept positive integers", () => {
    assert.equal(isPositiveInteger(1), true);
    assert.equal(isPositiveInteger(100), true);
    assert.equal(isPositiveInteger(999999), true);
  });

  it("should reject zero", () => {
    assert.equal(isPositiveInteger(0), false);
  });

  it("should reject negative integers", () => {
    assert.equal(isPositiveInteger(-1), false);
    assert.equal(isPositiveInteger(-100), false);
  });

  it("should reject floats", () => {
    assert.equal(isPositiveInteger(1.5), false);
    assert.equal(isPositiveInteger(100.001), false);
  });

  it("should reject strings", () => {
    assert.equal(isPositiveInteger("1"), false);
    assert.equal(isPositiveInteger("100"), false);
  });

  it("should reject null and undefined", () => {
    assert.equal(isPositiveInteger(null), false);
    assert.equal(isPositiveInteger(undefined), false);
  });

  it("should reject NaN and Infinity", () => {
    assert.equal(isPositiveInteger(NaN), false);
    assert.equal(isPositiveInteger(Infinity), false);
    assert.equal(isPositiveInteger(-Infinity), false);
  });

  it("should reject numbers beyond safe integer range", () => {
    assert.equal(isPositiveInteger(Number.MAX_SAFE_INTEGER + 1), false);
  });

  it("should accept MAX_SAFE_INTEGER", () => {
    assert.equal(isPositiveInteger(Number.MAX_SAFE_INTEGER), true);
  });
});
