import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/supabase/queries";

export async function GET() {
  const result = await getCurrentUser();
  if (!result?.profile) return NextResponse.json(null, { status: 404 });
  return NextResponse.json(result.profile);
}
