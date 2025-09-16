import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export function getCompanyId(req: Request): string | null {
  try {
    // 1. Try Authorization header
    const authHeader = req.headers.get("authorization") || "";
    if (authHeader) {
      const [scheme, token] = authHeader.split(" ");
      if (scheme === "Bearer" && token) {
        const payload = jwt.verify(token, JWT_SECRET) as any;
        return payload.companyId || null;
      }
    }

    // 2. Try cookies
    const cookieHeader = req.headers.get("cookie");
    if (cookieHeader) {
      const cookies = Object.fromEntries(
        cookieHeader.split(";").map((c) => {
          const [k, v] = c.trim().split("=");
          return [k, decodeURIComponent(v)];
        })
      );
      if (cookies.auth_token) {
        const payload = jwt.verify(cookies.auth_token, JWT_SECRET) as any;
        return payload.companyId || null;
      }
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Extract and verify JWT payload from Authorization header or cookies
 */
export function getTokenPayload(req: Request): any | null {
  try {
    // 1. Check Authorization header
    const authHeader = req.headers.get("authorization") || "";
    let token: string | undefined;
    if (authHeader) {
      const [scheme, value] = authHeader.split(" ");
      if (scheme === "Bearer" && value) token = value;
    }
    // 2. Fallback to cookie
    if (!token) {
      const cookieHeader = req.headers.get("cookie");
      if (cookieHeader) {
        const cookies = Object.fromEntries(
          cookieHeader.split(";").map((c) => {
            const [key, val] = c.trim().split("=");
            return [key, decodeURIComponent(val)];
          })
        );
        token = cookies.auth_token;
      }
    }
    if (!token) return null;
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}
