import jwt from "jsonwebtoken";

// Generate access & refresh tokens and set cookie
export const generateToken = (res, userId) => {
  if (!process.env.ACCESS_TOKEN_SECRET || !process.env.REFRESH_TOKEN_SECRET) {
    throw new Error("ACCESS_TOKEN_SECRET or REFRESH_TOKEN_SECRET missing in .env");
  }

  // 1️⃣ Access Token (short-lived)
  const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });

  // 2️⃣ Refresh Token (long-lived)
  const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });

  // 3️⃣ Set Refresh Token as HTTP-only cookie
  res.cookie("jwt", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  // 4️⃣ Return Access Token (frontend uses this)
  return accessToken;
};
