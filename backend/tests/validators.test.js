import {
  isValidPhone,
  isValidEmail,
  isStrongEnoughPassword,
  isValidObjectId,
  isValidScore,
} from "../utils/validators.js";

describe("isValidPhone", () => {
  test("accepts a well-formed Nigerian local number", () => {
    expect(isValidPhone("08031234567")).toBe(true);
  });
  test("accepts a well-formed Nigerian international number", () => {
    expect(isValidPhone("+2348031234567")).toBe(true);
  });
  test("rejects an obviously invalid string", () => {
    expect(isValidPhone("not-a-phone")).toBe(false);
  });
  test("rejects a NoSQL-injection-style object masquerading as a phone", () => {
    expect(isValidPhone({ $gt: "" })).toBe(false);
  });
});

describe("isValidEmail", () => {
  test("accepts a well-formed email", () => {
    expect(isValidEmail("ada@example.com")).toBe(true);
  });
  test("treats an absent email as valid (optional field)", () => {
    expect(isValidEmail(undefined)).toBe(true);
    expect(isValidEmail("")).toBe(true);
  });
  test("rejects a malformed email", () => {
    expect(isValidEmail("not-an-email")).toBe(false);
  });
});

describe("isStrongEnoughPassword", () => {
  test("accepts an 8+ character password containing a number", () => {
    expect(isStrongEnoughPassword("password1")).toBe(true);
  });
  test("rejects a password shorter than 8 characters", () => {
    expect(isStrongEnoughPassword("pass1")).toBe(false);
  });
  test("rejects a password with no digit", () => {
    expect(isStrongEnoughPassword("passwordonly")).toBe(false);
  });
});

describe("isValidObjectId", () => {
  test("accepts a well-formed 24-char hex id", () => {
    expect(isValidObjectId("507f1f77bcf86cd799439011")).toBe(true);
  });
  test("rejects a short/garbage string", () => {
    expect(isValidObjectId("not-an-id")).toBe(false);
  });
  test("rejects a NoSQL-injection-style object", () => {
    expect(isValidObjectId({ $ne: null })).toBe(false);
  });
});

describe("isValidScore", () => {
  test("accepts integers 1 through 5", () => {
    [1, 2, 3, 4, 5].forEach((s) => expect(isValidScore(s)).toBe(true));
  });
  test("rejects 0 and 6", () => {
    expect(isValidScore(0)).toBe(false);
    expect(isValidScore(6)).toBe(false);
  });
  test("rejects a non-numeric value", () => {
    expect(isValidScore("5")).toBe(false);
  });
});
