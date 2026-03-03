import jwt from "jsonwebtoken";

// Support both old and corrected env names during migration.
const jwtSecret = process.env.JWT_SECRET_KEY || process.env.JWT_SECRETE_KEY;

if (!jwtSecret) {
  throw new Error("Missing JWT secret. Set JWT_SECRET_KEY in environment.");
}

// Token now has expiry to reduce long-lived credential risk.
const generateToken = (userId) =>
  jwt.sign({ userId }, jwtSecret, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

export { generateToken, jwtSecret };
