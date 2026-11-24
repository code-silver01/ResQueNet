import { NextRequest, NextResponse } from "next/server";
import { extractIncidentWithGemini } from "@/lib/gemini";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();
    if (!text || text.trim().length < 5) {
      return NextResponse.json({ error: "Please enter a descriptive disaster report." }, { status: 400 });
    }

    const extraction = await extractIncidentWithGemini(text);
    return NextResponse.json({ success: true, incident: extraction });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
