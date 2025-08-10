import jwt, { SignOptions } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as string;

/**
 * Generate an access token (short-lived)
 */
export function generateAccessToken(payload: object): string {
  const options: SignOptions = { expiresIn: "15m" }; // 15 minutes
  return jwt.sign(payload, JWT_SECRET, options);
}

/**
 * Generate a refresh token (long-lived)
 */
export function generateRefreshToken(payload: object): string {
  const options: SignOptions = { expiresIn: "30d" }; 
  return jwt.sign(payload, JWT_REFRESH_SECRET, options);
}

/**
 * Verify a token with the provided secret
 */
export function verifyToken(token: string, secret: string): any {
  return jwt.verify(token, secret);
}
