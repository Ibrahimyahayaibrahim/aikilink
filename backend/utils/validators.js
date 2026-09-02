import validator from "validator";
import mongoose from "mongoose";

// Centralised input validation so every controller applies the same rules rather than
// re-implementing ad hoc checks. Kept as small, composable pure functions so they can
// be unit-tested directly (see tests/validators.test.js).

export function isValidPhone(phone) {
  if (typeof phone !== "string") return false;
  // Accepts Nigerian mobile numbers in local (0803...) or international (+234803...) form.
  return validator.isMobilePhone(phone, "en-NG");
}

export function isValidEmail(email) {
  if (email === undefined || email === null || email === "") return true; // optional field
  return typeof email === "string" && validator.isEmail(email);
}

// Deliberately balanced for a non-technical Nigerian user base (Section 3.4.2, Usability
// NFR: registration completable in under two minutes): requires length + a number,
// rather than a full symbol/uppercase/lowercase gauntlet that drives up abandonment.
export function isStrongEnoughPassword(password) {
  if (typeof password !== "string") return false;
  return validator.isStrongPassword(password, {
    minLength: 8,
    minLowercase: 0,
    minUppercase: 0,
    minNumbers: 1,
    minSymbols: 0,
  });
}

export function isValidObjectId(id) {
  return typeof id === "string" && mongoose.Types.ObjectId.isValid(id);
}

export function isValidScore(score) {
  return typeof score === "number" && Number.isFinite(score) && score >= 1 && score <= 5;
}

// Express middleware: validates that a route param is a well-formed Mongo ObjectId
// before it ever reaches a controller/query. Rejects malformed or injection-style
// values (e.g. objects sneaked in as query strings) with a clean 400 rather than
// letting a CastError, or worse, an unsanitised value, reach the database layer.
export function validateObjectIdParam(paramName) {
  return (req, res, next) => {
    const value = req.params[paramName];
    if (!isValidObjectId(value)) {
      return res.status(400).json({ message: `Invalid ${paramName}` });
    }
    next();
  };
}
