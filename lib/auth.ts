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
