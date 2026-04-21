/**
 * Utilitaires partagés pour les tests de charge.
 */

export interface RequestResult {
  status: number;
  latencyMs: number;
  error?: string;
}

export async function timedFetch(
  url: string,
  init?: RequestInit
): Promise<RequestResult> {
  const start = performance.now();
  try {
    const res = await fetch(url, init);
    return {
      status: res.status,
      latencyMs: Math.round(performance.now() - start),
    };
  } catch (err) {
    return {
      status: 0,
      latencyMs: Math.round(performance.now() - start),
      error: String(err),
    };
  }
}

export function percentile(values: number[], p: number): number {
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, idx)];
}

export function report(label: string, results: RequestResult[]) {
  const latencies = results.map((r) => r.latencyMs);
  const statuses = results.reduce<Record<number, number>>((acc, r) => {
    acc[r.status] = (acc[r.status] ?? 0) + 1;
    return acc;
  }, {});

  console.log(`\n── ${label} ──`);
  console.log(`  Total requêtes : ${results.length}`);
  console.log(`  Statuts :`, Object.entries(statuses).map(([s, c]) => `${s}=${c}`).join(", "));
  console.log(`  Latence p50 : ${percentile(latencies, 50)}ms`);
  console.log(`  Latence p95 : ${percentile(latencies, 95)}ms`);
  console.log(`  Latence p99 : ${percentile(latencies, 99)}ms`);
  console.log(`  Latence max : ${Math.max(...latencies)}ms`);

  const errors = results.filter((r) => r.error);
  if (errors.length) console.log(`  Erreurs réseau : ${errors.length}`);
}

export function summary(allResults: Record<string, RequestResult[]>) {
  console.log("\n═══════════════════════════════════════");
  console.log("  RÉSUMÉ TESTS DE CHARGE");
  console.log("═══════════════════════════════════════");
  for (const [label, results] of Object.entries(allResults)) {
    const ok = results.filter((r) => r.status >= 200 && r.status < 500).length;
    const rateLimit = results.filter((r) => r.status === 429).length;
    const errors = results.filter((r) => r.status === 0 || r.status >= 500).length;
    const latencies = results.map((r) => r.latencyMs);
    console.log(`  ${label}: ${ok} OK, ${rateLimit} rate-limited, ${errors} erreurs — p95=${percentile(latencies, 95)}ms`);
  }
  console.log("═══════════════════════════════════════\n");
}
