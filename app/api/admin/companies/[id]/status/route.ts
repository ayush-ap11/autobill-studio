import { NextResponse } from "next/server";

// This endpoint is disabled: registrations no longer require approval.
export async function PUT() {
  return NextResponse.json(
    {
      error:
        "Company status updates are disabled. Registration is auto-approved.",
    },
    { status: 410 }
  );
}
