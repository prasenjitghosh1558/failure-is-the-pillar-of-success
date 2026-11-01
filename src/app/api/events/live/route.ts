import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection event
      controller.enqueue(
        encoder.encode(`event: connected\ndata: ${JSON.stringify({ status: "connected", time: new Date().toISOString() })}\n\n`)
      );

      // Heartbeat interval
      const interval = setInterval(() => {
        try {
          const telemetryTick = {
            type: "TELEMETRY_HEARTBEAT",
            timestamp: new Date().toISOString(),
            onlineVehicles: 4,
            activeShipments: 5,
          };
          controller.enqueue(
            encoder.encode(`event: ping\ndata: ${JSON.stringify(telemetryTick)}\n\n`)
          );
        } catch {
          clearInterval(interval);
        }
      }, 10000);

      req.signal.addEventListener("abort", () => {
        clearInterval(interval);
      });
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

