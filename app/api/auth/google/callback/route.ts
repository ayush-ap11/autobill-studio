import { NextResponse } from "next/server";
import axios from "axios";
import dbConnect from "@/lib/db";
import Company from "@/models/Company";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI!;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");

    if (!code) {
      return NextResponse.json(
        { error: "Authorization code missing" },
        { status: 400 }
      );
    }

    // 1. Exchange code for tokens
    const tokenRes = await axios.post(
      "https://oauth2.googleapis.com/token",
      new URLSearchParams({
        code,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: "authorization_code",
      }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const { access_token, id_token } = tokenRes.data;

    if (!access_token && !id_token) {
      return NextResponse.json(
        { error: "Failed to obtain access token" },
        { status: 401 }
      );
    }

    // 2. Get user info
    const userInfoRes = await axios.get(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: { Authorization: `Bearer ${access_token}` },
      }
    );

    const { email, name, picture } = userInfoRes.data;

    if (!email) {
      return NextResponse.json(
        { error: "Google account has no email" },
        { status: 400 }
      );
    }

    // 3. Verify company exists & approved
    await dbConnect();
    const company = await Company.findOne({ email }).lean();

    if (!company) {
      return NextResponse.json(
        { error: "Company not found or not registered" },
        { status: 404 }
      );
    }
    if (company.status !== "approved") {
      return NextResponse.json(
        { error: "Company not approved yet" },
        { status: 403 }
      );
    }

    // 4. Sign JWT
    const token = jwt.sign(
      { companyId: company._id.toString(), role: "admin" },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    // 5. Set cookie
    const response = NextResponse.json({
      message: "Login successful",
      token,
      companyId: company._id,
    });
    response.cookies.set({
      name: "auth_token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    });

    return response;
  } catch (err: any) {
    console.error(
      "Google OAuth callback error:",
      err.response?.data || err.message
    );
    return NextResponse.json({ error: "OAuth login failed" }, { status: 500 });
  }
}
