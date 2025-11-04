import { NextResponse } from "next/server";
import axios from "axios";
import dbConnect from "@/lib/db";
import { Owner } from "@/models/Owner";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const SUPERADMIN_REDIRECT_URI =
  process.env.GOOGLE_SUPERADMIN_REDIRECT_URI ||
  "http://localhost:3000/api/auth/superadmin/google/callback";

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
        redirect_uri: SUPERADMIN_REDIRECT_URI,
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

    const { email, name } = userInfoRes.data;

    if (!email) {
      return NextResponse.json(
        { error: "Google account has no email" },
        { status: 400 }
      );
    }

    // 3. Check if super admin exists with this email
    await dbConnect();

    let superAdmin = await Owner.findOne({ email, role: "superAdmin" });

    if (!superAdmin) {
      return NextResponse.json(
        {
          error:
            "SuperAdmin not found. Please register first with email/password at /api/auth/superadmin/register",
        },
        { status: 404 }
      );
    }

    // 4. Update googleId if not set
    if (!superAdmin.googleId) {
      superAdmin.googleId = userInfoRes.data.sub || userInfoRes.data.id;
      await superAdmin.save();
    }

    // 5. Generate JWT token
    const token = jwt.sign(
      {
        userId: superAdmin._id.toString(),
        role: "superAdmin",
      },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    // 6. Set cookie and return response
    const response = NextResponse.json({
      message: "SuperAdmin login successful via Google",
      token,
      role: "superAdmin",
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
      "SuperAdmin Google OAuth callback error:",
      err.response?.data || err.message
    );
    return NextResponse.json({ error: "OAuth login failed" }, { status: 500 });
  }
}
