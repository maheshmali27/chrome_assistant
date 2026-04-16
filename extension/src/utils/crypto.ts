export const hashPasscode = async (passcode: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(passcode);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

export const verifyPasscode = async (
  passcode: string,
  storedHash: string,
): Promise<boolean> => {
  const hash = await hashPasscode(passcode);
  return hash === storedHash;
};

/** Decode JWT payload without verification (just to read `exp`) */
export const decodeJwtExpiry = (token: string): number | null => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return typeof payload.exp === "number" ? payload.exp : null;
  } catch {
    return null;
  }
};

export const isTokenExpired = (token: string): boolean => {
  const exp = decodeJwtExpiry(token);
  if (!exp) return true;
  return Date.now() / 1000 > exp;
};
