import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const DEV_EMAIL = "devdevind@gmail.com";
const DEV_PASSWORD = "password";

/**
 * Ensures the dev user exists and is confirmed.
 * Call this when signUp succeeds but no session (email confirmation required).
 * Uses service role to create/confirm the user.
 */
export async function POST() {
  try {
    const supabase = createAdminClient();
    const admin = supabase.auth.admin;

    // Try to create user with email_confirm: true (skips confirmation)
    const { data: createData, error: createError } = await admin.createUser({
      email: DEV_EMAIL,
      password: DEV_PASSWORD,
      email_confirm: true,
    });

    if (createData?.user) {
      return NextResponse.json({ ok: true, created: true });
    }

    // User already exists - find and confirm
    if (createError?.message?.toLowerCase().includes("already") || createError?.message?.toLowerCase().includes("registered")) {
      const { data: listData } = await admin.listUsers({ page: 1, perPage: 1000 });
      const user = listData?.users?.find((u) => u.email === DEV_EMAIL);
      if (user) {
        const { error: updateError } = await admin.updateUserById(user.id, {
          email_confirm: true,
        });
        if (updateError) {
          return NextResponse.json(
            { error: updateError.message },
            { status: 500 }
          );
        }
        return NextResponse.json({ ok: true, confirmed: true });
      }
    }

    return NextResponse.json(
      { error: createError?.message ?? "Failed to prepare dev user" },
      { status: 500 }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    if (msg.includes("SUPABASE_SERVICE_ROLE_KEY")) {
      return NextResponse.json(
        {
          error:
            "Add SUPABASE_SERVICE_ROLE_KEY to .env (from Supabase Dashboard → Settings → API → service_role)",
        },
        { status: 500 }
      );
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
