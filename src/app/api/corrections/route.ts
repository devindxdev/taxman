import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { entityType, entityId, originalValue, correctedValue } =
      await request.json();

    if (!entityType || !entityId) {
      return NextResponse.json(
        { error: "Missing entityType or entityId" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase.from("user_corrections").insert({
      user_id: user.id,
      entity_type: entityType,
      entity_id: entityId,
      original_value: originalValue ?? null,
      corrected_value: correctedValue ?? null,
    }).select().single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ correction: data });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to save correction" },
      { status: 500 }
    );
  }
}
