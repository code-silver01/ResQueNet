import { NextRequest } from "next/server";
import { runAgentLoop } from "@/lib/agent/loop";
import { seedDatabase } from "@/lib/db/seed";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const incidentId = req.nextUrl.searchParams.get("incidentId");
  if (!incidentId) {
    return new Response("Missing incidentId query param", { status: 400 });
  }

  seedDatabase();

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: Record<string, unknown>) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        } catch {}
      };

      try {
        send({ type: "status", message: "Launching supervised browser agent..." });
        const result = await runAgentLoop(incidentId, send);
        send({ type: "done", result });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        send({ type: "error", message: msg });
      } finally {
        try {
          controller.close();
        } catch {}
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
