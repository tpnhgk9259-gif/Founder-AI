/**
 * Helper pour streamer une réponse avec heartbeats.
 * Evite les timeouts Vercel Hobby (10s) en gardant la connexion active.
 *
 * Usage côté API :
 *   return streamWithHeartbeat(async (send) => {
 *     const result = await longOperation();
 *     send(JSON.stringify({ data: result }));
 *   });
 *
 * Usage côté client :
 *   const res = await fetch("/api/...", { method: "POST", body: ... });
 *   const text = await res.text();
 *   const lines = text.split("\n").filter(l => l.startsWith("data: "));
 *   const lastData = lines[lines.length - 1].replace("data: ", "");
 *   const json = JSON.parse(lastData);
 */
export function streamWithHeartbeat(
  work: (send: (data: string) => void) => Promise<void>,
  heartbeatIntervalMs = 3000
): Response {
  const encoder = new TextEncoder();
  let heartbeatTimer: ReturnType<typeof setInterval> | null = null;

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: string) => {
        controller.enqueue(encoder.encode(`data: ${data}\n\n`));
      };

      // Heartbeat pour garder la connexion active
      heartbeatTimer = setInterval(() => {
        controller.enqueue(encoder.encode(`: heartbeat\n\n`));
      }, heartbeatIntervalMs);

      try {
        await work(send);
      } catch (err) {
        send(JSON.stringify({ error: String(err) }));
      } finally {
        if (heartbeatTimer) clearInterval(heartbeatTimer);
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
