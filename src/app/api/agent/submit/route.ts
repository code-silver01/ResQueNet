import { NextRequest, NextResponse } from "next/server";
import { submitAfterApproval } from "@/lib/agent/loop";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { requestId } = await req.json();
    if (!requestId) {
      return NextResponse.json({ error: "Missing requestId" }, { status: 400 });
    }

    const emittedSteps: unknown[] = [];
    const emit = (data: Record<string, unknown>) => emittedSteps.push(data);

    const result = await submitAfterApproval(requestId, emit);
    return NextResponse.json({ success: true, result, steps: emittedSteps });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
